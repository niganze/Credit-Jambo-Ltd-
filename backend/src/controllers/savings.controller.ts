import { Request, Response } from "express";
import * as Savings from "../services/savings.service";
import { toUserDTO } from "../dtos/user.dto";

export async function deposit(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount required" });

    const balance = await Savings.deposit(userId, Number(amount));
    return res.json({ balance });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Deposit failed" });
  }
}

export async function withdraw(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount required" });

    const balance = await Savings.withdraw(userId, Number(amount));
    return res.json({ balance });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Withdraw failed" });
  }
}

export async function history(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const tx = await Savings.getHistory(userId);
    return res.json(tx);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Could not fetch history" });
  }
}
