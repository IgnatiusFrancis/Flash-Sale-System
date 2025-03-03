//routes/flashSaleRoute/sales-routes.ts
import { Router } from "express";
import { adaptRoute } from "../../adapter/express-route-adapter";
import { createFlashSaleController } from "../../factories/flashSale";
import { authMiddleware } from "../../middlewares";

export default (router: Router): void => {
  router.post(
    "/create-flash-sale",
    authMiddleware("admin"),
    adaptRoute(createFlashSaleController())
  );
};
