import { FlashSaleDocument } from "../../domain/models/flashSale";
import { AddFlashSaleModel } from "../../domain/usecases/add-flash-sale";

export interface flashSaleRepository {
  add(flashSaleData: AddFlashSaleModel): Promise<FlashSaleDocument>;
  findFlashSale(productId: string): Promise<FlashSaleDocument>;
}
