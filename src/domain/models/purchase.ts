import mongoose, { Schema, model, Document, Types } from "mongoose";

// Extend Document to include Mongoose properties
export interface PurchaseDocument extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  createdAt: Date;
}

const purchaseSchema = new Schema<PurchaseDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Add indexes for optimized queries
purchaseSchema.index({ productId: 1, createdAt: -1 });

// ✅ Export the corrected model
export const PurchaseModel = model<PurchaseDocument>(
  "Purchase",
  purchaseSchema
);
