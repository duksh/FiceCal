import { describe, it, expect } from "vitest";
import {
  computeBudgetVariance,
  extrapolateTrend,
  projectBudget,
} from "../src/index.js";
import type { BudgetLineItem, SpendDataPoint } from "../src/index.js";

// ─── computeBudgetVariance ────────────────────────────────────────────────────

describe("computeBudgetVariance", () => {
  const items: BudgetLineItem[] = [
    { id: "compute", label: "Compute", budgetedAmount: "10000", actualAmount: "11500", currency: "USD" },
    { id: "storage", label: "Storage", budgetedAmount: "2000",  actualAmount: "1800",  currency: "USD" },
    { id: "network", label: "Network", budgetedAmount: "500",   actualAmount: "500",   currency: "USD" },
  ];

  it("computes per-item variance amounts correctly", () => {
    const r = computeBudgetVariance(items, "USD");
    expect(r.items[0]!.varianceAmount).toBe("1500.0000000000");  // over
    expect(r.items[1]!.varianceAmount).toBe("-200.0000000000");  // under
    expect(r.items[2]!.varianceAmount).toBe("0.0000000000");    // on budget
  });

  it("identifies over-budget items", () => {
    const r = computeBudgetVariance(items, "USD");
    expect(r.items[0]!.isOverBudget).toBe(true);
    expect(r.items[1]!.isOverBudget).toBe(false);
    expect(r.items[2]!.isOverBudget).toBe(false);
  });

  it("computes per-item variance percentage", () => {
    const r = computeBudgetVariance(items, "USD");
    // compute: 1500/10000 × 100 = 15%
    expect(parseFloat(r.items[0]!.variancePct)).toBeCloseTo(15, 5);
    // storage: -200/2000 × 100 = -10%
    expect(parseFloat(r.items[1]!.variancePct)).toBeCloseTo(-10, 5);
    // network: 0/500 × 100 = 0%
    expect(parseFloat(r.items[2]!.variancePct)).toBeCloseTo(0, 5);
  });

  it("computes correct portfolio totals", () => {
    const r = computeBudgetVariance(items, "USD");
    expect(r.totalBudgeted).toBe("12500.0000000000");
    expect(r.totalActual).toBe("13800.0000000000");
    expect(r.totalVariance).toBe("1300.0000000000");
    expect(r.isOverBudget).toBe(true);
  });

  it("portfolio variance pct: 1300/12500 × 100 = 10.4%", () => {
    const r = computeBudgetVariance(items, "USD");
    expect(parseFloat(r.totalVariancePct)).toBeCloseTo(10.4, 4);
  });

  it("portfolio under budget when all items under", () => {
    const under: BudgetLineItem[] = [
      { id: "a", label: "A", budgetedAmount: "1000", actualAmount: "800", currency: "USD" },
      { id: "b", label: "B", budgetedAmount: "500",  actualAmount: "400", currency: "USD" },
    ];
    const r = computeBudgetVariance(under, "USD");
    expect(r.isOverBudget).toBe(false);
    expect(r.totalVariance).toBe("-300.0000000000");
  });

  it("handles zero budgeted amount without dividing by zero", () => {
    const zero: BudgetLineItem[] = [
      { id: "free", label: "Free tier", budgetedAmount: "0", actualAmount: "50", currency: "USD" },
    ];
    const r = computeBudgetVariance(zero, "USD");
    expect(r.items[0]!.variancePct).toBe("0.0000000000");
    expect(r.items[0]!.isOverBudget).toBe(true);
  });

  it("empty items produces empty result with warning", () => {
    const r = computeBudgetVariance([], "USD");
    expect(r.items).toHaveLength(0);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.totalBudgeted).toBe("0.0000000000");
  });

  it("includes formulasApplied", () => {
    const r = computeBudgetVariance(items, "USD");
    expect(r.formulasApplied).toContain("budget.variance.item");
    expect(r.formulasApplied).toContain("budget.variance.portfolio");
  });
});

// ─── extrapolateTrend — linear ────────────────────────────────────────────────

describe("extrapolateTrend (linear)", () => {
  // Perfectly linear data: 100, 200, 300, 400, 500 (slope = 100, intercept = 0)
  const linearPoints: SpendDataPoint[] = [
    { periodLabel: "2025-01", amount: "100" },
    { periodLabel: "2025-02", amount: "200" },
    { periodLabel: "2025-03", amount: "300" },
    { periodLabel: "2025-04", amount: "400" },
    { periodLabel: "2025-05", amount: "500" },
  ];

  it("slope is ~100 for perfectly linear data", () => {
    const r = extrapolateTrend({ dataPoints: linearPoints, forecastPeriods: 1, currency: "USD" });
    expect(parseFloat(r.slopePerPeriod)).toBeCloseTo(100, 3);
  });

  it("R² is 1.0 for perfectly linear data", () => {
    const r = extrapolateTrend({ dataPoints: linearPoints, forecastPeriods: 1, currency: "USD" });
    expect(parseFloat(r.rSquared)).toBeCloseTo(1.0, 5);
  });

  it("forecasts next 3 periods correctly (600, 700, 800)", () => {
    const r = extrapolateTrend({ dataPoints: linearPoints, forecastPeriods: 3, currency: "USD" });
    expect(r.forecasts).toHaveLength(3);
    expect(parseFloat(r.forecasts[0]!.forecastedAmount)).toBeCloseTo(600, 1);
    expect(parseFloat(r.forecasts[1]!.forecastedAmount)).toBeCloseTo(700, 1);
    expect(parseFloat(r.forecasts[2]!.forecastedAmount)).toBeCloseTo(800, 1);
  });

  it("forecast amounts are non-negative (clamped)", () => {
    const declining: SpendDataPoint[] = [
      { periodLabel: "2025-01", amount: "100" },
      { periodLabel: "2025-02", amount: "50" },
      { periodLabel: "2025-03", amount: "10" },
    ];
    const r = extrapolateTrend({ dataPoints: declining, forecastPeriods: 10, currency: "USD" });
    r.forecasts.forEach((f) => {
      expect(parseFloat(f.forecastedAmount)).toBeGreaterThanOrEqual(0);
    });
  });

  it("includes formulasApplied for linear", () => {
    const r = extrapolateTrend({ dataPoints: linearPoints, forecastPeriods: 2, currency: "USD" });
    expect(r.formulasApplied).toContain("forecast.trend.linear");
    expect(r.formulasApplied).toContain("forecast.trend.rSquared");
  });

  it("empty data points produce all-zero forecasts with warning", () => {
    const r = extrapolateTrend({ dataPoints: [], forecastPeriods: 3, currency: "USD" });
    expect(r.warnings.length).toBeGreaterThan(0);
    r.forecasts.forEach((f) => expect(f.forecastedAmount).toBe("0.0000000000"));
  });

  it("single data point: slope=0, forecast = that value", () => {
    const r = extrapolateTrend({
      dataPoints: [{ periodLabel: "2025-01", amount: "500" }],
      forecastPeriods: 2,
      currency: "USD",
    });
    expect(r.warnings.length).toBeGreaterThan(0); // degenerate data warning
    r.forecasts.forEach((f) => {
      expect(parseFloat(f.forecastedAmount)).toBeCloseTo(500, 3);
    });
  });
});

// ─── extrapolateTrend — moving-average ────────────────────────────────────────

describe("extrapolateTrend (moving-average)", () => {
  const points: SpendDataPoint[] = [
    { periodLabel: "2025-01", amount: "100" },
    { periodLabel: "2025-02", amount: "200" },
    { periodLabel: "2025-03", amount: "300" },
    { periodLabel: "2025-04", amount: "400" },
  ];

  it("3-period moving average of last 3 = (200+300+400)/3 = 300", () => {
    const r = extrapolateTrend({
      dataPoints: points,
      forecastPeriods: 2,
      method: "moving-average",
      movingAverageWindow: 3,
      currency: "USD",
    });
    const avg = parseFloat(r.movingAverage);
    expect(avg).toBeCloseTo(300, 3);
    r.forecasts.forEach((f) => expect(parseFloat(f.forecastedAmount)).toBeCloseTo(300, 3));
  });

  it("full-window average = (100+200+300+400)/4 = 250", () => {
    const r = extrapolateTrend({
      dataPoints: points,
      forecastPeriods: 1,
      method: "moving-average",
      currency: "USD",
    });
    expect(parseFloat(r.movingAverage)).toBeCloseTo(250, 3);
  });

  it("window larger than data warns and uses all points", () => {
    const r = extrapolateTrend({
      dataPoints: points,
      forecastPeriods: 1,
      method: "moving-average",
      movingAverageWindow: 100,
      currency: "USD",
    });
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(parseFloat(r.movingAverage)).toBeCloseTo(250, 3);
  });

  it("includes formulasApplied for moving-average", () => {
    const r = extrapolateTrend({
      dataPoints: points,
      forecastPeriods: 1,
      method: "moving-average",
      currency: "USD",
    });
    expect(r.formulasApplied).toContain("forecast.trend.movingAverage");
  });
});

// ─── projectBudget ────────────────────────────────────────────────────────────

describe("projectBudget", () => {
  it("5% growth on $10k baseline for 3 periods", () => {
    const r = projectBudget({
      baselineAmount: "10000",
      growthRatePct: "5",
      periods: 3,
      period: "monthly",
      currency: "USD",
    });
    expect(r.periods).toHaveLength(3);
    // period 1: 10000 × 1.05^1 = 10500
    expect(parseFloat(r.periods[0]!.projectedAmount)).toBeCloseTo(10500, 2);
    // period 2: 10000 × 1.05^2 = 11025
    expect(parseFloat(r.periods[1]!.projectedAmount)).toBeCloseTo(11025, 2);
    // period 3: 10000 × 1.05^3 = 11576.25
    expect(parseFloat(r.periods[2]!.projectedAmount)).toBeCloseTo(11576.25, 2);
  });

  it("cumulative amounts accumulate correctly", () => {
    const r = projectBudget({
      baselineAmount: "10000",
      growthRatePct: "5",
      periods: 3,
      period: "monthly",
      currency: "USD",
    });
    // cumulative[2] = cumulative[1] + projected[2]
    const cum1 = parseFloat(r.periods[0]!.cumulativeAmount);
    const cum2 = parseFloat(r.periods[1]!.cumulativeAmount);
    const proj2 = parseFloat(r.periods[1]!.projectedAmount);
    expect(cum2).toBeCloseTo(cum1 + proj2, 3);
  });

  it("totalProjected equals last period cumulativeAmount", () => {
    const r = projectBudget({
      baselineAmount: "5000",
      growthRatePct: "10",
      periods: 4,
      period: "quarterly",
      currency: "USD",
    });
    const lastCumulative = parseFloat(r.periods[3]!.cumulativeAmount);
    expect(parseFloat(r.totalProjected)).toBeCloseTo(lastCumulative, 5);
  });

  it("0% growth = constant baseline each period", () => {
    const r = projectBudget({
      baselineAmount: "8000",
      growthRatePct: "0",
      periods: 3,
      period: "monthly",
      currency: "USD",
    });
    r.periods.forEach((p) => {
      expect(parseFloat(p.projectedAmount)).toBeCloseTo(8000, 5);
    });
  });

  it("negative growth rate (cost reduction scenario)", () => {
    const r = projectBudget({
      baselineAmount: "10000",
      growthRatePct: "-10",
      periods: 2,
      period: "monthly",
      currency: "USD",
    });
    // period 1: 10000 × 0.9 = 9000
    expect(parseFloat(r.periods[0]!.projectedAmount)).toBeCloseTo(9000, 2);
    // period 2: 10000 × 0.81 = 8100
    expect(parseFloat(r.periods[1]!.projectedAmount)).toBeCloseTo(8100, 2);
  });

  it("includes formulasApplied", () => {
    const r = projectBudget({
      baselineAmount: "1000",
      growthRatePct: "5",
      periods: 1,
      period: "monthly",
      currency: "USD",
    });
    expect(r.formulasApplied).toContain("budget.projection.compoundGrowth");
  });

  it("periods < 1 warned and defaults to 1", () => {
    const r = projectBudget({
      baselineAmount: "1000",
      growthRatePct: "5",
      periods: 0,
      period: "monthly",
      currency: "USD",
    });
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.periods).toHaveLength(1);
  });
});
