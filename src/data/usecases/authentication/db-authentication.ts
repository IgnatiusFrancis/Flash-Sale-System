import { Authentication } from "../../../domain/usecases/authentication";
import { AccountMongoRepository } from "../../../infra/repositories/accout-repository/account";
import { TokenGenerator } from "../../protocols/token-generator";
import { Encrypter } from "../add-account/db-add-account-protocols";

export class DbAuthentication implements Authentication {
  private readonly accountRepository: AccountMongoRepository;
  private readonly encrypter: Encrypter;
  private readonly tokenGenerator: TokenGenerator;

  constructor(
    accountRepository: AccountMongoRepository,
    encrypter: Encrypter,
    tokenGenerator: TokenGenerator
  ) {
    this.accountRepository = accountRepository;
    this.encrypter = encrypter;
    this.tokenGenerator = tokenGenerator;
  }

  async auth(email: string, password: string): Promise<string | null> {
    try {
      const account = await this.accountRepository.findByEmail(email);
      if (!account) return null;

      const isValid = await this.encrypter.compare(password, account.password);

      if (!isValid) return null;

      const token: string = await this.tokenGenerator.generateToken(
        account.id,
        account.role
      );
      console.log("auth...", token);
      return token;
    } catch (error) {
      throw new Error("Unexpected error");
    }
  }
}
