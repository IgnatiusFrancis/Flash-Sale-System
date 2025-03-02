import { Authentication } from "../../../domain/usecases/authentication";
import { AccountMongoRepository } from "../../../infra/repositories/user-repository/user";
import {
  AuthenticationError,
  NotFoundError,
} from "../../../presentation/errors";
import { TokenGenerator } from "../../protocols/token-generator";
import { Encrypter, UserDocument } from "../add-user/db-add-user-protocols";

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

  async auth(email: string, password: string): Promise<UserDocument | null> {
    try {
      // Find account by email
      const user = await this.accountRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundError({
          message: "User not found",
          resource: "user",
          code: "USER_NOT_FOUND",
          metadata: { user: user },
        });
      }

      // Validate password
      const isValid = await this.encrypter.compare(password, user.password);

      if (!isValid) {
        throw new AuthenticationError({
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
          details: [
            {
              code: "AUTH_FAILED",
              message: "password is incorrect",
              target: "credentials",
            },
          ],
        });
      }

      // Generate access token
      const accessToken: string = await this.tokenGenerator.generateToken(
        user.id,
        user.role
      );

      // Return UserDocument with token
      return {
        ...user.toObject(),
        accessToken,
      } as UserDocument;
    } catch (error) {
      throw error;
    }
  }
}
