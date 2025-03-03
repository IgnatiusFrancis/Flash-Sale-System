import {
  AddPurchaseModel,
  PurchaseDocument,
} from "../usecases/add-purchase/db-add-purchase-protocols";

export interface PurchaseRepository {
  purchaseProduct(purchaseData: AddPurchaseModel): Promise<PurchaseDocument>;
  getTotalPurchasesByUser(userId: string, flashSaleId: string): Promise<number>;
}
