import { Schema, model, Document, Types } from "mongoose";

export interface ProductDocument extends Document {
  user: Schema.Types.ObjectId;
  name: string;
  description: string;
  price: number;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      minlength: 3,
      maxlength: 100,
    },
    description: { type: String, required: false, trim: true, default: "" },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      get: (v: number) => Math.round(v),
      set: (v: number) => Math.round(v),
    },
  },
  { timestamps: true }
);

// Export the Mongoose model
export const ProductModel = model<ProductDocument>("Product", ProductSchema);
