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
import { ObjectId } from "mongodb";

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

  public async getLeaderBoard(
    flashSaleId: string,
    skip: number,
    limit: number
  ) {
    interface UserType {
      _id: ObjectId;
      name: string;
      email: string;
    }
    try {
      // Fetch transactions, sorted by purchase time
      const purchases = await PurchaseModel.find({
        flashSaleId,
      })
        .sort({ purchasedAt: 1 })
        .select("user purchasedAt")
        .populate({
          path: "user",
          select: "name email",
        })
        .lean();

      // Track first purchase time and total purchase count per user
      const userStats = new Map<
        string,
        { firstPurchase: Date; totalPurchases: number; user: UserType }
      >();

      purchases.forEach((purchase) => {
        if (!purchase.user) {
          console.warn("Skipping purchase with missing user:", purchase);
          return;
        }

        // Force TypeScript to recognize `user` as a proper object
        const user = purchase.user as unknown as UserType;
        const userId = user._id.toString();

        if (!userStats.has(userId)) {
          userStats.set(userId, {
            firstPurchase: purchase.purchasedAt,
            totalPurchases: 1,
            user,
          });
        } else {
          userStats.get(userId)!.totalPurchases += 1;
        }
      });

      // Convert map to array and apply pagination
      // Sort by first purchase
      const leaderboard = Array.from(userStats.entries())
        .sort(
          (a, b) => a[1].firstPurchase.getTime() - b[1].firstPurchase.getTime()
        )
        .slice(skip, skip + limit)
        .map(([userId, data], index) => ({
          rank: skip + index + 1,
          name: data.user.name,
          email: data.user.email,
          totalPurchases: data.totalPurchases,
          userId: data.user._id,
        }));

      return leaderboard;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw new Error("Failed to fetch leaderboard");
    }
  }
}
