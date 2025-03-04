import { FlashSaleMongoRepository } from "../../infra/repositories/flashsale-repository/flashSale";
import { PurchaseMongoRepository } from "../../infra/repositories/purchase-repository/purchase";
import { LogMongoRepository } from "../../infra/repositories/log-repository/log";
import { LogControllerDecorator } from "../decorators/log";
import { Controller } from "../../presentation/protocols";
import { LeaderBoardService } from "../../data/services/leader-board/leader-board";
import { LeaderBoardController } from "../../presentation/controllers/leaderBoard/board";

export const leaderboardController = (): Controller => {
  const flashSaleRepo = new FlashSaleMongoRepository();
  const purchaseRepo = new PurchaseMongoRepository();
  const logMongoRepository = new LogMongoRepository();

  const leaderBoardService = new LeaderBoardService(
    purchaseRepo,
    flashSaleRepo
  );
  const leaderBoardController = new LeaderBoardController(leaderBoardService);

  return new LogControllerDecorator(leaderBoardController, logMongoRepository);
};
