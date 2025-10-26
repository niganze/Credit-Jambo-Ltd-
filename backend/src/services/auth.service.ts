import crypto from "crypto";
import { User } from "../models/user.model";
import { signToken } from "../utils/jwt";

export async function register(fullName: string, email: string, password: string, deviceId?: string) {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");

  const hash = crypto.createHash("sha512").update(password).digest("hex");
  const user = await User.create({
    fullName,
    email,
    passwordHash: hash,
    deviceId,
    isVerified: false,
  });
  return user;
}

export async function login(email: string, password: string, deviceId?: string) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const hash = crypto.createHash("sha512").update(password).digest("hex");
  if (user.passwordHash !== hash) throw new Error("Invalid credentials");

  // If user has a deviceId saved, require it to be verified
  if (user.deviceId && user.deviceId !== deviceId) throw new Error("Device not recognized");
  if (user.deviceId && !user.isVerified) throw new Error("Device not verified");

  // If user has no device yet, we allow login but mark device not verified (admin needs to verify)
  const token = signToken({ id: user._id, role: user.role }, "8h");
  return { token, user };
}

export async function attachDevice(userId: string, deviceId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.deviceId = deviceId;
  user.isVerified = false;
  await user.save();
  return user;
}

export async function verifyDevice(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.isVerified = true;
  await user.save();
  return user;
}
