import { Schema, model, Document } from "mongoose";

export interface ProductDocument extends Document {
  name: string;
  totalUnits: number;
  price: number;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    totalUnits: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

// Export the Mongoose model
export const ProductModel = model<ProductDocument>("Product", ProductSchema);
