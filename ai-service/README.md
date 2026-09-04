# LegalMetriCheck AI service

FastAPI observation extraction boundary. It never determines compliance or
invents declarations. `GET /health` reports health and `POST /extract` accepts
an `image` multipart field. Without `OCR_PROVIDER=mock`, extraction returns
`FAILED` with an explicit unavailable warning. The mock provider returns an
empty `PARTIAL` result for local demos.

```sh
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
pytest
```
