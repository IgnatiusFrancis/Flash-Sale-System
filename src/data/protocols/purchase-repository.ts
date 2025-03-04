import {
  AddPurchaseModel,
  PurchaseDocument,
} from "../services/add-purchase/db-add-purchase-protocols";

export interface PurchaseRepository {
  purchaseProduct(purchaseData: AddPurchaseModel): Promise<PurchaseDocument>;
  getTotalPurchasesByUser(userId: string, flashSaleId: string): Promise<number>;
  getLeaderBoard(
    flashSaleId: string,
    page: number,
    limit: number
  ): Promise<any>;
}
