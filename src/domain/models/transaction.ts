import { Document, Schema, model } from "mongoose";

export interface Transaction {
  flashSaleId: string;
  userId: string;
  purchaseId: string;
  ipAddress: string;
  userAgent: string;
  amount: number;
  status: TransactionStatus;
  fraudScore: number;
  timestamp: Date;
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  FLAGGED = "flagged",
}

export interface TransactionDocument extends Transaction, Document {}

const transactionSchema = new Schema(
  {
    flashSaleId: {
      type: Schema.Types.ObjectId,
      ref: "FlashSale",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      index: true,
    },
    fraudScore: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for query performance
transactionSchema.index({ userId: 1, flashSaleId: 1 });
transactionSchema.index({ timestamp: -1 });
transactionSchema.index({ status: 1, timestamp: -1 });

export const TransactionModel = model<TransactionDocument>(
  "Transaction",
  transactionSchema
);
