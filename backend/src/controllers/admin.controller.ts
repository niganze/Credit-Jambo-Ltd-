import { Request, Response } from "express";
import * as AdminService from "../services/admin.service";

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await AdminService.listUsers();
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

export async function verifyDevice(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });
    const user = await AdminService.verifyUserDevice(userId);
    return res.json({ message: "Device verified", user });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

export async function listTransactions(req: Request, res: Response) {
  try {
    const tx = await AdminService.listTransactions();
    return res.json(tx);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}
