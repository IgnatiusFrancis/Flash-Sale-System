import mongoose, { Schema, model, Document } from "mongoose";

// Extend Document to include Mongoose properties
export interface ProductDocument extends Document {
  name: string;
  totalUnits: number;
  availableUnits: number;
  saleStartTime: Date;
  saleEndTime: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    totalUnits: { type: Number, required: true, min: 1 },
    availableUnits: { type: Number, required: true, min: 0 },
    saleStartTime: { type: Date, required: true },
    saleEndTime: { type: Date, required: true },
  },
  { timestamps: true }
);

// ✅ Index for fast queries on active flash sales and available products
ProductSchema.index({ saleStartTime: 1, saleEndTime: 1 });
ProductSchema.index({ availableUnits: 1 });

export const ProductModel = model<ProductDocument>("Product", ProductSchema);
