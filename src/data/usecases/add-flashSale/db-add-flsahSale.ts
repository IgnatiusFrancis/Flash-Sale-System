import {
  AddFlashSale,
  AddFlashSaleModel,
  FlashSaleDocument,
  flashSaleRepository,
  ProductRepository,
} from "./db-add-flashSale-protocols";

export class DbAddFlashSale implements AddFlashSale {
  private readonly addProductRepository: ProductRepository;
  private readonly addflashSaleRepository: flashSaleRepository;

  constructor(
    addProductRepository: ProductRepository,
    addflashSaleRepository: flashSaleRepository
  ) {
    this.addProductRepository = addProductRepository;
    this.addflashSaleRepository = addflashSaleRepository;
  }

  async add(saleData: AddFlashSaleModel): Promise<FlashSaleDocument | null> {
    const existingProduct = await this.addProductRepository.findById(
      saleData.productId
    );
    if (existingProduct) {
      return null;
    }

    return await this.addflashSaleRepository.add(saleData);
  }
}
