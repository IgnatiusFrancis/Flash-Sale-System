import mongoose from "mongoose";
import { ExternalServiceError } from "../../../presentation/errors";
import logger from "../../../utils/logger";
import {
  PurchaseDocument,
  PurchaseModel,
} from "../../../domain/models/purchase";
import { PurchaseRepository } from "../../../data/protocols/purchase-repository";
import { AddPurchaseModel } from "../../../domain/usecases/add-purchase";
import {
  FlashSaleModel,
  FlashSaleStatus,
} from "../../../domain/models/flashSale";
import { broadcastFlashSaleEnded, broadcastStockUpdate } from "../../webSocket";
import { DistributedLock } from "../../cache";

export class PurchaseMongoRepository implements PurchaseRepository {
  async purchaseProduct(
    purchaseData: AddPurchaseModel
  ): Promise<PurchaseDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();
    //Create a lock specifically for this flash sale's inventory
    const lock = new DistributedLock(
      `flashSale:${purchaseData.flashSaleId}:inventory`,
      5
    );
    try {
      // Try to acquire the lock (will wait up to 5 seconds by default)
      const acquired = await lock.acquire();
      //   console.log("acquired:", acquired, "qty:", purchaseData.quantity);

      if (!acquired) {
        logger.warn({
          message: "Could not acquire lock for inventory update",
          data: {
            purchase: purchaseData.flashSaleId,
            quantity: purchaseData.quantity,
          },
        });

        // Return null to indicate operation couldn't be performed
        return null;
      }
      // **Log initial stock**
      const initialStock = await FlashSaleModel.findById(
        purchaseData.flashSaleId
      ).session(session);
      console.log(
        `Before purchase: ${purchaseData.flashSaleId}, PurchaseQty: ${purchaseData.quantity}, availableUnits=${initialStock?.availableUnits}`
      );

      // **Decrement stock atomically**
      const updatedFlashSale = await FlashSaleModel.findOneAndUpdate(
        {
          _id: purchaseData.flashSaleId,
          status: FlashSaleStatus.ACTIVE,
          availableUnits: { $gte: purchaseData.quantity }, // Ensure enough stock
        },
        { $inc: { availableUnits: -purchaseData.quantity } }, // Atomic decrement
        { new: true, runValidators: true, session } // Ensure session is applied
      );

      // **Verify new stock**
      const updatedFlash = await FlashSaleModel.findById(
        purchaseData.flashSaleId
      ).session(session);
      console.log(
        `After purchase: ${purchaseData.flashSaleId} availableUnits=${updatedFlash?.availableUnits}`
      );

      // **Ensure updated stock is correct**
      if (!updatedFlashSale || updatedFlashSale.availableUnits < 0) {
        console.log(
          "error:",
          updatedFlashSale,
          updatedFlashSale.availableUnits
        );
        throw new ExternalServiceError({
          message: "Invalid stock update detected!",
          service: "MongoDB",
          metadata: { flashSaleId: purchaseData.flashSaleId },
        });
      }

      // **Record purchase**
      const purchase = new PurchaseModel({
        user: purchaseData.userId,
        flashSaleId: purchaseData.flashSaleId,
        quantity: purchaseData.quantity,
        purchasedAt: new Date(),
      });

      const savedPurchase = await purchase.save({ session });

      // **Commit transaction**
      await session.commitTransaction();

      // **END SALE IF STOCK IS ZERO**
      if (updatedFlashSale.availableUnits === 0) {
        await FlashSaleModel.findByIdAndUpdate(
          purchaseData.flashSaleId,
          { status: FlashSaleStatus.ENDED },
          { new: true }
        );

        await broadcastFlashSaleEnded(purchaseData.flashSaleId, "sold-out");
      }

      // **Emit stock update after transaction is fully committed**
      await broadcastStockUpdate(purchaseData.flashSaleId);
      return savedPurchase;
    } catch (error) {
      //await session.abortTransaction();

      if (session.inTransaction()) {
        await session.abortTransaction(); // Only abort if transaction is still active
      }

      logger.error({
        message: "Transaction failed while purchasing product",
        error: error instanceof Error ? error.message : String(error),
        operation: "PurchaseMongoRepository.purchaseProduct",
        data: { purchaseData },
      });

      throw new ExternalServiceError({
        message: "Failed to complete purchase transaction",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    } finally {
      session.endSession(); // Always close session in finally
      // Always try to release the lock
      await lock.release();
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
