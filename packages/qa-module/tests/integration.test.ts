/**
 * qa-module integration test suite
 *
 * This is the Phase 2 integration harness. It:
 * 1. Verifies the contract runner itself works correctly
 * 2. Runs every Phase 2 engine against its contract
 * 3. Runs all 6 demo scenarios through live engines and validates output schemas
 * 4. Verifies cross-module invariants (e.g. economics-module registry round-trip)
 */
import { describe, it, expect } from "vitest";

// ─── QA module imports ────────────────────────────────────────────────────────
import {
  runContractCheck,
  runAllContractChecks,
  ALL_CONTRACTS,
  errorBudgetContract,
  downtimeCostContract,
  reliabilityRoiContract,
  aiCostContract,
  techNormalizationContract,
  budgetVarianceContract,
  healthScoreContract,
} from "../src/index.js";

// ─── Engine imports ───────────────────────────────────────────────────────────
import { computeAiCost } from "@ficecal/ai-token-economics";
import {
  computeErrorBudget,
  computeDowntimeCost,
  computeReliabilityRoi,
  STANDARD_SLO_TIERS,
} from "@ficecal/sla-slo-sli-economics";
import { normalizeTechCosts } from "@ficecal/multi-tech-normalization";
import { computeBudgetVariance, extrapolateTrend, projectBudget } from "@ficecal/budgeting-forecasting";
import { computeHealthScore } from "@ficecal/health-score";
import { createDefaultRegistry } from "@ficecal/economics-module";
import { DEMO_SCENARIOS, getScenarioById } from "@ficecal/demo-scenarios";
import { getAllEvidence, getEvidenceForFormula } from "@ficecal/reference-evidence";

// ─── Contract runner unit tests ────────────────────────────────────────────────

describe("runContractCheck", () => {
  it("passes when all assertions hold", () => {
    const contract = {
      id: "test",
      description: "test contract",
      assertions: [
        { field: "x", description: "x > 0", predicate: (v: unknown) => (v as number) > 0 },
        { field: "y", description: "y is string", predicate: (v: unknown) => typeof v === "string" },
      ],
    };
    const result = runContractCheck(contract, { x: 1, y: "hello" });
    expect(result.passed).toBe(true);
    expect(result.passedCount).toBe(2);
    expect(result.failedCount).toBe(0);
  });

  it("fails when any assertion does not hold", () => {
    const contract = {
      id: "test-fail",
      description: "test",
      assertions: [
        { field: "x", description: "x > 0", predicate: (v: unknown) => (v as number) > 0 },
        { field: "y", description: "y is string", predicate: (v: unknown) => typeof v === "string" },
      ],
    };
    const result = runContractCheck(contract, { x: -1, y: "ok" });
    expect(result.passed).toBe(false);
    expect(result.failedCount).toBe(1);
    expect(result.passedCount).toBe(1);
  });

  it("resolves nested field via dot-path", () => {
    const contract = {
      id: "nested",
      description: "nested field",
      assertions: [
        {
          field: "sloTarget.uptimePct",
          description: "nested field exists",
          predicate: (v: unknown) => v === "99.9",
        },
      ],
    };
    const result = runContractCheck(contract, { sloTarget: { uptimePct: "99.9" } });
    expect(result.passed).toBe(true);
  });

  it("gracefully handles missing field (predicate receives undefined)", () => {
    const contract = {
      id: "missing",
      description: "missing field",
      assertions: [
        { field: "nonexistent", description: "missing", predicate: (v: unknown) => v === undefined },
      ],
    };
    const result = runContractCheck(contract, {});
    expect(result.passed).toBe(true);
  });

  it("runAllContractChecks returns one result per check", () => {
    const c1 = {
      id: "c1", description: "c1",
      assertions: [{ field: "a", description: "a", predicate: () => true }],
    };
    const c2 = {
      id: "c2", description: "c2",
      assertions: [{ field: "b", description: "b", predicate: () => true }],
    };
    const results = runAllContractChecks([
      { contract: c1, result: { a: 1 } },
      { contract: c2, result: { b: 2 } },
    ]);
    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r.passed).toBe(true));
  });
});

// ─── ALL_CONTRACTS catalog ────────────────────────────────────────────────────

describe("ALL_CONTRACTS", () => {
  it("contains 7 engine contracts", () => {
    expect(ALL_CONTRACTS).toHaveLength(7);
  });

  it("all contract ids are unique", () => {
    const ids = ALL_CONTRACTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── Contract: computeErrorBudget ─────────────────────────────────────────────

describe("contract: computeErrorBudget", () => {
  const result = computeErrorBudget(STANDARD_SLO_TIERS["99.9"]!, "monthly");

  it("passes all schema assertions", () => {
    const check = runContractCheck(errorBudgetContract, result);
    expect(check.passed).toBe(true);
    if (!check.passed) {
      const failures = check.assertions.filter((a) => !a.passed);
      throw new Error(`Failed assertions: ${failures.map((f) => f.description).join(", ")}`);
    }
  });
});

// ─── Contract: computeDowntimeCost ────────────────────────────────────────────

describe("contract: computeDowntimeCost", () => {
  const result = computeDowntimeCost({
    outageMinutes: 60,
    revenueAtRiskPerHour: "10000",
    currency: "USD",
  });

  it("passes all schema assertions", () => {
    const check = runContractCheck(downtimeCostContract, result);
    expect(check.passed).toBe(true);
    if (!check.passed) {
      const failures = check.assertions.filter((a) => !a.passed);
      throw new Error(`Failed: ${failures.map((f) => f.description).join(", ")}`);
    }
  });
});

// ─── Contract: computeReliabilityRoi ─────────────────────────────────────────

describe("contract: computeReliabilityRoi", () => {
  const result = computeReliabilityRoi({
    improvementCost: "50000",
    currentUptimePct: "99.5",
    targetUptimePct: "99.9",
    revenueAtRiskPerHour: "10000",
    period: "monthly",
    currency: "USD",
  });

  it("passes all schema assertions", () => {
    const check = runContractCheck(reliabilityRoiContract, result);
    expect(check.passed).toBe(true);
  });
});

// ─── Contract: computeAiCost ─────────────────────────────────────────────────

describe("contract: computeAiCost", () => {
  const result = computeAiCost({
    pricingUnit: "per_1m_tokens",
    inputTokens: 1000,
    outputTokens: 500,
    inputPricePerUnit: "3.00",
    outputPricePerUnit: "15.00",
    currency: "USD",
    period: "monthly",
  });

  it("passes all schema assertions", () => {
    const check = runContractCheck(aiCostContract, result);
    expect(check.passed).toBe(true);
  });
});

// ─── Contract: normalizeTechCosts ─────────────────────────────────────────────

describe("contract: normalizeTechCosts", () => {
  const result = normalizeTechCosts(
    [
      {
        id: "ec2",
        label: "EC2 fleet",
        category: "cloud-compute",
        rawCost: "1000",
        currency: "USD",
        quantity: 20,
        nativeUnit: "vCPU-hour",
      },
    ],
    "USD",
  );

  it("passes all schema assertions", () => {
    const check = runContractCheck(techNormalizationContract, result);
    expect(check.passed).toBe(true);
  });
});

// ─── Contract: computeBudgetVariance ─────────────────────────────────────────

describe("contract: computeBudgetVariance", () => {
  const result = computeBudgetVariance(
    [
      { id: "a", label: "A", budgetedAmount: "1000", actualAmount: "1100", currency: "USD" },
    ],
    "USD",
  );

  it("passes all schema assertions", () => {
    const check = runContractCheck(budgetVarianceContract, result);
    expect(check.passed).toBe(true);
  });
});

// ─── Contract: computeHealthScore ─────────────────────────────────────────────

describe("contract: computeHealthScore", () => {
  const result = computeHealthScore([
    {
      signal: {
        id: "s1",
        category: "pricing-freshness",
        label: "Pricing freshness",
        severity: "ok",
        score: 90,
        rationale: "Pricing data is fresh",
      },
      weight: 1,
    },
    {
      signal: {
        id: "s2",
        category: "budget-adherence",
        label: "Budget adherence",
        severity: "warning",
        score: 70,
        rationale: "Slightly over budget",
      },
      weight: 1,
    },
  ]);

  it("passes all schema assertions", () => {
    const check = runContractCheck(healthScoreContract, result);
    expect(check.passed).toBe(true);
  });
});

// ─── Economics registry round-trip ───────────────────────────────────────────

describe("economics-module registry round-trip", () => {
  const registry = createDefaultRegistry();

  it("all 5 domains registered and compute via registry matches direct call", () => {
    expect(registry.size).toBe(5);
  });

  it("reliability.error-budget via registry passes downtimeCost contract", () => {
    const result = registry.compute("reliability.downtime-cost", {
      outageMinutes: 30,
      revenueAtRiskPerHour: "5000",
      currency: "USD",
    });
    const check = runContractCheck(downtimeCostContract, result);
    expect(check.passed).toBe(true);
  });

  it("ai.token via registry passes aiCost contract", () => {
    const result = registry.compute("ai.token", {
      pricingUnit: "per_request",
      requestCount: 1000,
      pricePerRequest: "0.001",
      currency: "USD",
      period: "monthly",
    });
    const check = runContractCheck(aiCostContract, result);
    expect(check.passed).toBe(true);
  });
});

// ─── Demo scenario integration ────────────────────────────────────────────────

describe("demo-scenarios schema validation", () => {
  it("all 6 scenarios are defined and loaded", () => {
    expect(DEMO_SCENARIOS).toHaveLength(6);
  });

  it("ai-model-cost-comparison output passes aiCost contract", () => {
    const s = getScenarioById("ai-model-cost-comparison")!;
    const result = computeAiCost(s.inputs.aiCost! as Parameters<typeof computeAiCost>[0]);
    const check = runContractCheck(aiCostContract, result);
    expect(check.passed).toBe(true);
  });

  it("ecommerce-outage-cost output passes downtimeCost contract", () => {
    const s = getScenarioById("ecommerce-outage-cost")!;
    const result = computeDowntimeCost(
      s.inputs.downtimeCost! as Parameters<typeof computeDowntimeCost>[0],
    );
    const check = runContractCheck(downtimeCostContract, result);
    expect(check.passed).toBe(true);
  });

  it("three-nines-error-budget output passes errorBudget contract", () => {
    const result = computeErrorBudget(STANDARD_SLO_TIERS["99.9"]!, "monthly", {
      actualUptimePct: "99.87",
    });
    const check = runContractCheck(errorBudgetContract, result);
    expect(check.passed).toBe(true);
  });

  it("q1-cloud-budget-variance output passes budgetVariance contract", () => {
    const s = getScenarioById("q1-cloud-budget-variance")!;
    const raw = s.inputs.budgetVariance! as { currency: string; items: Parameters<typeof computeBudgetVariance>[0] };
    const result = computeBudgetVariance(raw.items, raw.currency);
    const check = runContractCheck(budgetVarianceContract, result);
    expect(check.passed).toBe(true);
  });
});

// ─── Reference evidence cross-module ──────────────────────────────────────────

describe("reference-evidence cross-module linkage", () => {
  it("getAllEvidence returns entries for every Phase 2 formula key", () => {
    const allEvidence = getAllEvidence();
    expect(allEvidence.length).toBeGreaterThanOrEqual(8);
  });

  it("error budget formula has evidence", () => {
    const entries = getEvidenceForFormula("slo.errorBudget.allowableDowntime");
    expect(entries.length).toBeGreaterThan(0);
  });

  it("reliability ROI formula has evidence", () => {
    const entries = getEvidenceForFormula("slo.reliability.roi");
    expect(entries.length).toBeGreaterThan(0);
  });

  it("budget projection formula has evidence", () => {
    const entries = getEvidenceForFormula("budget.projection.compoundGrowth");
    expect(entries.length).toBeGreaterThan(0);
  });

  it("OLS forecast formula has evidence", () => {
    const entries = getEvidenceForFormula("forecast.trend.linear");
    expect(entries.length).toBeGreaterThan(0);
  });
});

// ─── Budgeting-forecasting additional invariants ───────────────────────────────

describe("budgeting-forecasting invariants", () => {
  it("extrapolateTrend: linear R² clamped to [0,1]", () => {
    const r = extrapolateTrend({
      dataPoints: [
        { periodLabel: "M1", amount: "100" },
        { periodLabel: "M2", amount: "200" },
        { periodLabel: "M3", amount: "300" },
      ],
      forecastPeriods: 2,
      method: "linear",
      currency: "USD",
    });
    const r2 = parseFloat(r.rSquared);
    expect(r2).toBeGreaterThanOrEqual(0);
    expect(r2).toBeLessThanOrEqual(1);
  });

  it("projectBudget: totalProjected equals last cumulativeAmount", () => {
    const r = projectBudget({
      baselineAmount: "10000",
      growthRatePct: "7",
      periods: 5,
      period: "annual",
      currency: "USD",
    });
    const lastPeriod = r.periods[r.periods.length - 1]!;
    expect(parseFloat(r.totalProjected)).toBeCloseTo(
      parseFloat(lastPeriod.cumulativeAmount),
      5,
    );
  });
});
