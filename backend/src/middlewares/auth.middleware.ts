import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(requiredRole?: "admin" | "customer") {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing authorization header" });

    const token = header.split(" ")[1];
    try {
      const payload: any = jwt.verify(token, process.env.JWT_SECRET || "change_this_to_a_strong_secret");
      // attach user info
      (req as any).user = { id: payload.id, role: payload.role };
      if (requiredRole && payload.role !== requiredRole) return res.status(403).json({ message: "Forbidden" });
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
