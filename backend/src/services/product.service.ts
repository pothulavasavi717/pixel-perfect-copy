import { prisma } from "../config/prisma.js";

export async function listProducts() {
  return prisma.product.findMany({ include: { inspections: { orderBy: { createdAt: "desc" }, take: 1, include: { complianceResult: true } } }, orderBy: { updatedAt: "desc" } });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id }, include: { inspections: { orderBy: { createdAt: "desc" }, include: { complianceResult: true } } } });
}

export async function createProduct(data: { productName: string; brandName?: string; category?: string; manufacturerName?: string; batchNumber?: string }) {
  return prisma.product.create({ data });
}
