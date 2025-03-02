import { ProductRepository } from "../../../data/protocols/product-repository";
import { ProductDocument, ProductModel } from "../../../domain/models/product";
import { AddProductModel } from "../../../domain/usecases/add-product";
import {
  ConflictError,
  ExternalServiceError,
  NotFoundError,
} from "../../../presentation/errors";
import logger from "../../../utils/logger";

export class ProductMongoRepository implements ProductRepository {
  async add(productData: AddProductModel): Promise<ProductDocument | null> {
    try {
      const existingProduct = await ProductModel.findOne({
        name: productData.name,
      });

      if (existingProduct) {
        throw new ConflictError({
          message: "Product with name already exists",
          resource: "product",
          metadata: { name: productData.name },
        });
      }

      const product = new ProductModel(productData);
      const savedProduct = await product.save();

      return savedProduct;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      // Log the database error with details
      logger.error({
        message: "Database error while saving account",
        error: error instanceof Error ? error.message : String(error),
        operation: "ProductMongoRepository.add",
        data: { name: productData.name },
      });

      throw new ExternalServiceError({
        message: "Failed to create product due to database error",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async findByName(name: string): Promise<ProductDocument | null> {
    try {
      return await ProductModel.findOne({ name });
    } catch (error) {
      logger.error({
        message: "Database error while finding product by name",
        error: error instanceof Error ? error.message : String(error),
        operation: "ProductMongoRepository.findByName",
        data: { name },
      });

      throw new ExternalServiceError({
        message: "Failed to retrieve product information",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async findById(id: string): Promise<ProductDocument | null> {
    try {
      const product = await ProductModel.findById(id);

      if (!product) {
        throw new NotFoundError({
          message: "Product not found",
          resource: "product",
          code: "PRODUCT_NOT_FOUND",
          metadata: { productId: id },
        });
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      // Handle MongoDB validation/cast errors (invalid ObjectId)
      if (error.name === "CastError" && error.kind === "ObjectId") {
        throw new NotFoundError({
          message: "Product not found - Invalid ID format",
          resource: "product",
          code: "INVALID_PRODUCT_ID",
          metadata: { productId: id },
        });
      }

      // Log other database errors
      logger.error({
        message: "Database error while finding product by ID",
        error: error instanceof Error ? error.message : String(error),
        operation: "ProductMongoRepository.findById",
        data: { productId: id },
      });

      throw new ExternalServiceError({
        message: "Failed to retrieve product information",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}
