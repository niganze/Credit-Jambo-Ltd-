import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  balance: number;
  deviceId?: string;
  isVerified: boolean;
  role: "customer" | "admin";
}

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    balance: { type: Number, default: 0 },
    deviceId: { type: String },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
