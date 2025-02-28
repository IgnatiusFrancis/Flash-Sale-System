// import { DbAuthentication } from "../../data/usecases/authentication/db-authentication";
// import { BcryptAdapter } from "../../infra/criptography/bcrypt-adapter";
// import { JwtAdapter } from "../../infra/criptography/jwt-adapter";
// import { AccountMongoRepository } from "../../infra/db/mongodb/accout-repository/account";
// import { LogMongoRepository } from "../../infra/db/mongodb/log-repository/log";
// import { LogginContfroller } from "../../presentation/controllers/login/login";
// //import { LoginController } from "../../presentation/controllers/login/login";
// import { Controller } from "../../presentation/protocols";
// import { LogControllerDecorator } from "../decorators/log";

// export const makeLoginController = (): Controller => {
//   const accountMongoRepository = new AccountMongoRepository();
//   const bcryptAdapter = new BcryptAdapter();
//   const jwtAdapter = new JwtAdapter("your-secret-key"); // Change to env variable
//   const dbAuthentication = new DbAuthentication(accountMongoRepository, bcryptAdapter, jwtAdapter);
//   const loginController = new LogginContfroller(dbAuthentication);
//   return new LogControllerDecorator(loginController, new LogMongoRepository());
// };
