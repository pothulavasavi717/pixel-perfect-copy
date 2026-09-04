import "dotenv/config";

const port = Number.parseInt(process.env.PORT ?? "5000", 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

export const env = {
  port,
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "",
  aiServiceTimeoutMs: Number.parseInt(process.env.AI_SERVICE_TIMEOUT_MS ?? "10000", 10),
} as const;
