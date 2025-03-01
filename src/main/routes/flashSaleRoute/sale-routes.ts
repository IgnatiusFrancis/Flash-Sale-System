//routes/flashSaleRoute/sales-routes.ts
import { Router } from "express";
import { adaptRoute } from "../../adapter/express-route-adapter";
import { createFlashSaleController } from "../../factories/flashSale";

export default (router: Router): void => {
  router.post("/create-flash-sale", adaptRoute(createFlashSaleController()));
};
