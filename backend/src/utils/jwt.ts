import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "change_this_to_a_strong_secret";

export function signToken(payload: object, expiresIn = "1h") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
