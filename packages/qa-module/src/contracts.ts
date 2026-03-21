import type { EngineContract } from "./types.js";

/**
 * Output schema contracts for every Phase 2 engine function.
 *
 * A contract assertion is a predicate on one field of the engine's return value.
 * Assertions check:
 * - Field presence (not undefined)
 * - String format (decimal-safe: matches /^\d+\.\d{10}$/ or similar)
 * - Logical invariants (e.g. consumed + remaining === 100)
 * - Type guarantees (arrays, booleans, strings)
 */

// ─── Decimal-safe string guard ────────────────────────────────────────────────

function isDecimalString(v: unknown): boolean {
  if (typeof v !== "string") return false;
  return /^-?\d+\.\d{10}$/.test(v);
}

function isNonEmptyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

function isArray(v: unknown): boolean {
  return Array.isArray(v);
}

function isBoolean(v: unknown): boolean {
  return typeof v === "boolean";
}

// ─── Contract: computeErrorBudget ─────────────────────────────────────────────

export const errorBudgetContract: EngineContract = {
  id: "computeErrorBudget",
  description: "Output schema for @ficecal/sla-slo-sli-economics computeErrorBudget",
  assertions: [
    {
      field: "totalMinutes",
      description: "totalMinutes is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "allowableDowntimeMinutes",
      description: "allowableDowntimeMinutes is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "allowableDowntimeFormatted",
      description: "allowableDowntimeFormatted is a non-empty string",
      predicate: isNonEmptyString,
    },
    {
      field: "formulasApplied",
      description: "formulasApplied is a non-empty array",
      predicate: (v) => isArray(v) && (v as unknown[]).length > 0,
    },
    {
      field: "sloTarget",
      description: "sloTarget is an object with uptimePct",
      predicate: (v) =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as Record<string, unknown>)["uptimePct"] === "string",
    },
  ],
};

// ─── Contract: computeDowntimeCost ────────────────────────────────────────────

export const downtimeCostContract: EngineContract = {
  id: "computeDowntimeCost",
  description: "Output schema for @ficecal/sla-slo-sli-economics computeDowntimeCost",
  assertions: [
    {
      field: "revenueCost",
      description: "revenueCost is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "engineeringCost",
      description: "engineeringCost is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "totalCost",
      description: "totalCost is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "warnings",
      description: "warnings is an array",
      predicate: isArray,
    },
    {
      field: "currency",
      description: "currency is a non-empty string",
      predicate: isNonEmptyString,
    },
  ],
};

// ─── Contract: computeReliabilityRoi ─────────────────────────────────────────

export const reliabilityRoiContract: EngineContract = {
  id: "computeReliabilityRoi",
  description: "Output schema for @ficecal/sla-slo-sli-economics computeReliabilityRoi",
  assertions: [
    {
      field: "downtimeMinutesSaved",
      description: "downtimeMinutesSaved is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "revenueProtectedPerPeriod",
      description: "revenueProtectedPerPeriod is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "roiMultiple",
      description: "roiMultiple is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "paybackPeriods",
      description: "paybackPeriods is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "warnings",
      description: "warnings is an array",
      predicate: isArray,
    },
    {
      field: "formulasApplied",
      description: "formulasApplied contains reliability keys",
      predicate: (v) =>
        isArray(v) &&
        (v as string[]).some((k) => k.startsWith("slo.reliability")),
    },
  ],
};

// ─── Contract: computeAiCost ─────────────────────────────────────────────────

export const aiCostContract: EngineContract = {
  id: "computeAiCost",
  description: "Output schema for @ficecal/ai-token-economics computeAiCost",
  assertions: [
    {
      field: "totalCost",
      description: "totalCost is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "currency",
      description: "currency is a non-empty string",
      predicate: isNonEmptyString,
    },
    {
      field: "pricingUnit",
      description: "pricingUnit is a non-empty string",
      predicate: isNonEmptyString,
    },
    {
      field: "breakdown",
      description: "breakdown is an array",
      predicate: isArray,
    },
  ],
};

// ─── Contract: normalizeTechCosts ─────────────────────────────────────────────

export const techNormalizationContract: EngineContract = {
  id: "normalizeTechCosts",
  description: "Output schema for @ficecal/multi-tech-normalization normalizeTechCosts",
  assertions: [
    {
      field: "portfolioTotal",
      description: "portfolioTotal is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "items",
      description: "items is an array",
      predicate: isArray,
    },
    {
      field: "dominantCategory",
      description: "dominantCategory is a non-empty string",
      predicate: isNonEmptyString,
    },
    {
      field: "currency",
      description: "currency is a non-empty string",
      predicate: isNonEmptyString,
    },
    {
      field: "byCategory",
      description: "byCategory is an object",
      predicate: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
    },
    {
      field: "computedAt",
      description: "computedAt is a non-empty string",
      predicate: isNonEmptyString,
    },
  ],
};

// ─── Contract: computeBudgetVariance ─────────────────────────────────────────

export const budgetVarianceContract: EngineContract = {
  id: "computeBudgetVariance",
  description: "Output schema for @ficecal/budgeting-forecasting computeBudgetVariance",
  assertions: [
    {
      field: "totalBudgeted",
      description: "totalBudgeted is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "totalActual",
      description: "totalActual is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "totalVariance",
      description: "totalVariance is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "totalVariancePct",
      description: "totalVariancePct is a decimal-safe string",
      predicate: isDecimalString,
    },
    {
      field: "isOverBudget",
      description: "isOverBudget is a boolean",
      predicate: isBoolean,
    },
    {
      field: "items",
      description: "items is an array",
      predicate: isArray,
    },
  ],
};

// ─── Contract: computeHealthScore ────────────────────────────────────────────

export const healthScoreContract: EngineContract = {
  id: "computeHealthScore",
  description: "Output schema for @ficecal/health-score computeHealthScore",
  assertions: [
    {
      field: "weightedScore",
      description: "weightedScore is a number between 0 and 100",
      predicate: (v) => typeof v === "number" && v >= 0 && v <= 100,
    },
    {
      field: "overallSeverity",
      description: "overallSeverity is one of ok/warning/critical",
      predicate: (v) => typeof v === "string" && ["ok", "warning", "critical"].includes(v as string),
    },
    {
      field: "signals",
      description: "signals is a non-empty array",
      predicate: (v) => isArray(v) && (v as unknown[]).length > 0,
    },
    {
      field: "computedAt",
      description: "computedAt is a non-empty string",
      predicate: isNonEmptyString,
    },
  ],
};

// ─── All contracts ────────────────────────────────────────────────────────────

export const ALL_CONTRACTS: EngineContract[] = [
  errorBudgetContract,
  downtimeCostContract,
  reliabilityRoiContract,
  aiCostContract,
  techNormalizationContract,
  budgetVarianceContract,
  healthScoreContract,
];
