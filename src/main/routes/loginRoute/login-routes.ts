//routes/loginRoute/login-routes.ts
import { Router } from "express";
import { adaptRoute } from "../../adapter/express-route-adapter";
import { loginController } from "../../factories/login";

export default (router: Router): void => {
  router.post("/signin", adaptRoute(loginController()));
};
