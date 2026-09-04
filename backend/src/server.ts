import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { healthRouter } from "./routes/health.routes.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use("/api/v1/health", healthRouter);

app.use((_request, response) => {
  response.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.info(`LegalMetriCheck API listening on port ${env.port}`);
});
