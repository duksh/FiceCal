import type { HealthSignal, PricingFreshnessInput, BudgetAdherenceInput, ModelTrustInput } from "./types.js";

/** Thresholds */
const PRICING_WARNING_DAYS = 7;
const PRICING_CRITICAL_DAYS = 30;
const BUDGET_WARNING_PCT = 0.85;   // 85% of budget used = warning
const BUDGET_CRITICAL_PCT = 1.0;   // 100%+ = critical

/**
 * Pricing freshness signal.
 * dynamic + fresh → 100. hardcoded/stale degrades.
 */
export function evaluatePricingFreshness(input: PricingFreshnessInput): HealthSignal {
  const { snapshotAgeInDays, pricingSourceType } = input;

  let score: number;
  let rationale: string;
  let recommendation: string | undefined;

  if (pricingSourceType === "verified") {
    score = 100;
    rationale = "Price data is vendor-verified.";
  } else if (pricingSourceType === "dynamic") {
    if (snapshotAgeInDays <= PRICING_WARNING_DAYS) {
      score = 100;
      rationale = `Prices scraped ${snapshotAgeInDays} day(s) ago — within freshness threshold.`;
    } else if (snapshotAgeInDays <= PRICING_CRITICAL_DAYS) {
      // Linear decay: 100 at 7 days → 50 at 30 days
      score = Math.round(100 - ((snapshotAgeInDays - PRICING_WARNING_DAYS) / (PRICING_CRITICAL_DAYS - PRICING_WARNING_DAYS)) * 50);
      rationale = `Prices scraped ${snapshotAgeInDays} day(s) ago — approaching staleness threshold.`;
      recommendation = "Trigger a fresh scrape to restore pricing confidence.";
    } else {
      score = 0;
      rationale = `Prices scraped ${snapshotAgeInDays} day(s) ago — stale beyond acceptable threshold.`;
      recommendation = "Prices are stale. Outputs using this catalog should be treated as estimates only.";
    }
  } else {
    // hardcoded
    if (snapshotAgeInDays <= PRICING_WARNING_DAYS) {
      score = 75;
      rationale = `Price is manually maintained. Last verified ${snapshotAgeInDays} day(s) ago.`;
      recommendation = "Verify this price against the vendor's pricing page.";
    } else if (snapshotAgeInDays <= PRICING_CRITICAL_DAYS) {
      score = 40;
      rationale = `Manually maintained price is ${snapshotAgeInDays} day(s) old — potentially outdated.`;
      recommendation = "Manually verify and update this price.";
    } else {
      score = 0;
      rationale = `Manually maintained price is ${snapshotAgeInDays} day(s) old — likely outdated.`;
      recommendation = "This price is significantly out of date and must be reverified before use in decisions.";
    }
  }

  const severity = score >= 75 ? "ok" : score >= 40 ? "warning" : "critical";

  return {
    id: "pricing-freshness.model-catalog",
    category: "pricing-freshness",
    label: "Pricing Freshness",
    score,
    severity,
    rationale,
    ...(recommendation ? { recommendation } : {}),
    meta: {
      snapshotAgeInDays: String(snapshotAgeInDays),
      pricingSourceType,
    },
  };
}

/**
 * Budget adherence signal.
 * actualAmount / budgetAmount → percentage used.
 * Uses plain JS division — amounts are already validated upstream.
 */
export function evaluateBudgetAdherence(input: BudgetAdherenceInput): HealthSignal {
  const actual = parseFloat(input.actualAmount);
  const budget = parseFloat(input.budgetAmount);

  if (isNaN(actual) || isNaN(budget) || budget <= 0) {
    return {
      id: "budget-adherence.primary",
      category: "budget-adherence",
      label: "Budget Adherence",
      score: 0,
      severity: "critical",
      rationale: "Budget or actual amount is invalid or zero.",
      recommendation: "Provide valid actual and budget amounts.",
    };
  }

  const ratio = actual / budget;
  let score: number;
  let rationale: string;
  let recommendation: string | undefined;

  if (ratio <= BUDGET_WARNING_PCT) {
    score = 100;
    rationale = `Spending at ${Math.round(ratio * 100)}% of budget — within healthy range.`;
  } else if (ratio < BUDGET_CRITICAL_PCT) {
    // Linear decay: 100 at 85% → 0 at 100%
    score = Math.round((1 - (ratio - BUDGET_WARNING_PCT) / (BUDGET_CRITICAL_PCT - BUDGET_WARNING_PCT)) * 100);
    rationale = `Spending at ${Math.round(ratio * 100)}% of budget — approaching limit.`;
    recommendation = "Review upcoming spend to avoid budget breach.";
  } else {
    score = 0;
    rationale = `Spending at ${Math.round(ratio * 100)}% of budget — limit exceeded.`;
    recommendation = "Budget has been exceeded. Escalate for review and corrective action.";
  }

  const severity = score >= 75 ? "ok" : score >= 40 ? "warning" : "critical";

  return {
    id: "budget-adherence.primary",
    category: "budget-adherence",
    label: "Budget Adherence",
    score,
    severity,
    rationale,
    ...(recommendation ? { recommendation } : {}),
    meta: {
      actualAmount: input.actualAmount,
      budgetAmount: input.budgetAmount,
      ratioPercent: String(Math.round(ratio * 100)),
    },
  };
}

/**
 * Model trust signal — how much to trust AI model pricing reference data.
 */
export function evaluateModelTrust(input: ModelTrustInput): HealthSignal {
  const { pricingSourceType, snapshotAgeInDays } = input;

  let score: number;
  let rationale: string;
  let recommendation: string | undefined;

  if (pricingSourceType === "verified") {
    score = 100;
    rationale = "Model pricing is vendor-verified — highest trust level.";
  } else if (pricingSourceType === "dynamic" && snapshotAgeInDays <= 7) {
    score = 90;
    rationale = "Model pricing is from a live scrape and recently refreshed.";
  } else if (pricingSourceType === "dynamic" && snapshotAgeInDays <= 30) {
    score = 65;
    rationale = `Model pricing is from a live scrape but ${snapshotAgeInDays} day(s) old.`;
    recommendation = "Refresh the model catalog to restore pricing confidence.";
  } else if (pricingSourceType === "hardcoded" && snapshotAgeInDays <= 7) {
    score = 60;
    rationale = "Model pricing is manually maintained. Verify against vendor's pricing page.";
    recommendation = "Confirm this price reflects the current vendor rate.";
  } else {
    score = 20;
    rationale = `Model pricing is manually maintained and ${snapshotAgeInDays} day(s) old — low trust.`;
    recommendation = "This price must be reverified before use in any cost decision.";
  }

  const severity = score >= 75 ? "ok" : score >= 40 ? "warning" : "critical";

  return {
    id: "model-trust.pricing",
    category: "model-trust",
    label: "Model Pricing Trust",
    score,
    severity,
    rationale,
    ...(recommendation ? { recommendation } : {}),
    meta: { pricingSourceType, snapshotAgeInDays: String(snapshotAgeInDays) },
  };
}
