import { flashSaleRepository } from "../../../data/protocols/flashSale-repository";
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
//import { io } from "../../webSocket";

export class FlashSaleMongoRepository implements flashSaleRepository {
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

  async findFlashSale(productId: string): Promise<FlashSaleDocument | null> {
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
}
