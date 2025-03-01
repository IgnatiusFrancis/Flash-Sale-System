// import { Document, model, Schema } from "mongoose";

// export enum FlashSaleStatus {
//   PENDING = "pending",
//   ACTIVE = "active",
//   ENDED = "ended",
// }

// export interface FlashSaleDocument extends Document {
//   product: Schema.Types.ObjectId;
//   availableUnits: number;
//   startTime: Date;
//   endTime?: Date;
//   status: FlashSaleStatus;
//   discount: number;
// }

// const FlashSaleSchema = new Schema<FlashSaleDocument>(
//   {
//     product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
//     availableUnits: { type: Number, required: true, default: 200 },
//     discount: { type: Number, required: true },
//     startTime: { type: Date, required: true },
//     endTime: { type: Date, default: null },
//     status: {
//       type: String,
//       enum: Object.values(FlashSaleStatus),
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // Virtual field for dynamically determining sale status
// // FlashSaleSchema.virtual("status").get(function (this: FlashSaleDocument) {
// //   const now = new Date();
// //   if (now < this.startTime) return FlashSaleStatus.PENDING;
// //   if (this.endTime && now >= this.endTime) return FlashSaleStatus.ENDED;
// //   if (this.availableUnits === 0) return FlashSaleStatus.ENDED;
// //   return FlashSaleStatus.ACTIVE;
// // });

// export const FlashSaleModel = model<FlashSaleDocument>(
//   "FlashSale",
//   FlashSaleSchema
// );

import { Schema, model, Document, Types } from "mongoose";

export enum FlashSaleStatus {
  PENDING = "pending",
  ACTIVE = "active",
  ENDED = "ended",
}

// ✅ Define a separate interface for Product
interface Product {
  _id: Types.ObjectId;
  price: number; // Ensure price is included
}

// ✅ Define Flash Sale Document
export interface FlashSaleDocument extends Document {
  product: Types.ObjectId | Product; // Can be ObjectId or Populated Product
  availableUnits: number;
  startTime: Date;
  endTime?: Date;
  status: FlashSaleStatus;
  discount: number;
  discountedPrice?: number; // Virtual field
}

const FlashSaleSchema = new Schema<FlashSaleDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    availableUnits: { type: Number, required: true, default: 200 },
    discount: { type: Number, required: true }, // Discount percentage
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Virtual field to calculate discounted price
FlashSaleSchema.virtual("discountedPrice").get(function (
  this: FlashSaleDocument
) {
  // ✅ Ensure product is populated and has price
  if (!this.product || typeof this.product === "string") return null;

  const product = this.product as Product; // ✅ Cast to populated Product
  return product.price - (product.price * this.discount) / 100;
});

export const FlashSaleModel = model<FlashSaleDocument>(
  "FlashSale",
  FlashSaleSchema
);
