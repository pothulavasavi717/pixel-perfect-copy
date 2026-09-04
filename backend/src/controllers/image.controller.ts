import type { Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { listImages, uploadImage } from "../services/image.service.js";

export async function uploadImageController(request: Request, response: Response): Promise<void> {
  if (!request.user) throw new AppError("Authentication required", 401);
  const inspectionId = request.params.inspectionId;
  if (typeof inspectionId !== "string") throw new AppError("Inspection ID is required", 400);
  response.status(201).json({ success: true, data: await uploadImage(inspectionId, request.file, request.user, request.body.imageType) });
}
export async function listImagesController(request: Request, response: Response): Promise<void> {
  const inspectionId = request.params.inspectionId;
  if (typeof inspectionId !== "string") throw new AppError("Inspection ID is required", 400);
  response.json({ success: true, data: await listImages(inspectionId) });
}
