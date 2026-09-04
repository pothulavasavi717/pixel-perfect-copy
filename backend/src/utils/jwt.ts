import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "./app-error.js";

export interface AuthTokenPayload {
  sub: string;
  role: Role;
}

function requireSecret(): string {
  if (!env.jwtSecret) throw new AppError("JWT authentication is not configured", 503);
  return env.jwtSecret;
}

export function createToken(payload: AuthTokenPayload): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, requireSecret(), options);
}

export function verifyToken(token: string): AuthTokenPayload {
  try {
    const payload = jwt.verify(token, requireSecret());
    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.sub !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "INSPECTOR" && payload.role !== "REVIEWER")
    ) {
      throw new Error("Invalid token payload");
    }
    return { sub: payload.sub, role: payload.role };
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}
