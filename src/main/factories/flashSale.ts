import { DbAddFlashSale } from "../../data/usecases/add-flashSale/db-add-flsahSale";
import { FlashSaleMongoRepository } from "../../infra/repositories/flashsale-repository/flashSale";
import { LogMongoRepository } from "../../infra/repositories/log-repository/log";
import { ProductMongoRepository } from "../../infra/repositories/product-repository/product";
import { FlashSaleController } from "../../presentation/controllers/flashSales/sale";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const createFlashSaleController = (): Controller => {
  const productMongoRepository = new ProductMongoRepository();
  const flashSaleMongoRepository = new FlashSaleMongoRepository();
  const logMongoRepository = new LogMongoRepository();
  const dbAddflashsale = new DbAddFlashSale(
    productMongoRepository,
    flashSaleMongoRepository
  );
  const flashSaleController = new FlashSaleController(dbAddflashsale);
  return new LogControllerDecorator(flashSaleController, logMongoRepository);
};
