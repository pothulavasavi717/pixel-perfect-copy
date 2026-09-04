import type { Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { extractLatestImage } from "../services/image.service.js";

export async function extractController(request: Request, response: Response): Promise<void> {
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError("Inspection ID is required", 400);
  response.json({ success: true, data: await extractLatestImage(id) });
}
