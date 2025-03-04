import { FlashSaleDocument } from "../../domain/models/flashSale";
import { AddFlashSaleModel } from "../../domain/usecases/add-flash-sale";

export interface FlashSaleRepository {
  add(flashSaleData: AddFlashSaleModel): Promise<FlashSaleDocument>;
  findFlashSaleByProductId(productId: string): Promise<FlashSaleDocument>;
  findFlashSaleById(id: string): Promise<FlashSaleDocument>;
}
