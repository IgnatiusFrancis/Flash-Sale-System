import { Schema, model, Document, Types } from "mongoose";

export enum FlashSaleStatus {
  PENDING = "pending",
  ACTIVE = "active",
  ENDED = "ended",
}
interface Product {
  _id: Types.ObjectId;
  price: number;
}

export interface FlashSaleDocument extends Document {
  productId: Types.ObjectId | Product;
  allocatedUnits: number;
  availableUnits: number;
  startTime: Date;
  endTime?: Date;
  status: FlashSaleStatus;
  discount: number;

  // Virtual field to calculate discounted price
  discountedPrice?: number;
  maxPurchasePerUser: number; // Maximum quantity a user can purchase in total
  maxPurchasePerTransaction: number;
}

const FlashSaleSchema = new Schema<FlashSaleDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    allocatedUnits: {
      type: Number,
      required: true,
      default: 200,
      min: 0,
      max: 200,
    },
    availableUnits: {
      type: Number,
      required: true,
      default: 200,
      min: 0,
      max: 200,
    },
    status: {
      type: String,
      enum: Object.values(FlashSaleStatus),
      required: true,
      default: FlashSaleStatus.PENDING,
    },
    discount: { type: Number, required: true, min: 0, max: 100 },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, default: null, index: true },
    maxPurchasePerUser: {
      type: Number,
      default: 5, // Default limit (adjust as needed)
      min: 1,
    },
    maxPurchasePerTransaction: {
      type: Number,
      default: 2, // Default limit (adjust as needed)
      min: 1,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual field to calculate discounted price
FlashSaleSchema.virtual("discountedPrice").get(function (
  this: FlashSaleDocument
) {
  // Ensure product is populated and has price
  if (!this.productId || typeof this.productId === "string") return null;

  const product = this.productId as Product;
  return product.price - (product.price * this.discount) / 100;
});

export const FlashSaleModel = model<FlashSaleDocument>(
  "FlashSale",
  FlashSaleSchema
);
