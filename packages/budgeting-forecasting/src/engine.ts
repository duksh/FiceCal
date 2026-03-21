import { Decimal, toOutputString } from "@ficecal/core-economics";
import type {
  BudgetLineItem,
  BudgetVarianceResult,
  TrendExtrapolationInput,
  TrendExtrapolationResult,
  BudgetProjectionInput,
  BudgetProjectionResult,
} from "./types.js";

// ─── Budget variance ──────────────────────────────────────────────────────────

/**
 * Compute variance between budgeted and actual spend for each line item,
 * plus portfolio totals.
 *
 * Formula: variance = actual − budgeted
 * variancePct = (variance / budgeted) × 100  [0 when budgeted = 0]
 */
export function computeBudgetVariance(
  items: BudgetLineItem[],
  currency: string,
): BudgetVarianceResult {
  const warnings: string[] = [];

  if (items.length === 0) {
    warnings.push("No line items provided — result is empty.");
  }

  let totalBudgeted = new Decimal(0);
  let totalActual = new Decimal(0);

  const resultItems = items.map((item) => {
    const budgeted = new Decimal(item.budgetedAmount);
    const actual = new Decimal(item.actualAmount);
    const variance = actual.minus(budgeted);
    const variancePct = budgeted.isZero()
      ? new Decimal(0)
      : variance.div(budgeted).mul(100);

    totalBudgeted = totalBudgeted.add(budgeted);
    totalActual = totalActual.add(actual);

    return {
      id: item.id,
      label: item.label,
      budgetedAmount: toOutputString(budgeted),
      actualAmount: toOutputString(actual),
      varianceAmount: toOutputString(variance),
      variancePct: toOutputString(variancePct),
      isOverBudget: actual.greaterThan(budgeted),
      currency: item.currency,
    };
  });

  const totalVariance = totalActual.minus(totalBudgeted);
  const totalVariancePct = totalBudgeted.isZero()
    ? new Decimal(0)
    : totalVariance.div(totalBudgeted).mul(100);

  return {
    items: resultItems,
    totalBudgeted: toOutputString(totalBudgeted),
    totalActual: toOutputString(totalActual),
    totalVariance: toOutputString(totalVariance),
    totalVariancePct: toOutputString(totalVariancePct),
    isOverBudget: totalActual.greaterThan(totalBudgeted),
    currency,
    formulasApplied: ["budget.variance.item", "budget.variance.portfolio"],
    warnings,
  };
}

// ─── Trend extrapolation ──────────────────────────────────────────────────────

/**
 * Extrapolate future spend from historical observations using either:
 * - linear: OLS regression on period index → y = slope × x + intercept
 * - moving-average: simple mean of the last N observations
 *
 * Forecasted values are clamped to ≥ 0 (negative spend is not physical).
 */
export function extrapolateTrend(
  input: TrendExtrapolationInput,
): TrendExtrapolationResult {
  const warnings: string[] = [];
  const method = input.method ?? "linear";
  const points = input.dataPoints;

  if (points.length === 0) {
    warnings.push("No data points provided — all forecasts default to 0.");
    const zeroes = Array.from({ length: input.forecastPeriods }, (_, i) => ({
      periodIndex: i + 1,
      forecastedAmount: "0.0000000000",
    }));
    return {
      method,
      slopePerPeriod: "0.0000000000",
      intercept: "0.0000000000",
      movingAverage: "0.0000000000",
      rSquared: "0.0000000000",
      forecasts: zeroes,
      currency: input.currency,
      formulasApplied: ["forecast.trend.empty"],
      warnings,
    };
  }

  if (input.forecastPeriods < 1) {
    warnings.push("forecastPeriods must be ≥ 1; defaulting to 1.");
  }
  const nForecast = Math.max(1, input.forecastPeriods);

  const amounts = points.map((p) => new Decimal(p.amount));
  const n = amounts.length;

  if (method === "moving-average") {
    const window = input.movingAverageWindow !== undefined
      ? Math.min(Math.max(1, input.movingAverageWindow), n)
      : n;

    if (input.movingAverageWindow !== undefined && input.movingAverageWindow > n) {
      warnings.push(
        `movingAverageWindow (${input.movingAverageWindow}) exceeds available data points (${n}) — using all points.`,
      );
    }

    const windowAmounts = amounts.slice(n - window);
    const sum = windowAmounts.reduce((acc, v) => acc.add(v), new Decimal(0));
    const avg = sum.div(window);

    const forecasts = Array.from({ length: nForecast }, (_, i) => ({
      periodIndex: i + 1,
      forecastedAmount: toOutputString(avg.lessThan(0) ? new Decimal(0) : avg),
    }));

    return {
      method,
      slopePerPeriod: "0.0000000000",
      intercept: "0.0000000000",
      movingAverage: toOutputString(avg),
      rSquared: "0.0000000000",
      forecasts,
      currency: input.currency,
      formulasApplied: ["forecast.trend.movingAverage"],
      warnings,
    };
  }

  // ─── Linear OLS ─────────────────────────────────────────────────────────────
  // x values: 1, 2, ..., n  (1-indexed for interpretability)
  const xValues = Array.from({ length: n }, (_, i) => new Decimal(i + 1));

  const sumX = xValues.reduce((acc, x) => acc.add(x), new Decimal(0));
  const sumY = amounts.reduce((acc, y) => acc.add(y), new Decimal(0));
  const sumXX = xValues.reduce((acc, x) => acc.add(x.mul(x)), new Decimal(0));
  const sumXY = xValues.reduce(
    (acc, x, i) => acc.add(x.mul(amounts[i]!)),
    new Decimal(0),
  );

  const nD = new Decimal(n);
  const denom = nD.mul(sumXX).minus(sumX.mul(sumX));

  let slope: Decimal;
  let intercept: Decimal;
  let rSquared: Decimal;

  if (denom.isZero()) {
    // Single point or all same x — slope undefined, use mean
    slope = new Decimal(0);
    intercept = sumY.div(nD);
    rSquared = new Decimal(0);
    warnings.push("Degenerate data (single point or identical x values) — slope is 0, using mean as intercept.");
  } else {
    slope = nD.mul(sumXY).minus(sumX.mul(sumY)).div(denom);
    intercept = sumY.minus(slope.mul(sumX)).div(nD);

    // R² = 1 - SS_res / SS_tot
    const yMean = sumY.div(nD);
    const ssTot = amounts.reduce(
      (acc, y) => acc.add(y.minus(yMean).pow(2)),
      new Decimal(0),
    );
    const ssRes = amounts.reduce(
      (acc, y, i) => acc.add(y.minus(slope.mul(xValues[i]!).add(intercept)).pow(2)),
      new Decimal(0),
    );
    rSquared = ssTot.isZero()
      ? new Decimal(1)
      : new Decimal(1).minus(ssRes.div(ssTot));
    // Clamp to [0, 1] — numerical issues can produce tiny negatives
    rSquared = rSquared.lessThan(0) ? new Decimal(0) : rSquared.greaterThan(1) ? new Decimal(1) : rSquared;
  }

  const forecasts = Array.from({ length: nForecast }, (_, i) => {
    const futureX = new Decimal(n + i + 1);
    const raw = slope.mul(futureX).add(intercept);
    return {
      periodIndex: i + 1,
      forecastedAmount: toOutputString(raw.lessThan(0) ? new Decimal(0) : raw),
    };
  });

  return {
    method: "linear",
    slopePerPeriod: toOutputString(slope),
    intercept: toOutputString(intercept),
    movingAverage: "0.0000000000",
    rSquared: toOutputString(rSquared),
    forecasts,
    currency: input.currency,
    formulasApplied: ["forecast.trend.linear", "forecast.trend.rSquared"],
    warnings,
  };
}

// ─── Budget projection ────────────────────────────────────────────────────────

/**
 * Project future spend using compound growth.
 *
 * Formula: projected[i] = baseline × (1 + growthRate)^i
 * where i = 1, 2, ..., periods
 */
export function projectBudget(
  input: BudgetProjectionInput,
): BudgetProjectionResult {
  const warnings: string[] = [];
  const baseline = new Decimal(input.baselineAmount);
  const growthRate = new Decimal(input.growthRatePct).div(100);

  if (baseline.lessThan(0)) {
    warnings.push("baselineAmount is negative — projection may produce unexpected results.");
  }
  if (input.periods < 1) {
    warnings.push("periods must be ≥ 1; defaulting to 1.");
  }
  const nPeriods = Math.max(1, input.periods);

  let cumulative = new Decimal(0);
  const periods = Array.from({ length: nPeriods }, (_, i) => {
    const periodIndex = i + 1;
    const projected = baseline.mul(new Decimal(1).add(growthRate).pow(periodIndex));
    cumulative = cumulative.add(projected);
    return {
      periodIndex,
      projectedAmount: toOutputString(projected),
      cumulativeAmount: toOutputString(cumulative),
    };
  });

  return {
    baselineAmount: toOutputString(baseline),
    growthRatePct: toOutputString(new Decimal(input.growthRatePct)),
    periods,
    totalProjected: toOutputString(cumulative),
    currency: input.currency,
    period: input.period,
    formulasApplied: ["budget.projection.compoundGrowth"],
    warnings,
  };
}
