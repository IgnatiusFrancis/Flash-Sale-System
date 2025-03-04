import { FraudDetectionRepository } from "../../../data/protocols/fraud-detection-repository";
import {
  TransactionDocument,
  TransactionModel,
  TransactionStatus,
} from "../../../domain/models/transaction";
import { ExternalServiceError } from "../../../presentation/errors";
import logger from "../../../utils/logger";

export class FraudDetectionMongoRepository implements FraudDetectionRepository {
  private async detectFraud(
    transactionData: Partial<TransactionDocument>
  ): Promise<number> {
    let fraudScore = 0;

    // 1. Check for rapid successive purchases
    const recentTransactions = await TransactionModel.find({
      userId: transactionData.userId,
      // Last 10 minutes
      timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    }).sort({ timestamp: -1 });

    // console.log("recentTransactions:", recentTransactions);
    // If more than 3 purchases in the last 5 minutes, increase fraud score
    if (recentTransactions.length > 3) {
      fraudScore += 30;
    }

    // 2. Check for purchases from multiple IP addresses
    //collects all unique IP addresses used by the user for recent purchases.
    // If the user has made purchases from more than 2 different IPs, it adds 40 points to the fraud
    const uniqueIPs = new Set(recentTransactions.map((t) => t.ipAddress));

    if (uniqueIPs.size > 2) {
      fraudScore += 40;
    }

    // Count how many purchases were made from the same IP
    const ipCount = recentTransactions.filter(
      (t) => t.ipAddress === transactionData.ipAddress
    ).length;

    // Too many purchases from the same IP in 10 minutes
    if (ipCount > 3) {
      fraudScore += 30;
    }

    // 3. Check for unusual quantity
    if (transactionData.amount && transactionData.amount > 3) {
      // Arbitrary threshold
      fraudScore += 20;
    }

    return fraudScore;
  }

  // Process transaction and determine if it should be flagged
  async processTransaction(
    transactionData: Partial<TransactionDocument>
  ): Promise<TransactionDocument> {
    try {
      // Calculate fraud score
      const fraudScore = await this.detectFraud(transactionData);

      // Create transaction with fraud score
      const transaction = new TransactionModel({
        ...transactionData,
        fraudScore,
        status:
          fraudScore >= 70
            ? TransactionStatus.FLAGGED
            : TransactionStatus.COMPLETED,
      });

      return await transaction.save();
    } catch (error) {
      // Log the database error with details
      logger.error({
        message: "Database error while recording transaction",
        error: error instanceof Error ? error.message : String(error),
        operation: "FraudDetectionRepository.detect",
        data: { transactionData: transactionData },
      });

      throw new ExternalServiceError({
        message: "Failed to create transaction due to database error",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}
