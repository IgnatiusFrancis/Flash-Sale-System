//domain/useCases/add-user.ts
import { UserDocument } from "../models/user";

export interface AddUserModel {
  name: string;
  email: string;
  password: string;
  role: "admin" | "customer";
}

export interface AddUser {
  add(account: AddUserModel): Promise<UserDocument>;
}
