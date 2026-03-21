// ─── Shared context ───────────────────────────────────────────────────────────

export type AppMode = "quick" | "operator" | "architect";

export interface SharedContext {
  workspaceId: string;
  startDate: string;
  endDate: string;
  currency: string;
}

// ─── Cost estimate form ───────────────────────────────────────────────────────

export type PricingUnit =
  | "per_token"
  | "per_1k_tokens"
  | "per_1m_tokens"
  | "per_image"
  | "per_request"
  | "per_second";

export interface CostEstimateForm {
  pricingUnit: PricingUnit;
  inputTokens: string;
  outputTokens: string;
  inputPrice: string;
  outputPrice: string;
  imageCount: string;
  pricePerImage: string;
  resolutionMultiplier: string;
  requestCount: string;
  pricePerRequest: string;
  durationSeconds: string;
  pricePerSecond: string;
}
