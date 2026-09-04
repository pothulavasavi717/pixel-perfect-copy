import type { Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { createInspection, getInspection, listInspections, updateInspection } from "../services/inspection.service.js";

export async function createInspectionController(request: Request, response: Response): Promise<void> {
  if (!request.user) throw new AppError("Authentication required", 401);
  response.status(201).json({ success: true, data: await createInspection(request.body, request.user.id) });
}
export async function listInspectionsController(request: Request, response: Response): Promise<void> {
  if (!request.user) throw new AppError("Authentication required", 401);
  response.json({ success: true, data: await listInspections(request.user.id, request.user.role) });
}
export async function getInspectionController(request: Request, response: Response): Promise<void> {
  if (!request.user) throw new AppError("Authentication required", 401);
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError("Inspection ID is required", 400);
  response.json({ success: true, data: await getInspection(id, request.user) });
}
export async function updateInspectionController(request: Request, response: Response): Promise<void> {
  if (!request.user) throw new AppError("Authentication required", 401);
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError("Inspection ID is required", 400);
  response.json({ success: true, data: await updateInspection(id, request.body, request.user) });
}
