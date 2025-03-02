//routes/productRoutes/product.ts
import { Router } from "express";
import { adaptRoute } from "../../adapter/express-route-adapter";
import { createProductController } from "../../factories/product";
import { authMiddleware } from "../../config/middlewares";

export default (router: Router): void => {
  router.post(
    "/create-product",
    authMiddleware("admin"),
    adaptRoute(createProductController())
  );
};
