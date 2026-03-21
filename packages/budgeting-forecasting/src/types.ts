import type { Period } from "@ficecal/core-economics";

// ─── Budget line item ──────────────────────────────────────────────────────────

/**
 * A single budget line item representing a spending category or cost centre.
 */
export interface BudgetLineItem {
  /** Stable unique identifier. */
  id: string;

  /** Human label. */
  label: string;

  /** Budgeted spend for this item in the current period (decimal string). */
  budgetedAmount: string;

  /** Actual spend recorded so far in the current period (decimal string). */
  actualAmount: string;

  /** ISO 4217 currency code. */
  currency: string;
}

// ─── Budget variance result ────────────────────────────────────────────────────

export interface BudgetVarianceItem {
  id: string;
  label: string;
  budgetedAmount: string;
  actualAmount: string;
  /** Absolute variance: actual − budgeted (positive = over budget). */
  varianceAmount: string;
  /** Variance as a percentage of budgeted amount (decimal string). */
  variancePct: string;
  /** Whether actual spend exceeds the budgeted amount. */
  isOverBudget: boolean;
  currency: string;
}

export interface BudgetVarianceResult {
  items: BudgetVarianceItem[];
  /** Total budgeted across all items. */
  totalBudgeted: string;
  /** Total actual across all items. */
  totalActual: string;
  /** Total variance: totalActual − totalBudgeted. */
  totalVariance: string;
  /** Portfolio-level variance percentage. */
  totalVariancePct: string;
  /** True if totalActual > totalBudgeted. */
  isOverBudget: boolean;
  currency: string;
  formulasApplied: string[];
  warnings: string[];
}

// ─── Spend data point (for trend / forecasting) ───────────────────────────────

/**
 * A historical spend observation for a single period.
 */
export interface SpendDataPoint {
  /** ISO 8601 period label, e.g. "2026-01", "2026-Q1". */
  periodLabel: string;
  /** Actual spend in this period (decimal string). */
  amount: string;
}

// ─── Trend extrapolation ──────────────────────────────────────────────────────

export type TrendMethod =
  | "linear"        // Ordinary least-squares linear regression on period index
  | "moving-average"; // Simple moving average of last N observations

export interface TrendExtrapolationInput {
  /** Historical spend observations in chronological order (oldest first). */
  dataPoints: SpendDataPoint[];
  /** Number of future periods to forecast. */
  forecastPeriods: number;
  /** Extrapolation method. Defaults to "linear". */
  method?: TrendMethod;
  /** Window size for moving-average method (default: all available points). */
  movingAverageWindow?: number;
  /** ISO 4217 currency. */
  currency: string;
}

export interface ForecastDataPoint {
  /** 1-based index of the forecast period (1 = next period after last observation). */
  periodIndex: number;
  /** Estimated spend (decimal string). Clamped to ≥ 0. */
  forecastedAmount: string;
}

export interface TrendExtrapolationResult {
  method: TrendMethod;
  /** Slope per period (linear only; "0" for moving-average). */
  slopePerPeriod: string;
  /** Intercept (linear only; "0" for moving-average). */
  intercept: string;
  /** Average of the moving window (moving-average only; "0" for linear). */
  movingAverage: string;
  /** R² goodness-of-fit (linear only; 0–1; "0" for moving-average). */
  rSquared: string;
  forecasts: ForecastDataPoint[];
  currency: string;
  formulasApplied: string[];
  warnings: string[];
}

// ─── Budget projection ────────────────────────────────────────────────────────

export interface BudgetProjectionInput {
  /** Baseline spend for the current period (decimal string). */
  baselineAmount: string;
  /** Percentage growth rate per period (e.g. "5" = 5% per period). Can be negative. */
  growthRatePct: string;
  /** Number of future periods to project. */
  periods: number;
  /** Period granularity (used for labeling only). */
  period: Period;
  /** ISO 4217 currency. */
  currency: string;
}

export interface ProjectedPeriod {
  /** 1-based period index. */
  periodIndex: number;
  /** Projected spend for this period (decimal string). */
  projectedAmount: string;
  /** Cumulative projected spend up to and including this period (decimal string). */
  cumulativeAmount: string;
}

export interface BudgetProjectionResult {
  baselineAmount: string;
  growthRatePct: string;
  periods: ProjectedPeriod[];
  /** Total projected spend across all periods (decimal string). */
  totalProjected: string;
  currency: string;
  period: Period;
  formulasApplied: string[];
  warnings: string[];
}
