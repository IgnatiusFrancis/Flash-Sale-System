import { FlashSaleDocument, FlashSaleStatus } from "../models/flashSale";

export interface AddFlashSaleModel {
  productId: string;
  availableUnits: number;
  discount: number;
  startTime: Date;
  endTime?: Date;
  status?: FlashSaleStatus;
}

export interface AddFlashSale {
  add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument>;
}
