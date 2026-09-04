import os
from typing import Literal

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

app = FastAPI(title="LegalMetriCheck AI Service")
SUPPORTED = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 10 * 1024 * 1024


class Field(BaseModel):
    field: str
    value: str
    confidence: float | None = None
    source: Literal["ocr", "ai", "manual"]
    evidence: dict[str, float | int] | None = None


class Extraction(BaseModel):
    status: Literal["SUCCESS", "PARTIAL", "FAILED"]
    text: str
    fields: list[Field]
    warnings: list[str]


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "LegalMetriCheck AI Service", "status": "healthy"}


@app.post("/extract", response_model=Extraction)
async def extract(image: UploadFile = File(...)) -> Extraction:
    if image.content_type not in SUPPORTED:
        raise HTTPException(415, "Only JPEG, PNG, and WebP images are supported")
    content = await image.read(MAX_BYTES + 1)
    if len(content) > MAX_BYTES:
        raise HTTPException(413, "Image exceeds the 10 MB limit")
    if os.getenv("OCR_PROVIDER", "").lower() == "mock":
        return Extraction(status="PARTIAL", text="", fields=[], warnings=["Mock provider returned no observations"])
    return Extraction(status="FAILED", text="", fields=[], warnings=["OCR provider unavailable; no engine configured"])
