import { Schema, model, Document } from "mongoose";

// Extend Document to include Mongoose properties
export interface AccountDocument extends Document {
  name: string;
  email: string;
  password: string;
}

const AccountSchema = new Schema<AccountDocument>(
  {
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Export the Mongoose model
export const AccountModel = model<AccountDocument>("Account", AccountSchema);
