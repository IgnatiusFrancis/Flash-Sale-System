//domain/useCases/add-flash-sale.ts
import { FlashSaleDocument, FlashSaleStatus } from "../models/flashSale";

export interface AddFlashSaleModel {
  productId: string;
  allocatedUnits?: number;
  availableUnits?: number;
  discount: number;
  startTime: Date;
  endTime?: Date;
  status: FlashSaleStatus;
}

export interface AddFlashSale {
  add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument>;
}
