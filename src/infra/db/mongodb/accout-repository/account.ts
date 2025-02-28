import { AddAccountRepository } from "../../../../data/protocols/add-account-repository";
import {
  AccountDocument,
  AccountModel,
} from "../../../../domain/models/account";
import { AddAccountModel } from "../../../../domain/usecases/add-account";

export class AccountMongoRepository implements AddAccountRepository {
  async add(accountData: AddAccountModel): Promise<any> {
    try {
      const existingAccount = await AccountModel.findOne({
        email: accountData.email,
      });
      if (existingAccount) {
        return null; // User already exists
      }

      const account = new AccountModel(accountData);
      console.log("account:", account);

      const savedAccount = await account.save();
      console.log("savedAccount:", savedAccount);

      return savedAccount;
    } catch (error) {
      console.error("❌ Error saving account:", error);
      throw new Error("Database save error");
    }
  }

  async findByEmail(email: string): Promise<AccountDocument | null> {
    try {
      return AccountModel.findOne({ email });
    } catch (error) {
      throw new Error("Unexpected error");
    }
  }
}
