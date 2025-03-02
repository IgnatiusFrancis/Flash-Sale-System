//domain/useCases/add-product.ts
import { ProductDocument } from "../models/product";

export interface AddProductModel {
  user: string;
  name: string;
  description?: string;
  price: number;
}

export interface AddProduct {
  add(product: AddProductModel): Promise<ProductDocument>;
}
