import type {
  ComplianceResult,
  DashboardStats,
  Declaration,
  Evidence,
  Inspection,
  InspectionQuery,
  NewInspectionInput,
  Paginated,
  Product,
  ProductImage,
  Report,
  User,
  Violation,
} from "@/types";
import * as mock from "./mock-data";

/**
 * Frontend service layer.
 *
 * Every function here is a placeholder returning mock fixtures. Replace the
 * bodies with real HTTP calls later — signatures are intended to stay stable so
 * no UI component needs to change.
 */

const LATENCY_MS = 320;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/* ---------------------------------- auth ---------------------------------- */

export async function login(email: string, _password: string): Promise<User> {
  void _password;
  return delay({ ...mock.currentUser, email: email || mock.currentUser.email });
}

export async function getCurrentUser(): Promise<User> {
  return delay(mock.currentUser);
}

export async function logout(): Promise<void> {
  return delay(undefined);
}

/* ------------------------------- dashboard -------------------------------- */

export async function getDashboardStats(): Promise<DashboardStats> {
  return delay(mock.dashboardStats);
}

export async function getRecentInspections(limit = 5): Promise<Inspection[]> {
  return delay(mock.inspections.slice(0, limit));
}

/* ------------------------------ inspections ------------------------------- */

export async function createInspection(input: NewInspectionInput): Promise<Inspection> {
  const draft: Inspection = {
    ...mock.inspections[0],
    id: "ins-draft",
    reference: "INS-2026-DRAFT",
    productName: input.productName,
    brand: input.brand,
    manufacturer: input.manufacturer,
    category: input.category,
    location: input.location,
    status: "pending",
    score: 0,
    violationCount: 0,
    highestSeverity: null,
  };
  return delay(draft);
}

export async function uploadProductImage(
  file: File,
  kind: ProductImage["kind"],
): Promise<ProductImage> {
  return delay({
    id: `img-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    label: kind,
    url: URL.createObjectURL(file),
    fileName: file.name,
    sizeKb: Math.round(file.size / 1024),
    uploadedAt: new Date().toISOString(),
    progress: 100,
    status: "uploaded" as const,
  });
}

export async function analyzeProduct(inspectionId: string): Promise<{ inspectionId: string }> {
  return delay({ inspectionId }, 900);
}

export async function getExtractedDeclarations(_inspectionId?: string): Promise<Declaration[]> {
  void _inspectionId;
  return delay(mock.declarations);
}

export async function updateDeclaration(
  id: string,
  value: string,
): Promise<Declaration> {
  const existing = mock.declarations.find((d) => d.id === id) ?? mock.declarations[0];
  return delay({ ...existing, extractedValue: value, confidence: 1, status: "pass" });
}

export async function getComplianceResult(inspectionId: string): Promise<ComplianceResult> {
  const inspection = mock.inspections.find((i) => i.id === inspectionId) ?? mock.inspections[0];
  const inspectionViolations = mock.violations.filter((v) => v.inspectionId === inspection.id);
  const checks: ComplianceResult["checks"] = [
    { id: "chk-1", title: "Product name declared", ruleReference: "Rule 6(1)", status: "pass", detail: "Declared on the principal display panel." },
    { id: "chk-2", title: "Manufacturer name declared", ruleReference: "Rule 6(1)(a)", status: "pass", detail: "Name matches the packer block." },
    { id: "chk-3", title: "Complete manufacturer address", ruleReference: "Rule 6(1)(a)", status: "warning", detail: "PIN code not legible in the captured image." },
    { id: "chk-4", title: "Net quantity declared", ruleReference: "Rule 6(1)(c)", status: "pass", detail: "200 g declared in prescribed units." },
    { id: "chk-5", title: "Retail sale price wording", ruleReference: "Rule 6(1)(e)", status: "fail", detail: "Prescribed inclusive-of-taxes wording absent." },
    { id: "chk-6", title: "Month and year of packing", ruleReference: "Rule 6(1)(d)", status: "fail", detail: "No packing date located on any image." },
    { id: "chk-7", title: "Consumer care details", ruleReference: "Rule 6(1)(f)", status: "pass", detail: "Email and toll-free number present." },
    { id: "chk-8", title: "Country of origin", ruleReference: "Rule 6(1)(g)", status: "pass", detail: "India declared on the back panel." },
    { id: "chk-9", title: "Importer details", ruleReference: "Rule 6(1)(b)", status: "not_detected", detail: "Not applicable for domestic packages." },
    { id: "chk-10", title: "Unit sale price", ruleReference: "Rule 6(1)(e)", status: "manual_review", detail: "Low confidence reading — needs inspector confirmation." },
  ];

  return delay({
    inspectionId: inspection.id,
    score: inspection.score || 72,
    status: inspection.status,
    passedCount: checks.filter((c) => c.status === "pass").length,
    failedCount: checks.filter((c) => c.status === "fail").length,
    warningCount: checks.filter((c) => c.status === "warning").length,
    checks,
    violations: inspectionViolations.length ? inspectionViolations : mock.violations.slice(0, 2),
  });
}

export async function getInspectionHistory(
  query: InspectionQuery = {},
): Promise<Paginated<Inspection>> {
  const {
    search = "",
    status = "all",
    severity = "all",
    inspector = "all",
    category = "all",
    manufacturer = "all",
    from,
    to,
    sort = "date_desc",
    page = 1,
    pageSize = 8,
  } = query;

  const term = search.trim().toLowerCase();
  let items = mock.inspections.filter((i) => {
    if (term && !`${i.reference} ${i.productName} ${i.brand} ${i.manufacturer}`.toLowerCase().includes(term)) return false;
    if (status !== "all" && i.status !== status) return false;
    if (severity !== "all" && i.highestSeverity !== severity) return false;
    if (inspector !== "all" && i.inspectorName !== inspector) return false;
    if (category !== "all" && i.category !== category) return false;
    if (manufacturer !== "all" && i.manufacturer !== manufacturer) return false;
    if (from && i.createdAt < from) return false;
    if (to && i.createdAt > to) return false;
    return true;
  });

  items = [...items].sort((a, b) => {
    switch (sort) {
      case "date_asc":
        return a.createdAt.localeCompare(b.createdAt);
      case "score_desc":
        return b.score - a.score;
      case "score_asc":
        return a.score - b.score;
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });

  const start = (page - 1) * pageSize;
  return delay({
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  });
}

export async function getInspection(id: string): Promise<Inspection | undefined> {
  return delay(mock.inspections.find((i) => i.id === id));
}

export async function getInspectionImages(_id?: string): Promise<ProductImage[]> {
  void _id;
  return delay(mock.productImages);
}

/* -------------------------------- products -------------------------------- */

export async function getProductRepository(search = "", category = "all"): Promise<Product[]> {
  const term = search.trim().toLowerCase();
  const items = mock.products.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (term && !`${p.name} ${p.brand} ${p.manufacturer}`.toLowerCase().includes(term)) return false;
    return true;
  });
  return delay(items);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return delay(mock.products.find((p) => p.id === id));
}

export async function getProductInspections(productId: string): Promise<Inspection[]> {
  return delay(mock.inspections.filter((i) => i.productId === productId));
}

/* ------------------------- violations and evidence ------------------------ */

export async function getViolations(inspectionId?: string): Promise<Violation[]> {
  const items = inspectionId
    ? mock.violations.filter((v) => v.inspectionId === inspectionId)
    : mock.violations;
  return delay(items);
}

export async function getViolation(id: string): Promise<Violation | undefined> {
  return delay(mock.violations.find((v) => v.id === id));
}

export async function updateViolationStatus(
  id: string,
  status: Violation["status"],
): Promise<Violation | undefined> {
  const existing = mock.violations.find((v) => v.id === id);
  return delay(existing ? { ...existing, status } : undefined);
}

export async function getEvidence(inspectionId?: string): Promise<Evidence[]> {
  const items = inspectionId
    ? mock.evidenceItems.filter((e) => e.inspectionId === inspectionId)
    : mock.evidenceItems;
  return delay(items);
}

/* --------------------------------- reports -------------------------------- */

export async function generateReport(inspectionId: string): Promise<Report> {
  const inspection = mock.inspections.find((i) => i.id === inspectionId) ?? mock.inspections[0];
  const product = mock.products.find((p) => p.id === inspection.productId) ?? mock.products[0];
  const result = await getComplianceResult(inspection.id);

  return delay({
    id: `rep-${inspection.id}`,
    inspectionId: inspection.id,
    generatedAt: new Date().toISOString(),
    inspection,
    product,
    images: mock.productImages,
    declarations: mock.declarations,
    result,
    evidence: mock.evidenceItems,
    recommendations: mock.reportRecommendations,
    inspector: mock.currentUser,
  });
}

export { MOCK_DISCLAIMER } from "./mock-data";
export { categories, inspectors, manufacturers } from "./mock-data";
