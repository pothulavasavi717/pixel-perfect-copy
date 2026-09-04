import type { Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { prisma } from "../config/prisma.js";
import { getInspection } from "../services/inspection.service.js";
import { runCompliance } from "../services/compliance.service.js";

export async function runComplianceController(request: Request, response: Response): Promise<void> {
  if (!request.user) throw new AppError("Authentication required", 401);
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError("Inspection ID is required", 400);
  await getInspection(id, request.user);
  response.json({ success: true, data: await runCompliance(id) });
}
export async function getComplianceController(request: Request, response: Response): Promise<void> {
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError("Inspection ID is required", 400);
  const result = await prisma.complianceResult.findUnique({ where: { inspectionId: id }, include: { checks: true } });
  if (!result) throw new AppError("Compliance has not been evaluated", 404);
  response.json({ success: true, data: result });
}
