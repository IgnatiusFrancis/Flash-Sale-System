// infra/repositories/user-repository/user.ts
import { AddUserRepository } from "../../../data/protocols/add-user-repository";
import { UserDocument, UserModel } from "../../../domain/models/user";
import { AddUserModel } from "../../../domain/usecases/add-user";
import {
  ConflictError,
  ExternalServiceError,
  NotFoundError,
} from "../../../presentation/errors";
import logger from "../../../utils/logger";

export class AccountMongoRepository implements AddUserRepository {
  async add(accountData: AddUserModel): Promise<UserDocument> {
    try {
      // Check if account with email already exists
      const existingAccount = await UserModel.findOne({
        email: accountData.email,
      });

      if (existingAccount) {
        throw new ConflictError({
          message: "Account with this email already exists",
          resource: "user",
          metadata: { email: accountData.email },
        });
      }

      // Create and save the new account
      const account = new UserModel(accountData);
      const savedAccount = await account.save();

      return savedAccount;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      // Log the database error with details
      logger.error({
        message: "Database error while saving account",
        error: error instanceof Error ? error.message : String(error),
        operation: "AccountMongoRepository.add",
        data: { email: accountData.email },
      });

      throw new ExternalServiceError({
        message: "Failed to create account due to database error",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      logger.error({
        message: "Database error while finding account by email",
        error: error instanceof Error ? error.message : String(error),
        operation: "AccountMongoRepository.findByEmail",
        data: { email },
      });

      throw new ExternalServiceError({
        message: "Failed to retrieve account information",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      const user = await UserModel.findById(id);

      if (!user) {
        throw new NotFoundError({
          message: "User not found",
          resource: "user",
          code: "USER_NOT_FOUND",
          metadata: { userId: id },
        });
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      // Handle MongoDB validation/cast errors (invalid ObjectId)
      if (error.name === "CastError" && error.kind === "ObjectId") {
        throw new NotFoundError({
          message: "User not found - Invalid ID format",
          resource: "user",
          code: "INVALID_USER_ID",
          metadata: { userId: id },
        });
      }

      // Log other database errors
      logger.error({
        message: "Database error while finding account by ID",
        error: error instanceof Error ? error.message : String(error),
        operation: "AccountMongoRepository.findById",
        data: { userId: id },
      });

      throw new ExternalServiceError({
        message: "Failed to retrieve account information",
        service: "MongoDB",
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}
