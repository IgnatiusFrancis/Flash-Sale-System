//domain/useCases/add-purchase.ts

import { PurchaseDocument } from "../models/purchase";

export interface AddPurchaseModel {
  user: string;
  productId: string;
  flashSale: string;
  quantity: number;
  //purchasedAt: Date;
}

export interface AddPurchase {
  add(purchaseData: AddPurchaseModel): Promise<PurchaseDocument>;
}
