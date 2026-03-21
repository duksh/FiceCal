import { describe, it, expect } from "vitest";
import {
  computeErrorBudget,
  computeDowntimeCost,
  computeReliabilityRoi,
  STANDARD_SLO_TIERS,
} from "../src/index.js";

describe("STANDARD_SLO_TIERS", () => {
  it("defines the six canonical tiers", () => {
    expect(Object.keys(STANDARD_SLO_TIERS)).toContain("99.9");
    expect(Object.keys(STANDARD_SLO_TIERS)).toContain("99.99");
    expect(Object.keys(STANDARD_SLO_TIERS)).toContain("99.999");
  });
});

describe("computeErrorBudget", () => {
  it("99.9% monthly → ~43.83 allowable downtime minutes", () => {
    const r = computeErrorBudget(STANDARD_SLO_TIERS["99.9"]!, "monthly");
    const mins = parseFloat(r.allowableDowntimeMinutes);
    expect(mins).toBeGreaterThan(43);
    expect(mins).toBeLessThan(44);
  });

  it("99.99% monthly → ~4.38 allowable downtime minutes", () => {
    const r = computeErrorBudget(STANDARD_SLO_TIERS["99.99"]!, "monthly");
    const mins = parseFloat(r.allowableDowntimeMinutes);
    expect(mins).toBeGreaterThan(4);
    expect(mins).toBeLessThan(5);
  });

  it("99% annual → ~3.65 days of allowable downtime", () => {
    const r = computeErrorBudget(STANDARD_SLO_TIERS["99"]!, "annual");
    const mins = parseFloat(r.allowableDowntimeMinutes);
    // 1% of 525948.75 ≈ 5259 minutes ≈ 3.65 days
    expect(mins).toBeGreaterThan(5000);
    expect(mins).toBeLessThan(6000);
  });

  it("allowableDowntimeFormatted is a non-empty string", () => {
    const r = computeErrorBudget(STANDARD_SLO_TIERS["99.9"]!, "monthly");
    expect(r.allowableDowntimeFormatted.length).toBeGreaterThan(0);
  });

  it("with actualUptimePct: error budget consumed and remaining sum to 100", () => {
    const r = computeErrorBudget(STANDARD_SLO_TIERS["99.9"]!, "monthly", {
      actualUptimePct: "99.8",  // slightly worse than 99.9 target
    });
    expect(r.errorBudgetConsumedPct).toBeDefined();
    expect(r.errorBudgetRemainingPct).toBeDefined();
    const consumed = parseFloat(r.errorBudgetConsumedPct!);
    const remaining = parseFloat(r.errorBudgetRemainingPct!);
    expect(consumed + remaining).toBeCloseTo(100, 1);
    expect(consumed).toBeGreaterThan(0);
  });

  it("actual uptime at exactly SLO target → 100% consumed (all budget used, none remaining)", () => {
    const r = computeErrorBudget(STANDARD_SLO_TIERS["99.9"]!, "monthly", {
      actualUptimePct: "99.9",
    });
    expect(parseFloat(r.errorBudgetConsumedPct!)).toBeCloseTo(100, 1);
    expect(parseFloat(r.errorBudgetRemainingPct!)).toBeCloseTo(0, 1);
  });

  it("actual uptime worse than target → 100% consumed (clamped)", () => {
    const r = computeErrorBudget(STANDARD_SLO_TIERS["99.9"]!, "monthly", {
      actualUptimePct: "99.0",  // much worse
    });
    expect(parseFloat(r.errorBudgetConsumedPct!)).toBeCloseTo(100, 0);
    expect(parseFloat(r.errorBudgetRemainingPct!)).toBeCloseTo(0, 0);
  });

  it("includes formulasApplied", () => {
    const r = computeErrorBudget(STANDARD_SLO_TIERS["99.9"]!, "monthly");
    expect(r.formulasApplied).toContain("slo.errorBudget.allowableDowntime");
  });
});

describe("computeDowntimeCost", () => {
  it("60 min outage at $10k/hr → $10k revenue cost", () => {
    const r = computeDowntimeCost({
      outageMinutes: 60,
      revenueAtRiskPerHour: "10000",
      currency: "USD",
    });
    expect(r.revenueCost).toBe("10000.0000000000");
    expect(r.engineeringCost).toBe("0.0000000000");
    expect(r.totalCost).toBe("10000.0000000000");
  });

  it("30 min outage at $10k/hr → $5k revenue cost", () => {
    const r = computeDowntimeCost({
      outageMinutes: 30,
      revenueAtRiskPerHour: "10000",
      currency: "USD",
    });
    expect(r.revenueCost).toBe("5000.0000000000");
  });

  it("includes engineering cost when both fields provided", () => {
    // 2hr outage, $10k/hr revenue, 3 engineers at $150/hr
    const r = computeDowntimeCost({
      outageMinutes: 120,
      revenueAtRiskPerHour: "10000",
      engineeringCostPerHour: "150",
      engineersOnCall: 3,
      currency: "USD",
    });
    // revenue: 2 × 10000 = 20000; eng: 2 × 150 × 3 = 900; total: 20900
    expect(r.revenueCost).toBe("20000.0000000000");
    expect(r.engineeringCost).toBe("900.0000000000");
    expect(r.totalCost).toBe("20900.0000000000");
  });

  it("warns when only one of engineering fields is provided", () => {
    const r = computeDowntimeCost({
      outageMinutes: 60,
      revenueAtRiskPerHour: "5000",
      engineeringCostPerHour: "100",
      // engineersOnCall missing
      currency: "USD",
    });
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.engineeringCost).toBe("0.0000000000");
  });

  it("zero-minute outage produces zero cost", () => {
    const r = computeDowntimeCost({
      outageMinutes: 0,
      revenueAtRiskPerHour: "10000",
      currency: "USD",
    });
    expect(r.totalCost).toBe("0.0000000000");
  });
});

describe("computeReliabilityRoi", () => {
  it("improving from 99.5% to 99.9% monthly with $50k investment", () => {
    const r = computeReliabilityRoi({
      improvementCost: "50000",
      currentUptimePct: "99.5",
      targetUptimePct: "99.9",
      revenueAtRiskPerHour: "10000",
      period: "monthly",
      currency: "USD",
    });
    // minutes saved: (0.5% - 0.1%) of monthly = 0.4% of 43829 ≈ 175 minutes ≈ 2.92 hours
    // revenue protected: 2.92 × 10000 ≈ $29,200/month
    const minutesSaved = parseFloat(r.downtimeMinutesSaved);
    expect(minutesSaved).toBeGreaterThan(150);
    expect(minutesSaved).toBeLessThan(200);
    const revenue = parseFloat(r.revenueProtectedPerPeriod);
    expect(revenue).toBeGreaterThan(20000);
    expect(revenue).toBeLessThan(35000);
  });

  it("roiMultiple and paybackPeriods are reciprocals", () => {
    const r = computeReliabilityRoi({
      improvementCost: "50000",
      currentUptimePct: "99.5",
      targetUptimePct: "99.9",
      revenueAtRiskPerHour: "10000",
      period: "monthly",
      currency: "USD",
    });
    const roi = parseFloat(r.roiMultiple);
    const payback = parseFloat(r.paybackPeriods);
    expect(roi * payback).toBeCloseTo(1.0, 3);
  });

  it("warns when target is not higher than current", () => {
    const r = computeReliabilityRoi({
      improvementCost: "10000",
      currentUptimePct: "99.9",
      targetUptimePct: "99.5",
      revenueAtRiskPerHour: "5000",
      period: "monthly",
      currency: "USD",
    });
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.downtimeMinutesSaved).toBe("0.0000000000");
  });

  it("includes formulasApplied", () => {
    const r = computeReliabilityRoi({
      improvementCost: "10000",
      currentUptimePct: "99.5",
      targetUptimePct: "99.9",
      revenueAtRiskPerHour: "5000",
      period: "monthly",
      currency: "USD",
    });
    expect(r.formulasApplied).toContain("slo.reliability.roi");
    expect(r.formulasApplied).toContain("slo.reliability.payback");
  });
});
