import { Router } from "express";
import { adaptRoute } from "../../adapter/express-route-adapter";
import { createPurchaseController } from "../../factories/purchase";
import { authMiddleware, purchaseLimiter } from "../../middlewares";

export default (router: Router): void => {
  router.post(
    "/purchase-product",
    authMiddleware("customer"),
    purchaseLimiter,
    adaptRoute(createPurchaseController())
  );
};
