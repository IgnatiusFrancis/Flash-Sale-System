// import {
//   AddFlashSale,
//   AddFlashSaleModel,
//   FlashSaleDocument,
//   flashSaleRepository,
//   ProductRepository,
// } from "./db-add-flashSale-protocols";

// export class DbAddFlashSale implements AddFlashSale {
//   private readonly addProductRepository: ProductRepository;
//   private readonly addflashSaleRepository: flashSaleRepository;

//   constructor(
//     addProductRepository: ProductRepository,
//     addflashSaleRepository: flashSaleRepository
//   ) {
//     this.addProductRepository = addProductRepository;
//     this.addflashSaleRepository = addflashSaleRepository;
//   }

//   async add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument | null> {
//     const existingProduct = await this.addProductRepository.findById(
//       saleData.productId
//     );
//     if (existingProduct) {
//       return null;
//     }

//     const existingFlashSale = await this.addflashSaleRepository.findFlashSale(
//       saleData.productId
//     );
//     if (existingFlashSale) {
//       return null;
//     }

//     return await this.addflashSaleRepository.add(saleData);
//   }
// }

import {
  AddFlashSale,
  AddFlashSaleModel,
  FlashSaleDocument,
  flashSaleRepository,
  ProductRepository,
} from "./db-add-flashSale-protocols";

export class DbAddFlashSale implements AddFlashSale {
  private readonly productRepository: ProductRepository;
  private readonly flashSaleRepository: flashSaleRepository;

  constructor(
    productRepository: ProductRepository,
    flashSaleRepository: flashSaleRepository
  ) {
    this.productRepository = productRepository;
    this.flashSaleRepository = flashSaleRepository;
  }

  async add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument> {
    const existingProduct = await this.productRepository.findById(
      saleData.productId
    );
    if (!existingProduct) {
      throw new Error("Product not found"); // 🔹 Throw an error instead of returning null
    }

    const existingFlashSale = await this.flashSaleRepository.findFlashSale(
      saleData.productId
    );
    if (existingFlashSale) {
      throw new Error("A flash sale is already active for this product");
    }

    return await this.flashSaleRepository.add(saleData);
  }
}
