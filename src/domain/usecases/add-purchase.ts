// domain/usecases/add-purchase.ts
import { PurchaseDocument } from "../models/purchase";

export interface AddPurchaseModel {
  flashSaleId: string;
  userId: string;
  quantity: number;
  purchaseTime: Date;
}

export interface AddPurchase {
  purchaseProduct(purchase: AddPurchaseModel): Promise<PurchaseDocument>;
}
