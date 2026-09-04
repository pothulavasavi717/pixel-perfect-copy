import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function createEvidenceController(request: Request, response: Response): Promise<void> {
  const inspectionId = request.params.id;
  if (typeof inspectionId !== "string") throw new AppError("Inspection ID is required", 400);
  const evidence = await prisma.evidence.create({ data: { inspectionId, imageId: request.body.imageId, violationId: request.body.violationId, description: request.body.description } });
  response.status(201).json({ success: true, data: evidence });
}
export async function listEvidenceController(request: Request, response: Response): Promise<void> {
  const inspectionId = request.params.id;
  if (typeof inspectionId !== "string") throw new AppError("Inspection ID is required", 400);
  response.json({ success: true, data: await prisma.evidence.findMany({ where: { inspectionId }, orderBy: { createdAt: "desc" } }) });
}
