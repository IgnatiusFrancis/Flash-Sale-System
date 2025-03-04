import { Router } from "express";
import { adaptRoute } from "../../adapter/express-route-adapter";
import { createPurchaseController } from "../../factories/purchase";
import { leaderboardController } from "../../factories/leaderBoard";
import { authMiddleware, purchaseLimiter } from "../../middlewares";

export default (router: Router): void => {
  router.post(
    "/purchase-product",
    authMiddleware("customer"),
    purchaseLimiter,
    adaptRoute(createPurchaseController())
  );

  router.get(
    "/leaderboard",
    authMiddleware("admin"),
    adaptRoute(leaderboardController())
  );
};
