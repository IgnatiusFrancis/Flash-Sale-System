//routes/productRoutes/product.ts
import { Router } from "express";
import { adaptRoute } from "../../adapter/express-route-adapter";
import { createProductController } from "../../factories/product";

export default (router: Router): void => {
  router.post("/create-product", adaptRoute(createProductController()));
};
