import { ProductDocument } from "../models/product";

export interface AddProductModel {
  name: string;
  totalUnits: number;
  price: number;
}

export interface AddProduct {
  add(product: AddProductModel): Promise<ProductDocument | null>;
}
