//domain/useCases/add-account.ts
import { AccountDocument } from "../models/account";

export interface AddAccountModel {
  name: string;
  email: string;
  password: string;
  role: "admin" | "customer";
}

export interface AddAccount {
  add(account: AddAccountModel): Promise<AccountDocument>;
}
