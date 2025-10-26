import { User } from "../models/user.model";
import { Transaction } from "../models/transaction.model";

export async function deposit(userId: string, amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive");
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.balance += amount;
  await user.save();

  await Transaction.create({
    userId: user._id,
    type: "deposit",
    amount,
    balanceAfter: user.balance,
  });

  return user.balance;
}

export async function withdraw(userId: string, amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive");
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.balance < amount) throw new Error("Insufficient balance");

  user.balance -= amount;
  await user.save();

  await Transaction.create({
    userId: user._id,
    type: "withdraw",
    amount,
    balanceAfter: user.balance,
  });

  return user.balance;
}

export async function getHistory(userId: string) {
  return Transaction.find({ userId }).sort({ createdAt: -1 }).lean();
}
