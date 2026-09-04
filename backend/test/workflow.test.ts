import assert from "node:assert/strict";
import test from "node:test";
import { parseExtractionResponse } from "../src/services/ai-extraction.service.js";

test("extraction response preserves observation-only structure", () => {
  const result = parseExtractionResponse({
    status: "PARTIAL",
    text: "",
    fields: [{ field: "PRODUCT_NAME", value: "Sample", source: "ocr" }],
    warnings: ["manual review required"],
  });
  assert.equal(result.status, "PARTIAL");
  assert.equal(result.fields[0]?.value, "Sample");
});

test("malformed extraction responses are rejected", () => {
  assert.throws(() => parseExtractionResponse({ status: "SUCCESS" }), { statusCode: 502 });
});
