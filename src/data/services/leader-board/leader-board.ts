import { NotFoundError } from "../../../presentation/errors";
import { FlashSaleRepository } from "../add-flashSale/db-add-flashSale-protocols";
import { leaderboard, PurchaseRepository } from "./leader-board-protocols";

export class LeaderBoardService implements leaderboard {
  private readonly purchaseRepository: PurchaseRepository;
  private readonly flashSaleRepository: FlashSaleRepository;

  constructor(
    purchaseRepository: PurchaseRepository,
    flashSaleRepository: FlashSaleRepository
  ) {
    this.purchaseRepository = purchaseRepository;
    this.flashSaleRepository = flashSaleRepository;
  }

  async getLeaderBoard(
    flashSaleId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    // Verify Flash Sale Exists
    const flashSale = await this.flashSaleRepository.findFlashSaleById(
      flashSaleId
    );

    if (!flashSale) {
      throw new NotFoundError({
        message: "Flash sale not found",
        resource: "flashSale",
        code: "FLASH_SALE_NOT_FOUND",
      });
    }

    // Calculate pagination parameters
    const skip = (page - 1) * limit;

    // Fetch paginated leaderboard data from the purchase repository
    return await this.purchaseRepository.getLeaderBoard(
      flashSaleId,
      skip,
      limit
    );
  }
}
