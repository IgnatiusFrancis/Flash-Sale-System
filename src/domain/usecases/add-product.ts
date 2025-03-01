import { ProductDocument } from "../models/product";

export interface AddProductModel {
  name: string;
  totalUnits: number;
  //availableUnits?: number;
  saleStartTime: Date;
}

export interface AddProduct {
  add(product: AddProductModel): Promise<ProductDocument | null>;
}
