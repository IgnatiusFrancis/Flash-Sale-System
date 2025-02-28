//routes/login-routes.ts
import { Router } from "express";
import { makeLoginController } from "../factories/login";
import { adaptRoute } from "../adapter/express-route-adapter";

export default (router: Router): void => {
  router.post("/signin", adaptRoute(makeLoginController()));
};
