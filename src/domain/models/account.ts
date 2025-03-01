import { Schema, model, Document } from "mongoose";

// Extend Document to include Mongoose properties
export interface AccountDocument extends Document {
  name: string;
  email: string;
  password: string;
  purchases?: Schema.Types.ObjectId[];
  role: "admin" | "customer";
}

export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

const AccountSchema = new Schema<AccountDocument>(
  {
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    purchases: [{ type: Schema.Types.ObjectId, ref: "Purchase" }],
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
  },
  { timestamps: true }
);

// Export the Mongoose model
export const AccountModel = model<AccountDocument>("Account", AccountSchema);
