import { ProductDocument } from "../../../domain/models/product";
import {
  AddProduct,
  AddProductModel,
} from "../../../domain/usecases/add-product";
import { ConflictError } from "../../../presentation/errors";
import { ProductRepository } from "./db-add-product-protocols";

export class DbAddProduct implements AddProduct {
  private readonly addProductRepository: ProductRepository;

  constructor(addProductRepository: ProductRepository) {
    this.addProductRepository = addProductRepository;
  }

  async add(productData: AddProductModel): Promise<ProductDocument | null> {
    //  Check if a product with the same name exists
    const existingProduct = await this.addProductRepository.findByName(
      productData.name
    );

    if (existingProduct) {
      throw new ConflictError({
        message: "Product with this name already exists",
        resource: "product",
        metadata: { productName: productData.name },
      });
    }

    //  Save the product
    return await this.addProductRepository.add(productData);
  }
}
