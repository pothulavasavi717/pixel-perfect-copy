import type { RequestHandler } from "express";
import type { Role } from "@prisma/client";
import { AppError } from "../utils/app-error.js";

export function authorizeRoles(...roles: Role[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.user) return next(new AppError("Authentication required", 401));
    if (!roles.includes(request.user.role)) return next(new AppError("Insufficient permissions", 403));
    next();
  };
}
