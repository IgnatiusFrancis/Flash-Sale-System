//usecases/add-flashSale/db-add-flashSale.ts
import { ConflictError, NotFoundError } from "../../../presentation/errors";
import {
  AddFlashSale,
  AddFlashSaleModel,
  FlashSaleDocument,
  FlashSaleRepository,
  ProductRepository,
} from "./db-add-flashSale-protocols";

export class DbAddFlashSale implements AddFlashSale {
  private readonly productRepository: ProductRepository;
  private readonly flashSaleRepository: FlashSaleRepository;

  constructor(
    productRepository: ProductRepository,
    flashSaleRepository: FlashSaleRepository
  ) {
    this.productRepository = productRepository;
    this.flashSaleRepository = flashSaleRepository;
  }

  async add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument> {
    const existingProduct = await this.productRepository.findById(
      saleData.productId
    );

    if (!existingProduct) {
      throw new NotFoundError({
        message: "Product not found",
        resource: "product",
        code: "PRODUCT_NOT_FOUND",
        metadata: { product: existingProduct },
      });
    }

    const existingFlashSale =
      await this.flashSaleRepository.findFlashSaleByProductId(
        saleData.productId
      );

    if (existingFlashSale) {
      throw new ConflictError({
        message: "A flash sale is already active for this product",
        resource: "flashSale",
        metadata: { flashSale: existingFlashSale },
      });
    }

    return await this.flashSaleRepository.add(saleData);
  }
}
