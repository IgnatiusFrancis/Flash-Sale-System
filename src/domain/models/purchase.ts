import { Schema, model, Document, Types } from "mongoose";

export interface PurchaseDocument extends Document {
  user: Schema.Types.ObjectId;
  productId: Types.ObjectId;
  flashSale: Schema.Types.ObjectId;
  quantity: number;
  purchasedAt: Date;
}

const PurchaseSchema = new Schema<PurchaseDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    flashSale: {
      type: Schema.Types.ObjectId,
      ref: "FlashSale",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    purchasedAt: { type: Date, default: Date.now },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for sorting purchases quickly (leaderboard)
PurchaseSchema.index({ purchasedAt: 1 });

export const PurchaseModel = model<PurchaseDocument>(
  "Purchase",
  PurchaseSchema
);
