//
import { flashSaleRepository } from "../../../data/protocols/flashSale-repository";
import {
  FlashSaleDocument,
  FlashSaleModel,
  FlashSaleStatus,
} from "../../../domain/models/flashSale";
import { ProductModel } from "../../../domain/models/product";
import { AddFlashSaleModel } from "../../../domain/usecases/add-flash-sale";

export class FlashSaleMongoRepository implements flashSaleRepository {
  //   async add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument | null> {
  //     try {
  //       const existingProduct = await ProductModel.findOne({
  //         id: saleData.productId,
  //       });

  //       if (existingProduct) {
  //         return null;
  //       }

  //       const flashSale = new FlashSaleModel(saleData);
  //       const savedSale = await flashSale.save();

  //       console.log("Saved Flash Sale:", savedSale); // ✅ Emit real-time update when sale starts
  //       if (savedSale.status === FlashSaleStatus.ACTIVE) {
  //         io.emit("flashSaleStarted", savedSale);
  //         console.log(`🚀 Flash Sale started for product ${saleData.productId}`);
  //       } else {
  //         console.log(`📅 Flash Sale scheduled for ${saleData.startTime}`);
  //       }

  //       return savedSale;
  //     } catch (error) {
  //       throw new Error("Database error while saving flash sale");
  //     }
  //   }

  async add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument> {
    try {
      // ✅ Check if product exists
      const existingProduct = await ProductModel.findById(saleData.productId);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      // ✅ Ensure no active flash sale exists for this product
      const existingFlashSale = await FlashSaleModel.findOne({
        product: saleData.productId,
        status: FlashSaleStatus.ACTIVE,
      });
      if (existingFlashSale) {
        throw new Error("A flash sale is already active for this product");
      }

      // ✅ Set the correct sale status
      const now = new Date();
      let status: FlashSaleStatus = FlashSaleStatus.PENDING;
      if (saleData.startTime <= now) {
        status = FlashSaleStatus.ACTIVE;
      }
      if (saleData.endTime && saleData.endTime <= now) {
        status = FlashSaleStatus.ENDED;
      }

      // ✅ Save the flash sale
      const flashSale = new FlashSaleModel({
        ...saleData,
        status,
      });
      const savedSale = await flashSale.save();

      console.log("✅ Flash Sale Created:", savedSale);

      // ✅ Emit real-time update if sale starts immediately
      if (savedSale.status === FlashSaleStatus.ACTIVE) {
        //io.emit("flashSaleStarted", savedSale);
        console.log(`🚀 Flash Sale started for product ${saleData.productId}`);
      } else {
        console.log(`📅 Flash Sale scheduled for ${saleData.startTime}`);
      }

      return savedSale;
    } catch (error) {
      throw new Error(
        `Database error while saving flash sale: ${error.message}`
      );
    }
  }

  async findFlashSale(productId: string): Promise<FlashSaleDocument | null> {
    try {
      return await FlashSaleModel.findOne({ productId, active: true });
    } catch (error) {
      throw new Error("Database error while fetching flash sale by product id");
    }
  }
}
