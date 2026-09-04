export function getHealth() {
  return {
    success: true as const,
    service: "LegalMetriCheck API" as const,
    version: "v1" as const,
    status: "healthy" as const,
  };
}
