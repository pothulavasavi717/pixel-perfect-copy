import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  const isDuplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  const statusCode = error instanceof AppError
    ? error.statusCode
    : error instanceof multer.MulterError
      ? error.code === "LIMIT_FILE_SIZE" ? 413 : 400
      : isDuplicate ? 409 : 500;
  const message =
    error instanceof AppError
      ? error.message
      : isDuplicate
        ? "An account with this email already exists"
      : env.nodeEnv === "production"
        ? "Internal server error"
        : error instanceof Error
          ? error.message
          : "Internal server error";
  response.status(statusCode).json({ success: false, message });
};
