import { AppError } from "../utils/app-error.js";
import { env } from "../config/env.js";

export interface ExtractionField {
  field: string;
  value: string;
  confidence?: number;
  source: "ocr" | "ai" | "manual";
  evidence?: { page: number; x: number; y: number; width: number; height: number };
}

export interface ExtractionResult {
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  text: string;
  fields: ExtractionField[];
  warnings: string[];
}

export function parseExtractionResponse(value: unknown): ExtractionResult {
  if (!value || typeof value !== "object") {
    throw new AppError("AI extraction service returned malformed data", 502);
  }
  const result = value as Record<string, unknown>;
  if (
    !["SUCCESS", "PARTIAL", "FAILED"].includes(String(result.status)) ||
    typeof result.text !== "string" ||
    !Array.isArray(result.fields) ||
    !Array.isArray(result.warnings)
  ) {
    throw new AppError("AI extraction service returned malformed data", 502);
  }
  return result as unknown as ExtractionResult;
}

export async function extractObservations(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
): Promise<ExtractionResult> {
  if (!env.aiServiceUrl) {
    return {
      status: "FAILED",
      text: "",
      fields: [],
      warnings: ["OCR provider unavailable: AI_SERVICE_URL is not configured"],
    };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.aiServiceTimeoutMs);
  try {
    const form = new FormData();
    const bytes = new Uint8Array(buffer);
    form.append("image", new Blob([bytes.buffer as ArrayBuffer], { type: mimeType }), originalName);
    const response = await fetch(`${env.aiServiceUrl.replace(/\/$/, "")}/extract`, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) throw new AppError(`AI extraction service returned HTTP ${response.status}`, 502);
    return parseExtractionResponse(await response.json());
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("AI extraction service timed out", 504);
    }
    throw new AppError("AI extraction service is unavailable", 502);
  } finally {
    clearTimeout(timeout);
  }
}
