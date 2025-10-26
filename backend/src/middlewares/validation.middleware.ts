import { Request, Response, NextFunction } from "express";

export function validateBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const f of requiredFields) {
      if (req.body[f] === undefined || req.body[f] === null) {
        return res.status(400).json({ message: `${f} is required` });
      }
    }
    next();
  };
}
