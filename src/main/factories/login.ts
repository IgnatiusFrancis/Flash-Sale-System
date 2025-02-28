//factories/login.ts
import { DbAuthentication } from "../../data/usecases/authentication/db-authentication";
import { BcryptAdapter } from "../../infra/criptography/bcrypt-adapter";
import { JwtAdapter } from "../../infra/criptography/jwt-adapter";
import { AccountMongoRepository } from "../../infra/db/repositories/accout-repository/account";
import { LogMongoRepository } from "../../infra/db/repositories/log-repository/log";
import { LogginContfroller } from "../../presentation/controllers/login/login";
import { Controller } from "../../presentation/protocols";
import { EmailValidatorAdapter } from "../../utils/email-validator-adapter";
import env from "../config/env";
import { LogControllerDecorator } from "../decorators/log";

export const makeLoginController = (): Controller => {
  const emailValidatorAdapter = new EmailValidatorAdapter();
  const accountMongoRepository = new AccountMongoRepository();
  const bcryptAdapter = new BcryptAdapter();
  const jwtAdapter = new JwtAdapter(env.secret_key);
  const dbAuthentication = new DbAuthentication(
    accountMongoRepository,
    bcryptAdapter,
    jwtAdapter
  );
  const loginController = new LogginContfroller(
    emailValidatorAdapter,
    dbAuthentication
  );
  return new LogControllerDecorator(loginController, new LogMongoRepository());
};
