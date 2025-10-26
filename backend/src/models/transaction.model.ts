import mongoose, { Document } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: "deposit" | "withdraw";
  amount: number;
  balanceAfter: number;
  createdAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deposit", "withdraw"], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
