//data/protocols/add-user-repository.ts

import {
  AddUserModel,
  UserDocument,
} from "../services/add-user/db-add-user-protocols";

export interface AddUserRepository {
  add(accountData: AddUserModel): Promise<UserDocument>;
  findByEmail(email: string): Promise<UserDocument | null>;
}
