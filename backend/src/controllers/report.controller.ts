import type { Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { createReport, getReport } from "../services/report.service.js";

export async function createReportController(request: Request, response: Response): Promise<void> {
  if (!request.user) throw new AppError("Authentication required", 401);
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError("Inspection ID is required", 400);
  response.status(201).json({ success: true, data: await createReport(id, request.user.id) });
}
export async function getReportController(request: Request, response: Response): Promise<void> {
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError("Inspection ID is required", 400);
  response.json({ success: true, data: await getReport(id) });
}
