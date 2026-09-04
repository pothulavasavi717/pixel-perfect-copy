import { InspectionStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function createInspection(
  input: { productName: string; brandName?: string; category?: string; manufacturerName?: string; batchNumber?: string },
  inspectorId: string,
) {
  if (!input.productName?.trim()) throw new AppError("productName is required", 400);
  const product = await prisma.product.create({
    data: {
      productName: input.productName.trim(),
      brandName: input.brandName?.trim() || null,
      category: input.category?.trim() || null,
      manufacturerName: input.manufacturerName?.trim() || null,
      batchNumber: input.batchNumber?.trim() || null,
    },
  });
  const inspection = await prisma.inspection.create({
    data: {
      inspectionNumber: `INS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      inspectorId,
      status: InspectionStatus.CREATED,
    },
    include: { product: true, inspector: { select: { id: true, name: true, email: true, role: true } } },
  });
  return inspection;
}

export async function listInspections(inspectorId: string, role: string) {
  return prisma.inspection.findMany({
    where: role === "ADMIN" || role === "REVIEWER" ? undefined : { inspectorId },
    include: { product: true, images: true, complianceResult: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInspection(id: string, user: { id: string; role: string }) {
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: { product: true, images: true, declarations: true, complianceResult: { include: { checks: true } }, violations: true, evidence: true },
  });
  if (!inspection) throw new AppError("Inspection not found", 404);
  if (user.role !== "ADMIN" && user.role !== "REVIEWER" && inspection.inspectorId !== user.id) {
    throw new AppError("You are not authorized to access this inspection", 403);
  }
  return inspection;
}

export async function updateInspection(id: string, input: { status?: InspectionStatus }, user: { id: string; role: string }) {
  await getInspection(id, user);
  if (!input.status) throw new AppError("At least one supported field is required", 400);
  return prisma.inspection.update({ where: { id }, data: { status: input.status } });
}
