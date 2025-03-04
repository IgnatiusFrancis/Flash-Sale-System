//repositories/flashSale.ts
import { FlashSaleRepository } from "../../../data/protocols/flashSale-repository";
import {
  FlashSaleDocument,
  FlashSaleModel,
  FlashSaleStatus,
} from "../../../domain/models/flashSale";
import { ProductModel } from "../../../domain/models/product";
import { AddFlashSaleModel } from "../../../domain/usecases/add-flash-sale";
import {
  ConflictError,
  ExternalServiceError,
  NotFoundError,
} from "../../../presentation/errors";
import logger from "../../../utils/logger";
import { DistributedLock } from "../../cache";
//import { io } from "../../webSocket";

export class FlashSaleMongoRepository implements FlashSaleRepository {
  async add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument> {
    try {
      //  Check if product exists
      const existingProduct = await ProductModel.findById(saleData.productId);

      if (!existingProduct) {
        throw new NotFoundError({
          message: "Product not found",
          resource: "user",
          code: "PRODUCT_NOT_FOUND",
          metadata: { productId: saleData.productId },
        });
      }

      //  Ensure no active flash sale exists for this product
      const existingFlashSale = await FlashSaleModel.findOne({
        product: saleData.productId,
        status: FlashSaleStatus.ACTIVE,
      });

      if (existingFlashSale) {
        throw new ConflictError({
          message: "A flash sale is already active for this product",
          resource: "flashSale",
          metadata: { flashSale: existingFlashSale },
        });
      }
      console.log(saleData);
      // Save the flash sale
      const flashSale = new FlashSaleModel({
        ...saleData,
      });
      const savedSale = await flashSale.save();

      console.log("✅ Flash Sale Created:");

      // ✅ Emit real-time update if sale starts immediately
      if (savedSale.status === FlashSaleStatus.ACTIVE) {
        //io.emit("flashSaleStarted", savedSale);
        console.log(`🚀 Flash Sale started for product ${saleData.productId}`);
      } else {
        console.log(`📅 Flash Sale scheduled for ${saleData.startTime}`);
      }

      return savedSale;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }

      // Log other database errors
      logger.error({
        message: "Database error while creating sale",
        error: error instanceof Error ? error.message : String(error),
        operation: "flashSaleMongoRepository.findById",
        data: { flashSale: saleData },
      });

      throw new ExternalServiceError({
        message: "Failed to create sale",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async findFlashSaleByProductId(
    productId: string
  ): Promise<FlashSaleDocument | null> {
    try {
      return await FlashSaleModel.findOne({
        productId,
        active: true,
      });
    } catch (error) {
      // Handle MongoDB validation/cast errors (invalid ObjectId)
      if (error.name === "CastError" && error.kind === "ObjectId") {
        throw new NotFoundError({
          message: "Product not found - Invalid ID format",
          resource: "product",
          code: "INVALID_PRODUCT_ID",
          metadata: { productId: productId },
        });
      }

      // Log other database errors
      logger.error({
        message: "Database error while finding flashSale by ProductID",
        error: error instanceof Error ? error.message : String(error),
        operation: "ProductMongoRepository.findById",
        data: { productId: productId },
      });

      throw new ExternalServiceError({
        message: "Failed to retrieve product information",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async findFlashSaleById(id: string): Promise<FlashSaleDocument | null> {
    try {
      return await FlashSaleModel.findById(id);
    } catch (error) {
      // Handle MongoDB validation/cast errors (invalid ObjectId)
      if (error.name === "CastError" && error.kind === "ObjectId") {
        throw new NotFoundError({
          message: "flash sale not found - Invalid ID format",
          resource: "flash sale",
          code: "INVALID_ID",
          metadata: { id },
        });
      }

      // Log other database errors
      logger.error({
        message: "Database error while finding flashSale by Id",
        error: error instanceof Error ? error.message : String(error),
        operation: "FlashSaleMongoRepository.findById",
        data: { id },
      });

      throw new ExternalServiceError({
        message: "Failed to retrieve flash sale information",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async decrementStock(
    flashSaleId: string,
    quantity: number
  ): Promise<FlashSaleDocument | null> {
    // Create a lock specifically for this flash sale's inventory
    const lock = new DistributedLock(`flashSale:${flashSaleId}:inventory`, 5);

    try {
      // Try to acquire the lock (will wait up to 5 seconds by default)
      const acquired = await lock.acquire();
      console.log("acquired:", acquired, flashSaleId, quantity);

      if (!acquired) {
        logger.warn({
          message: "Could not acquire lock for inventory update",
          data: { flashSaleId, quantity },
        });

        // Return null to indicate operation couldn't be performed
        return null;
      }

      // This is the critical part for race condition prevention
      // Use MongoDB's atomic findOneAndUpdate with conditions to prevent over-selling

      const updatedFlashSale = await FlashSaleModel.findOneAndUpdate(
        {
          _id: flashSaleId,
          status: FlashSaleStatus.ACTIVE,
          availableUnits: { $gte: quantity }, // Ensure enough stock remains
        },
        {
          $inc: { availableUnits: -quantity }, // Atomic decrement
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators
        }
      );
      console.log("updatedFlashSale:", updatedFlashSale);
      if (updatedFlashSale && updatedFlashSale.availableUnits === 0) {
        // Update status to SOLD_OUT if stock reaches zero
        updatedFlashSale.status = FlashSaleStatus.ENDED;
        await updatedFlashSale.save();

        // Emit event for real-time updates
        //io.emit("flashSaleSoldOut", updatedFlashSale);
        console.log(`🚫 Flash Sale ${flashSaleId} sold out!`);
      }

      return updatedFlashSale;
    } catch (error) {
      logger.error({
        message: "Database error while decrementing stock",
        error: error instanceof Error ? error.message : String(error),
        operation: "FlashSaleMongoRepository.decrementStock",
        data: { flashSaleId, quantity },
      });

      throw new ExternalServiceError({
        message: "Failed to update flash sale stock",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    } finally {
      // Always try to release the lock
      await lock.release();
    }
  }
}
