/**
 * health-score-module contracts
 * Deterministic signal scoring for FiceCal v2 FinOps outputs.
 */

/** Severity level of a health signal */
export type SignalSeverity = "ok" | "warning" | "critical";

/** Category of health signal */
export type SignalCategory =
  | "cost-efficiency"
  | "pricing-freshness"
  | "data-completeness"
  | "commitment-utilisation"
  | "budget-adherence"
  | "model-trust";

/**
 * A single health signal — one dimension of evaluation.
 * Scores are 0–100 (100 = perfect health).
 */
export type HealthSignal = {
  id: string;                    // e.g. "pricing-freshness.model-catalog"
  category: SignalCategory;
  label: string;                 // human-readable label
  score: number;                 // 0–100
  severity: SignalSeverity;
  rationale: string;             // why this score was assigned
  recommendation?: string;       // what to do to improve it
  meta?: Record<string, string>; // extra context for UI
};

/**
 * Aggregate health score across all signals.
 * weightedScore = weighted average of signal scores.
 */
export type HealthScoreResult = {
  /** Overall weighted score 0–100 */
  weightedScore: number;
  /** Overall severity derived from worst signal */
  overallSeverity: SignalSeverity;
  /** Individual signals */
  signals: HealthSignal[];
  /** ISO timestamp of computation */
  computedAt: string;
  /** Any evaluation warnings (e.g. signals skipped due to missing data) */
  warnings: string[];
};

/** Input for pricing freshness signal */
export type PricingFreshnessInput = {
  snapshotAgeInDays: number;
  pricingSourceType: "dynamic" | "hardcoded" | "verified";
  priceVerifiedAt?: string; // ISO date string
};

/** Input for budget adherence signal */
export type BudgetAdherenceInput = {
  actualAmount: string;   // decimal-safe string
  budgetAmount: string;   // decimal-safe string
};

/** Input for model trust signal */
export type ModelTrustInput = {
  pricingSourceType: "dynamic" | "hardcoded" | "verified";
  snapshotAgeInDays: number;
};
