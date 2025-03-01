//
import {
  FlashSaleDocument,
  FlashSaleModel,
} from "../../../domain/models/flashSale";
import { ProductModel } from "../../../domain/models/product";
import { AddFlashSaleModel } from "../../../domain/usecases/add-flash-sale";

export class FlashSaleMongoRepository {
  async add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument | null> {
    try {
      const existingProduct = await ProductModel.findOne({
        id: saleData.productId,
      });

      if (existingProduct) {
        return null;
      }

      const flashSale = new FlashSaleModel(saleData);
      const savedSale = await flashSale.save();

      console.log("Saved Flash Sale:", savedSale);
      return savedSale;
    } catch (error) {
      throw new Error("Database error while saving flash sale");
    }
  }
}
