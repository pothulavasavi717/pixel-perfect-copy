import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter, rbacRouter } from "./routes/auth.routes.js";
import { inspectionRouter } from "./routes/inspection.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { createEvidenceController, listEvidenceController } from "./controllers/evidence.controller.js";
import { createReportController, getReportController } from "./controllers/report.controller.js";
import { authenticate } from "./middleware/auth.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", rbacRouter);
app.use("/api/v1/inspections", inspectionRouter);
app.use("/api/v1/products", productRouter);
app.post("/api/v1/inspections/:id/evidence", authenticate, createEvidenceController);
app.get("/api/v1/inspections/:id/evidence", authenticate, listEvidenceController);
app.post("/api/v1/inspections/:id/report", authenticate, createReportController);
app.get("/api/v1/inspections/:id/report", authenticate, getReportController);

app.use((_request, response) => {
  response.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.info(`LegalMetriCheck API listening on port ${env.port}`);
});
