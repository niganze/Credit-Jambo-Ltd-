import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./utils/db";
import * as AuthController from "./controllers/auth.controller";
import * as SavingsController from "./controllers/savings.controller";
import * as AdminController from "./controllers/admin.controller";
import { authMiddleware } from "./middlewares/auth.middleware";
import { validateBody } from "./middlewares/validation.middleware";

dotenv.config();

const app = express();

// security + parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
});
app.use(limiter);

// connect DB
connectDB().catch((err) => {
  console.error("DB connection error:", err);
  process.exit(1);
});

// Public auth
app.post("/api/register", validateBody(["fullName", "email", "password"]), AuthController.register);
app.post("/api/login", validateBody(["email", "password"]), AuthController.login);
app.post("/api/attach-device", validateBody(["userId", "deviceId"]), AuthController.attachDevice);

// Protected user routes
app.post("/api/deposit", authMiddleware(), validateBody(["amount"]), SavingsController.deposit);
app.post("/api/withdraw", authMiddleware(), validateBody(["amount"]), SavingsController.withdraw);
app.get("/api/history", authMiddleware(), SavingsController.history);

// Admin routes (requires admin role)
app.get("/api/admin/users", authMiddleware("admin"), AdminController.listUsers);
app.post("/api/admin/verify-device", authMiddleware("admin"), validateBody(["userId"]), AdminController.verifyDevice);
app.get("/api/admin/transactions", authMiddleware("admin"), AdminController.listTransactions);

// health
app.get("/api/health", (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "dev" }));

export default app;
