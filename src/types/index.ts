/**
 * Domain types for LegalMetriCheck.
 * Shared by the UI and the (currently mocked) service layer in src/services.
 */

export type ComplianceStatus =
  | "compliant"
  | "non_compliant"
  | "pending"
  | "manual_review";

export type CheckStatus = "pass" | "fail" | "warning" | "not_detected" | "manual_review";

export type Severity = "critical" | "major" | "minor";

export type ViolationStatus = "open" | "acknowledged" | "resolved" | "dismissed";

export type ImageKind = "front" | "back" | "side" | "label" | "mrp" | "other";

export type DeclarationKey =
  | "product_name"
  | "manufacturer_name"
  | "manufacturer_address"
  | "packer_details"
  | "importer_details"
  | "net_quantity"
  | "mrp"
  | "date_of_packing"
  | "consumer_care"
  | "country_of_origin"
  | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  designation: string;
  zone: string;
  employeeId: string;
  phone: string;
  initials: string;
}

export interface ProductImage {
  id: string;
  kind: ImageKind;
  label: string;
  url: string;
  fileName: string;
  sizeKb: number;
  uploadedAt: string;
  progress: number;
  status: "uploading" | "uploaded" | "error";
  error?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  manufacturer: string;
  manufacturerAddress: string;
  batchNumber: string;
  imageUrl?: string;
  lastInspectedAt: string;
  complianceStatus: ComplianceStatus;
  violationCount: number;
  inspectionIds: string[];
}

export interface Declaration {
  id: string;
  key: DeclarationKey;
  label: string;
  extractedValue: string | null;
  confidence: number;
  sourceImageId: string | null;
  sourceImageLabel: string | null;
  status: CheckStatus;
  editable: boolean;
  note?: string;
}

export interface ComplianceCheck {
  id: string;
  title: string;
  ruleReference: string;
  status: CheckStatus;
  detail: string;
}

export interface Violation {
  id: string;
  inspectionId: string;
  title: string;
  description: string;
  detectedValue: string | null;
  expectedRequirement: string;
  ruleReference: string;
  severity: Severity;
  category: string;
  evidenceImageId: string | null;
  imageRegion?: { x: number; y: number; width: number; height: number };
  recommendation: string;
  status: ViolationStatus;
}

export interface Evidence {
  id: string;
  inspectionId: string;
  imageId: string;
  imageUrl: string;
  caption: string;
  capturedAt: string;
  kind: ImageKind;
  linkedViolationIds: string[];
}

export interface ComplianceResult {
  inspectionId: string;
  score: number;
  status: ComplianceStatus;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  checks: ComplianceCheck[];
  violations: Violation[];
}

export interface Inspection {
  id: string;
  reference: string;
  productId: string;
  productName: string;
  brand: string;
  manufacturer: string;
  category: string;
  inspectorId: string;
  inspectorName: string;
  location: string;
  createdAt: string;
  status: ComplianceStatus;
  score: number;
  violationCount: number;
  highestSeverity: Severity | null;
  imageIds: string[];
}

export interface Report {
  id: string;
  inspectionId: string;
  generatedAt: string;
  inspection: Inspection;
  product: Product;
  images: ProductImage[];
  declarations: Declaration[];
  result: ComplianceResult;
  evidence: Evidence[];
  recommendations: string[];
  inspector: User;
}

export interface DashboardStats {
  totalInspections: number;
  productsScanned: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  compliancePercentage: number;
  monthlyTrend: { month: string; inspections: number; violations: number }[];
  violationCategories: { category: string; count: number }[];
  severityBreakdown: { severity: Severity; count: number }[];
}

export interface InspectionQuery {
  search?: string;
  status?: ComplianceStatus | "all";
  severity?: Severity | "all";
  inspector?: string | "all";
  category?: string | "all";
  manufacturer?: string | "all";
  from?: string;
  to?: string;
  sort?: "date_desc" | "date_asc" | "score_desc" | "score_asc";
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NewInspectionInput {
  productName: string;
  brand: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  location: string;
  notes?: string;
}
