import { Document, model, Schema } from "mongoose";

export enum FlashSaleStatus {
  PENDING = "pending",
  ACTIVE = "active",
  ENDED = "ended",
}

export interface FlashSaleDocument extends Document {
  product: Schema.Types.ObjectId;
  availableUnits: number;
  startTime: Date;
  endTime?: Date;
  status: FlashSaleStatus;
}

const FlashSaleSchema = new Schema<FlashSaleDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    availableUnits: { type: Number, required: true, default: 200 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual field for dynamically determining sale status
FlashSaleSchema.virtual("status").get(function (this: FlashSaleDocument) {
  const now = new Date();
  if (now < this.startTime) return FlashSaleStatus.PENDING;
  if (this.endTime && now >= this.endTime) return FlashSaleStatus.ENDED;
  if (this.availableUnits === 0) return FlashSaleStatus.ENDED;
  return FlashSaleStatus.ACTIVE;
});

export const FlashSaleModel = model<FlashSaleDocument>(
  "FlashSale",
  FlashSaleSchema
);
