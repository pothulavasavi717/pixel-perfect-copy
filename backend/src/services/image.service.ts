import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { DeclarationType, ImageType, type Role } from "@prisma/client";
import type { Express } from "express";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { extractObservations, type ExtractionResult } from "./ai-extraction.service.js";

const allowed = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"]]);
const declarationTypes = new Set(Object.values(DeclarationType));

async function cleanupFile(path: string): Promise<void> {
  try { await unlink(path); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("Upload cleanup failed", error);
  }
}

async function persistObservations(inspectionId: string, imageId: string, extraction: ExtractionResult): Promise<void> {
  if (extraction.status === "FAILED") return;
  await prisma.$transaction(async (tx) => {
    for (const field of extraction.fields) {
      const type = field.field.toUpperCase();
      if (!declarationTypes.has(type as DeclarationType)) continue;
      await tx.extractedDeclaration.create({
        data: {
          inspectionId,
          sourceImageId: imageId,
          declarationType: type as DeclarationType,
          extractedValue: field.value,
          confidence: field.confidence,
          boundingBox: field.evidence,
        },
      });
    }
  });
}

export async function uploadImage(
  inspectionId: string,
  file: Express.Multer.File | undefined,
  user: { id: string; role: Role },
  imageTypeInput: unknown,
) {
  if (!file) throw new AppError("An image file is required", 400);
  const detected = await fileTypeFromBuffer(file.buffer);
  const extension = detected?.mime ? allowed.get(detected.mime) : undefined;
  if (!extension || detected?.mime !== file.mimetype) throw new AppError("Only JPEG, PNG, and WebP images are supported", 415);
  const inspection = await prisma.inspection.findUnique({ where: { id: inspectionId } });
  if (!inspection) throw new AppError("Inspection not found", 404);
  if (user.role !== "ADMIN" && inspection.inspectorId !== user.id) throw new AppError("Not authorized for this inspection", 403);

  const uploadRoot = resolve(env.uploadDir);
  const safeName = `${randomUUID()}${extension}`;
  const absolutePath = resolve(uploadRoot, safeName);
  if (relative(uploadRoot, absolutePath).startsWith("..")) throw new AppError("Invalid upload path", 500);
  await mkdir(uploadRoot, { recursive: true });
  await writeFile(absolutePath, file.buffer, { flag: "wx" });

  let image;
  try {
    image = await prisma.productImage.create({
      data: {
        inspectionId,
        fileName: basename(file.originalname),
        filePath: safeName,
        mimeType: detected.mime,
        fileSize: file.size,
        imageType: typeof imageTypeInput === "string" && Object.values(ImageType).includes(imageTypeInput as ImageType)
          ? imageTypeInput as ImageType : ImageType.OTHER,
      },
    });
  } catch (error) {
    await cleanupFile(absolutePath);
    throw error;
  }

  let extraction: ExtractionResult;
  try {
    extraction = await extractObservations(file.buffer, detected.mime, file.originalname);
    if (extraction.status !== "FAILED") await persistObservations(inspectionId, image.id, extraction);
  } catch (error) {
    try { await prisma.productImage.delete({ where: { id: image.id } }); } catch (cleanupError) { console.error("ProductImage cleanup failed", cleanupError); }
    await cleanupFile(absolutePath);
    throw error;
  }
  return { image, extraction };
}

export async function listImages(inspectionId: string) {
  return prisma.productImage.findMany({ where: { inspectionId }, orderBy: { createdAt: "asc" } });
}

export async function extractLatestImage(inspectionId: string) {
  const image = await prisma.productImage.findFirst({ where: { inspectionId }, orderBy: { createdAt: "desc" } });
  if (!image) throw new AppError("No uploaded image found", 404);
  const buffer = await readFile(resolve(env.uploadDir, image.filePath));
  const extraction = await extractObservations(buffer, image.mimeType, image.fileName);
  if (extraction.status !== "FAILED") await persistObservations(inspectionId, image.id, extraction);
  return extraction;
}
