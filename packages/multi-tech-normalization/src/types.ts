/**
 * Technology category taxonomy.
 *
 * Used to normalize heterogeneous cost inputs (cloud compute, AI tokens,
 * SaaS licences, on-prem hardware) into a common analytical basis so that
 * cross-category comparisons and portfolio-level cost roll-ups are possible.
 */
export type TechCategory =
  | "cloud-compute"       // VMs, containers, serverless ($/vCPU-hour)
  | "cloud-storage"       // Object/block/file storage ($/GB-month)
  | "cloud-network"       // Egress, inter-AZ, CDN ($/GB)
  | "ai-inference"        // Token-based AI calls ($/1M tokens equivalent)
  | "ai-training"         // GPU-hour training runs ($/GPU-hour)
  | "saas-licence"        // Per-seat / per-unit SaaS ($/seat-month)
  | "on-prem-hardware"    // Amortised server cost ($/hour)
  | "managed-service"     // PaaS databases, queues, etc. ($/hour)
  | "data-transfer"       // Cross-region / internet egress ($/GB)
  | "support-contract";   // Vendor support tiers ($/month flat)

// ─── Normalisation basis ──────────────────────────────────────────────────────

/**
 * The canonical basis unit each category normalises to.
 * All normalised outputs carry a `basisUnit` so consumers can compare apples
 * to apples across categories.
 */
export const CATEGORY_BASIS_UNIT: Record<TechCategory, string> = {
  "cloud-compute":    "$/hour",
  "cloud-storage":    "$/GB-month",
  "cloud-network":    "$/GB",
  "ai-inference":     "$/1M-tokens-equivalent",
  "ai-training":      "$/GPU-hour",
  "saas-licence":     "$/seat-month",
  "on-prem-hardware": "$/hour",
  "managed-service":  "$/hour",
  "data-transfer":    "$/GB",
  "support-contract": "$/month",
};

// ─── Input ────────────────────────────────────────────────────────────────────

export interface TechCostInput {
  /** Stable identifier for this cost line. */
  id: string;

  /** Human-readable label. */
  label: string;

  /** Technology category — drives the normalisation formula. */
  category: TechCategory;

  /** Raw cost amount as a decimal string. */
  rawCost: string;

  /** ISO 4217 currency of rawCost. */
  currency: string;

  /** Quantity of the category's native unit consumed. */
  quantity: number;

  /**
   * Native unit of measurement matching the category convention.
   * e.g. "vCPU-hours", "GB", "tokens", "seats", "GPU-hours"
   */
  nativeUnit: string;

  /** Optional weight for portfolio roll-up (default 1). */
  weight?: number;
}

// ─── Output ───────────────────────────────────────────────────────────────────

export interface NormalizedTechCost {
  id: string;
  label: string;
  category: TechCategory;

  /** Cost per basis unit as a decimal-safe string. */
  costPerBasisUnit: string;

  /** The canonical basis unit for this category. */
  basisUnit: string;

  /** Total normalised cost (costPerBasisUnit × quantity) as decimal-safe string. */
  normalizedTotal: string;

  /** Original raw cost for reference. */
  rawCost: string;

  currency: string;

  /** Cost efficiency index relative to category median (1.0 = at median). */
  efficiencyIndex: string;

  formulasApplied: string[];
}

export interface TechNormalizationResult {
  /** All normalised line items. */
  items: NormalizedTechCost[];

  /** Grand total across all items (same currency assumed). */
  portfolioTotal: string;

  currency: string;

  /** Breakdown by category — total cost per category. */
  byCategory: Record<string, string>;

  /** Category with the highest share of portfolio spend. */
  dominantCategory: TechCategory;

  computedAt: string;
  warnings: string[];
}
