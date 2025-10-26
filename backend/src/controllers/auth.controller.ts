import { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import { toUserDTO } from "../dtos/user.dto";

export async function register(req: Request, res: Response) {
  try {
    const { fullName, email, password, deviceId } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await AuthService.register(fullName, email, password, deviceId);
    return res.status(201).json({ message: "Registered", user: toUserDTO(user) });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password, deviceId } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const { token, user } = await AuthService.login(email, password, deviceId);
    return res.json({ token, user: toUserDTO(user) });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Login failed" });
  }
}

export async function attachDevice(req: Request, res: Response) {
  try {
    const { userId, deviceId } = req.body;
    if (!userId || !deviceId) return res.status(400).json({ message: "Missing userId or deviceId" });
    const user = await AuthService.attachDevice(userId, deviceId);
    return res.json({ message: "Device attached (awaiting verification)", user: toUserDTO(user) });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Attach device failed" });
  }
}
