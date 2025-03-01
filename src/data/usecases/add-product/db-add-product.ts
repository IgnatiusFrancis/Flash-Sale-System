// import { ProductDocument } from "../../../domain/models/product";
// import { AddProduct, AddProductModel } from "../../../domain/usecases/add-product";
// import { AddProductRepository } from "../../protocols/add-product-repository";

import {
  AddProduct,
  AddProductModel,
  ProductDocument,
  ProductRepository,
} from "./db-add-product-protocols";

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
      return null; // Prevent duplicate products
    }

    // ✅ Save the product (no need to manually set availableUnits)
    return await this.addProductRepository.add(productData);
  }
}
