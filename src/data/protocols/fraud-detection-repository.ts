import { TransactionDocument } from "../../domain/models/transaction";

export interface FraudDetectionRepository {
  processTransaction(
    transactionData: Partial<TransactionDocument>
  ): Promise<TransactionDocument>;
}
