import { UserDocument } from "../models/user";

//domain/useCases/authentication.ts
export interface Authentication {
  auth(email: string, password: string): Promise<UserDocument>;
}
