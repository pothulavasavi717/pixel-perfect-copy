import { ComplianceCheckStatus, ComplianceOverallStatus, DeclarationType, ViolationSeverity } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

const RULES: Array<{ code: string; type: DeclarationType; name: string; severity: ViolationSeverity }> = [
  { code: "DECL_PRODUCT_NAME", type: "PRODUCT_NAME", name: "Product identification", severity: "HIGH" },
  { code: "DECL_MANUFACTURER", type: "MANUFACTURER", name: "Manufacturer declaration", severity: "HIGH" },
  { code: "DECL_NET_QUANTITY", type: "NET_QUANTITY", name: "Net quantity declaration", severity: "HIGH" },
  { code: "DECL_MRP", type: "MRP", name: "Maximum retail price declaration", severity: "HIGH" },
  { code: "DECL_CONSUMER_CARE", type: "CONSUMER_CARE", name: "Consumer care details", severity: "MEDIUM" },
];

export async function runCompliance(inspectionId: string) {
  const inspection = await prisma.inspection.findUnique({ where: { id: inspectionId }, include: { declarations: true } });
  if (!inspection) throw new AppError("Inspection not found", 404);
  const checks = RULES.map((rule) => {
    const observation = inspection.declarations.find((item) => item.declarationType === rule.type && item.extractedValue?.trim());
    return {
      rule,
      observedValue: observation?.extractedValue ?? null,
      status: observation ? ComplianceCheckStatus.PASS : ComplianceCheckStatus.MANUAL_REVIEW,
      confidence: observation?.confidence ?? null,
    };
  });
  const overallStatus = checks.some((check) => check.status === "MANUAL_REVIEW")
    ? ComplianceOverallStatus.MANUAL_REVIEW
    : ComplianceOverallStatus.PASS;
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.complianceResult.findUnique({ where: { inspectionId } });
    if (existing) {
      await tx.complianceCheck.deleteMany({ where: { complianceResultId: existing.id } });
      await tx.violation.deleteMany({ where: { inspectionId, complianceCheckId: { not: null } } });
      await tx.complianceResult.delete({ where: { id: existing.id } });
    }
    const created = await tx.complianceResult.create({
      data: { inspectionId, overallStatus, engineVersion: "demo-rules-v1", checks: { create: checks.map((check) => ({
        ruleCode: check.rule.code,
        ruleName: check.rule.name,
        status: check.status,
        observedValue: check.observedValue,
        expectedValue: "Observation required; legal reference to be configured",
        legalReference: "LEGAL_REFERENCE_TO_BE_CONFIGURED",
        explanation: check.observedValue ? "Observation present; requires configured legal evaluation." : "Observation unavailable; manual review required.",
        confidence: check.confidence,
      })) } },
      include: { checks: true },
    });
    for (const check of created.checks.filter((item) => item.status === "MANUAL_REVIEW")) {
      await tx.violation.create({
        data: {
          inspectionId,
          complianceCheckId: check.id,
          severity: "MEDIUM",
          title: `${check.ruleName} requires review`,
          description: check.explanation ?? "Required observation was not available.",
          status: "OPEN",
        },
      });
    }
    await tx.inspection.update({ where: { id: inspectionId }, data: { status: "NEEDS_REVIEW" } });
    return created;
  });
  return result;
}
