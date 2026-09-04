import type { NextFunction, Request, Response } from "express";
import { getAuthenticatedUser } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";
import { verifyToken } from "../utils/jwt.js";

export async function authenticate(request: Request, _response: Response, next: NextFunction): Promise<void> {
  try {
    const header = request.header("authorization");
    if (!header?.startsWith("Bearer ")) throw new AppError("Authentication required", 401);
    const token = header.slice("Bearer ".length).trim();
    if (!token) throw new AppError("Authentication required", 401);
    request.user = await getAuthenticatedUser(verifyToken(token).sub);
    next();
  } catch (error) {
    next(error);
  }
}
