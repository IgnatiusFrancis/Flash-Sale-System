import { ProductDocument } from "../../../domain/models/product";
import {
  AddProduct,
  AddProductModel,
} from "../../../domain/usecases/add-product";
import { ProductRepository } from "./db-add-product-protocols";
//import { AddProductRepository } from "../../protocols/add-product-repository";

export class DbAddProduct implements AddProduct {
  private readonly addProductRepository: ProductRepository;

  constructor(addProductRepository: ProductRepository) {
    this.addProductRepository = addProductRepository;
  }

  async add(productData: AddProductModel): Promise<ProductDocument | null> {
    // 🔍 Check if a product with the same name exists
    const existingProduct = await this.addProductRepository.findByName(
      productData.name
    );
    if (existingProduct) {
      return null;
    }

    // ✅ Save the product (no need to manually set availableUnits)
    return await this.addProductRepository.add(productData);
  }
}
