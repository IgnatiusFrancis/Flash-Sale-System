//usecases/add-account/db-add-accounts.ts

import { ConflictError } from "../../../presentation/errors";
import {
  AddUser,
  AddUserModel,
  AddUserRepository,
  Encrypter,
  UserDocument,
} from "./db-add-user-protocols";

export class DbAddUser implements AddUser {
  private readonly encrypter: Encrypter;
  private readonly addUserRepository: AddUserRepository;
  constructor(encrypter: Encrypter, addUserRepository: AddUserRepository) {
    this.encrypter = encrypter;
    this.addUserRepository = addUserRepository;
  }

  async add(accountData: AddUserModel): Promise<UserDocument> {
    try {
      const existingAccount = await this.addUserRepository.findByEmail(
        accountData.email
      );

      if (existingAccount) {
        throw new ConflictError({
          message: "Account with this email already exists",
          resource: "user",
          metadata: { email: accountData.email },
        });
      }

      const hashedPassword = await this.encrypter.encrypt(accountData.password);
      const account = this.addUserRepository.add({
        ...accountData,
        password: hashedPassword,
      });
      return new Promise((resolve) => resolve(account));
    } catch (error) {
      throw error;
    }
  }
}
