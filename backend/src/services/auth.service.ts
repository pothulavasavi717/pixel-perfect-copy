import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { createToken } from "../utils/jwt.js";
import type { CredentialsInput, RegisterInput } from "../validators/auth.js";

export type SafeUser = Pick<User, "id" | "name" | "email" | "role">;

function toSafeUser(user: User): SafeUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("An account with this email already exists", 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash, role: "INSPECTOR" },
  });
  const safeUser = toSafeUser(user);
  return { user: safeUser, token: createToken({ sub: user.id, role: user.role }) };
}

export async function login(input: CredentialsInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = user?.passwordHash ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !user.isActive || !valid) throw new AppError("Invalid email or password", 401);

  return { user: toSafeUser(user), token: createToken({ sub: user.id, role: user.role }) };
}

export async function getAuthenticatedUser(id: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !user.isActive) throw new AppError("Authentication required", 401);
  return toSafeUser(user);
}
