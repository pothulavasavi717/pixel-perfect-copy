import { AppError } from "../utils/app-error.js";

export interface CredentialsInput {
  email: string;
  password: string;
}

export interface RegisterInput extends CredentialsInput {
  name: string;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`${field} is required`, 400);
  }
  return value.trim();
}

function normalizeEmail(value: unknown): string {
  const email = requireString(value, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("email must be valid", 400);
  }
  return email;
}

function requirePassword(value: unknown): string {
  if (typeof value !== "string" || value.length < 8) {
    throw new AppError("password must be at least 8 characters", 400);
  }
  return value;
}

function requireLoginPassword(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError("password is required", 400);
  }
  return value;
}

export function validateRegisterInput(body: unknown): RegisterInput {
  if (!body || typeof body !== "object") throw new AppError("Request body is required", 400);
  const input = body as Record<string, unknown>;
  const name = requireString(input.name, "name");
  if (name.length > 120) throw new AppError("name is too long", 400);
  return { name, email: normalizeEmail(input.email), password: requirePassword(input.password) };
}

export function validateLoginInput(body: unknown): CredentialsInput {
  if (!body || typeof body !== "object") throw new AppError("Request body is required", 400);
  const input = body as Record<string, unknown>;
  return { email: normalizeEmail(input.email), password: requireLoginPassword(input.password) };
}
