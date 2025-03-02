//routes/signup-routes.ts
import { Router } from "express";
import { adaptRoute } from "../../adapter/express-route-adapter";
import { signUpController } from "../../factories/signup";

export default (router: Router): void => {
  router.post("/signup", adaptRoute(signUpController()));
};
