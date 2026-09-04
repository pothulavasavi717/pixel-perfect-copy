import { ReportType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function createReport(inspectionId: string, userId: string) {
  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: { product: true, inspector: { select: { id: true, name: true, email: true } }, images: true, declarations: true, complianceResult: { include: { checks: true } }, violations: true, evidence: true },
  });
  if (!inspection) throw new AppError("Inspection not found", 404);
  const report = await prisma.report.create({ data: { inspectionId, reportType: ReportType.EDITABLE, generatedBy: userId } });
  return { id: report.id, generatedAt: report.generatedAt, inspection, disclaimer: "This report assists inspection and does not replace official legal judgment." };
}

export async function getReport(inspectionId: string) {
  const report = await prisma.report.findFirst({ where: { inspectionId }, orderBy: { generatedAt: "desc" } });
  if (!report) throw new AppError("Report has not been generated", 404);
  return createReportPayload(inspectionId, report);
}

async function createReportPayload(inspectionId: string, report: { id: string; generatedAt: Date }) {
  const inspection = await prisma.inspection.findUnique({ where: { id: inspectionId }, include: { product: true, images: true, declarations: true, complianceResult: { include: { checks: true } }, violations: true, evidence: true } });
  if (!inspection) throw new AppError("Inspection not found", 404);
  return { id: report.id, generatedAt: report.generatedAt, inspection, disclaimer: "This report assists inspection and does not replace official legal judgment." };
}
