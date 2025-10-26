import { IUser } from "../models/user.model";

export function toUserDTO(user: Partial<IUser> | any) {
  if (!user) return null;
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    balance: user.balance,
    deviceId: user.deviceId,
    isVerified: user.isVerified,
    role: user.role,
    createdAt: user.createdAt,
  };
}
