import { Schema, model, Document } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  purchases?: Schema.Types.ObjectId[];
  role: "admin" | "customer";
  accessToken?: string;
}

export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: /.+@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 2,
    },
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
export const UserModel = model<UserDocument>("User", UserSchema);
