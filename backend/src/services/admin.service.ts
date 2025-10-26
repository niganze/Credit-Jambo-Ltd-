import { User } from "../models/user.model";
import { Transaction } from "../models/transaction.model";

export async function listUsers() {
  return User.find().select("-passwordHash").lean();
}

export async function getUser(userId: string) {
  return User.findById(userId).select("-passwordHash").lean();
}

export async function verifyUserDevice(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.isVerified = true;
  await user.save();
  return user;
}

export async function listTransactions() {
  return Transaction.find().sort({ createdAt: -1 }).lean();
}
