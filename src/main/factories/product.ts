import { DbAddProduct } from "../../data/services/add-product/db-add-product";
import { LogMongoRepository } from "../../infra/repositories/log-repository/log";
import { ProductMongoRepository } from "../../infra/repositories/product-repository/product";
import { ProductController } from "../../presentation/controllers/product/product";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const createProductController = (): Controller => {
  const productMongoRepository = new ProductMongoRepository();
  const logMongoRepository = new LogMongoRepository();
  const dbAddProduct = new DbAddProduct(productMongoRepository);
  const productController = new ProductController(dbAddProduct);
  return new LogControllerDecorator(productController, logMongoRepository);
};
