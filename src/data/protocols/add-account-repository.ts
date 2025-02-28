//data/protocols/add-account-repository.ts
import { AddAccountModel } from "../../domain/usecases/add-account";
import { AccountDocument } from "../../domain/models/account";

export interface AddAccountRepository {
  add(accountData: AddAccountModel): Promise<AccountDocument>;
  findByEmail(email: string): Promise<AccountDocument>;
}
