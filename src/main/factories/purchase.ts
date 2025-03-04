import { FlashSaleMongoRepository } from "../../infra/repositories/flashsale-repository/flashSale";
import { PurchaseMongoRepository } from "../../infra/repositories/purchase-repository/purchase";
import { LogMongoRepository } from "../../infra/repositories/log-repository/log";
import { LogControllerDecorator } from "../decorators/log";
import { DbPurchaseProduct } from "../../data/services/add-purchase/db-add-purchase";
import { PurchaseController } from "../../presentation/controllers/purchase/purchase";
import { Controller } from "../../presentation/protocols";
import { FraudDetectionMongoRepository } from "../../infra/repositories/fraud-detection-repository/fraud";

export const createPurchaseController = (): Controller => {
  const fraudDetectionMongoRepository = new FraudDetectionMongoRepository();
  const flashSaleRepo = new FlashSaleMongoRepository();
  const purchaseRepo = new PurchaseMongoRepository();
  const logMongoRepository = new LogMongoRepository();

  const dbPurchaseProduct = new DbPurchaseProduct(purchaseRepo, flashSaleRepo);
  const purchaseController = new PurchaseController(
    dbPurchaseProduct,
    fraudDetectionMongoRepository
  );

  return new LogControllerDecorator(purchaseController, logMongoRepository);
};
