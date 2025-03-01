import { ProductDocument } from "../../domain/models/product";
import { AddProductModel } from "../../domain/usecases/add-product";

export interface ProductRepository {
  add(productData: AddProductModel): Promise<ProductDocument>;
  findByName(name: string): Promise<ProductDocument | null>;
  findById(id: string): Promise<ProductDocument | null>;
}
