import { ProductRepository } from "../../../data/protocols/product-repository";
import { ProductDocument, ProductModel } from "../../../domain/models/product";
import { AddProductModel } from "../../../domain/usecases/add-product";

export class ProductMongoRepository implements ProductRepository {
  async add(productData: AddProductModel): Promise<ProductDocument> {
    try {
      const product = new ProductModel(productData);
      return await product.save();
    } catch (error) {
      throw new Error("Database error while saving product");
    }
  }

  async findByName(name: string): Promise<ProductDocument | null> {
    try {
      return await ProductModel.findOne({ name });
    } catch (error) {
      throw new Error("Database error while fetching product by name");
    }
  }
}
