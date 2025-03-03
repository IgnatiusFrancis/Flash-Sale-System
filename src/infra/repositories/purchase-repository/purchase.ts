import { ExternalServiceError } from "../../../presentation/errors";
import logger from "../../../utils/logger";
import {
  PurchaseDocument,
  PurchaseModel,
} from "../../../domain/models/purchase";
import { PurchaseRepository } from "../../../data/protocols/purchase-repository";
import { AddPurchaseModel } from "../../../domain/usecases/add-purchase";

export class PurchaseMongoRepository implements PurchaseRepository {
  async purchaseProduct(
    purchaseData: AddPurchaseModel
  ): Promise<PurchaseDocument> {
    try {
      // Record purchase
      const purchase = new PurchaseModel({
        userId: purchaseData.userId,
        flashSaleId: purchaseData.flashSaleId,
        quantity: purchaseData.quantity,
        purchasedAt: new Date(),
      });

      const savedPurchase = await purchase.save();

      return savedPurchase;
    } catch (error) {
      logger.error({
        message: "Database error while recording purchase",
        error: error instanceof Error ? error.message : String(error),
        operation: "ProductMongoRepository.add",
        data: { purchaseData: purchaseData },
      });

      throw new ExternalServiceError({
        message: "Failed to record purchase due to database error",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async getTotalPurchasesByUser(
    flashSaleId: string,
    userId: string
  ): Promise<number> {
    try {
      const purchases = await PurchaseModel.find({ flashSaleId, userId });
      return purchases.reduce(
        (total: number, purchase) => total + purchase.quantity,
        0
      );
    } catch (error) {
      logger.error({
        message: "Database error while getting user purchase total",
        error: error instanceof Error ? error.message : String(error),
        operation: "PurchaseMongoRepository.getTotalPurchasesByUser",
        data: { flashSaleId, userId },
      });

      throw new ExternalServiceError({
        message: "Failed to retrieve user purchase information",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}
