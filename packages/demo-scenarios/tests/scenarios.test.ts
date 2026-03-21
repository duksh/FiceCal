import { describe, it, expect } from "vitest";
import {
  DEMO_SCENARIOS,
  getScenarioById,
  getScenariosByDomain,
} from "../src/index.js";

// Direct engine imports for live-run assertions
import { computeAiCost } from "@ficecal/ai-token-economics";
import {
  computeErrorBudget,
  computeDowntimeCost,
  computeReliabilityRoi,
  STANDARD_SLO_TIERS,
} from "@ficecal/sla-slo-sli-economics";
import { normalizeTechCosts } from "@ficecal/multi-tech-normalization";
import { computeBudgetVariance } from "@ficecal/budgeting-forecasting";
import type {
  TechCostInput,
} from "@ficecal/multi-tech-normalization";
import type { BudgetLineItem } from "@ficecal/budgeting-forecasting";

// ─── Catalog structure ────────────────────────────────────────────────────────

describe("DEMO_SCENARIOS", () => {
  it("contains 6 canonical scenarios", () => {
    expect(DEMO_SCENARIOS).toHaveLength(6);
  });

  it("all ids are unique", () => {
    const ids = DEMO_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every scenario has required fields", () => {
    DEMO_SCENARIOS.forEach((s) => {
      expect(s.id.length).toBeGreaterThan(0);
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.title.length).toBeLessThanOrEqual(60);
      expect(s.description.length).toBeGreaterThan(0);
      expect(s.domains.length).toBeGreaterThan(0);
      expect(s.expectedRanges.length).toBeGreaterThan(0);
    });
  });
});

// ─── getScenarioById ─────────────────────────────────────────────────────────

describe("getScenarioById", () => {
  it("finds a scenario by id", () => {
    const s = getScenarioById("three-nines-error-budget");
    expect(s).toBeDefined();
    expect(s!.id).toBe("three-nines-error-budget");
  });

  it("returns undefined for unknown id", () => {
    expect(getScenarioById("does-not-exist")).toBeUndefined();
  });
});

// ─── getScenariosByDomain ─────────────────────────────────────────────────────

describe("getScenariosByDomain", () => {
  it("returns scenarios for ai.token", () => {
    const results = getScenariosByDomain("ai.token");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((s) => expect(s.domains).toContain("ai.token"));
  });

  it("returns empty for unknown domain", () => {
    expect(getScenariosByDomain("nonexistent.domain")).toHaveLength(0);
  });
});

// ─── Live engine runs — scenario: ai-model-cost-comparison ───────────────────

describe("scenario: ai-model-cost-comparison (live engine)", () => {
  const scenario = getScenarioById("ai-model-cost-comparison")!;
  const input = scenario.inputs.aiCost!;

  it("scenario exists", () => expect(scenario).toBeDefined());

  it("totalCost is within expected range", () => {
    const result = computeAiCost(input as Parameters<typeof computeAiCost>[0]);
    const total = parseFloat(result.totalCost);
    const range = scenario.expectedRanges.find((r) => r.resultField === "totalCost")!;
    expect(total).toBeGreaterThanOrEqual(range.min);
    expect(total).toBeLessThanOrEqual(range.max);
  });
});

// ─── Live engine runs — scenario: three-nines-error-budget ───────────────────

describe("scenario: three-nines-error-budget (live engine)", () => {
  const scenario = getScenarioById("three-nines-error-budget")!;

  it("scenario exists", () => expect(scenario).toBeDefined());

  it("allowableDowntimeMinutes is within expected range", () => {
    const result = computeErrorBudget(
      STANDARD_SLO_TIERS["99.9"]!,
      "monthly",
      { actualUptimePct: "99.87" },
    );
    const mins = parseFloat(result.allowableDowntimeMinutes);
    const range = scenario.expectedRanges.find((r) => r.resultField === "allowableDowntimeMinutes")!;
    expect(mins).toBeGreaterThanOrEqual(range.min);
    expect(mins).toBeLessThanOrEqual(range.max);
  });

  it("errorBudgetConsumedPct is within expected range (clamped at 100)", () => {
    const result = computeErrorBudget(
      STANDARD_SLO_TIERS["99.9"]!,
      "monthly",
      { actualUptimePct: "99.87" },
    );
    const consumed = parseFloat(result.errorBudgetConsumedPct!);
    const range = scenario.expectedRanges.find((r) => r.resultField === "errorBudgetConsumedPct")!;
    expect(consumed).toBeGreaterThanOrEqual(range.min);
    expect(consumed).toBeLessThanOrEqual(range.max);
  });
});

// ─── Live engine runs — scenario: ecommerce-outage-cost ──────────────────────

describe("scenario: ecommerce-outage-cost (live engine)", () => {
  const scenario = getScenarioById("ecommerce-outage-cost")!;
  const input = scenario.inputs.downtimeCost!;

  it("scenario exists", () => expect(scenario).toBeDefined());

  it("revenueCost is within expected range", () => {
    const result = computeDowntimeCost(input as Parameters<typeof computeDowntimeCost>[0]);
    const revenue = parseFloat(result.revenueCost);
    const range = scenario.expectedRanges.find((r) => r.resultField === "revenueCost")!;
    expect(revenue).toBeGreaterThanOrEqual(range.min);
    expect(revenue).toBeLessThanOrEqual(range.max);
  });

  it("engineeringCost is within expected range", () => {
    const result = computeDowntimeCost(input as Parameters<typeof computeDowntimeCost>[0]);
    const eng = parseFloat(result.engineeringCost);
    const range = scenario.expectedRanges.find((r) => r.resultField === "engineeringCost")!;
    expect(eng).toBeGreaterThanOrEqual(range.min);
    expect(eng).toBeLessThanOrEqual(range.max);
  });

  it("totalCost is within expected range", () => {
    const result = computeDowntimeCost(input as Parameters<typeof computeDowntimeCost>[0]);
    const total = parseFloat(result.totalCost);
    const range = scenario.expectedRanges.find((r) => r.resultField === "totalCost")!;
    expect(total).toBeGreaterThanOrEqual(range.min);
    expect(total).toBeLessThanOrEqual(range.max);
  });
});

// ─── Live engine runs — scenario: four-nines-reliability-roi ─────────────────

describe("scenario: four-nines-reliability-roi (live engine)", () => {
  const scenario = getScenarioById("four-nines-reliability-roi")!;
  const input = scenario.inputs.reliabilityRoi!;

  it("scenario exists", () => expect(scenario).toBeDefined());

  it("downtimeMinutesSaved is within expected range", () => {
    const result = computeReliabilityRoi(input as Parameters<typeof computeReliabilityRoi>[0]);
    const saved = parseFloat(result.downtimeMinutesSaved);
    const range = scenario.expectedRanges.find((r) => r.resultField === "downtimeMinutesSaved")!;
    expect(saved).toBeGreaterThanOrEqual(range.min);
    expect(saved).toBeLessThanOrEqual(range.max);
  });

  it("revenueProtectedPerPeriod is within expected range", () => {
    const result = computeReliabilityRoi(input as Parameters<typeof computeReliabilityRoi>[0]);
    const revenue = parseFloat(result.revenueProtectedPerPeriod);
    const range = scenario.expectedRanges.find((r) => r.resultField === "revenueProtectedPerPeriod")!;
    expect(revenue).toBeGreaterThanOrEqual(range.min);
    expect(revenue).toBeLessThanOrEqual(range.max);
  });
});

// ─── Live engine runs — scenario: multi-cloud-tech-normalisation ─────────────

describe("scenario: multi-cloud-tech-normalisation (live engine)", () => {
  const scenario = getScenarioById("multi-cloud-tech-normalisation")!;
  const rawInput = scenario.inputs.techNormalization! as { currency: string; items: TechCostInput[] };

  it("scenario exists", () => expect(scenario).toBeDefined());

  it("portfolioTotal is within expected range", () => {
    const result = normalizeTechCosts(rawInput.items, rawInput.currency);
    const total = parseFloat(result.portfolioTotal);
    const range = scenario.expectedRanges.find((r) => r.resultField === "portfolioTotal")!;
    expect(total).toBeGreaterThanOrEqual(range.min);
    expect(total).toBeLessThanOrEqual(range.max);
  });

  it("result has 4 items matching input", () => {
    const result = normalizeTechCosts(rawInput.items, rawInput.currency);
    expect(result.items).toHaveLength(4);
  });
});

// ─── Live engine runs — scenario: q1-cloud-budget-variance ───────────────────

describe("scenario: q1-cloud-budget-variance (live engine)", () => {
  const scenario = getScenarioById("q1-cloud-budget-variance")!;
  const rawInput = scenario.inputs.budgetVariance! as { currency: string; items: BudgetLineItem[] };

  it("scenario exists", () => expect(scenario).toBeDefined());

  it("totalVariance is within expected range", () => {
    const result = computeBudgetVariance(rawInput.items, rawInput.currency);
    const variance = parseFloat(result.totalVariance);
    const range = scenario.expectedRanges.find((r) => r.resultField === "totalVariance")!;
    expect(variance).toBeGreaterThanOrEqual(range.min);
    expect(variance).toBeLessThanOrEqual(range.max);
  });

  it("totalVariancePct is within expected range", () => {
    const result = computeBudgetVariance(rawInput.items, rawInput.currency);
    const pct = parseFloat(result.totalVariancePct);
    const range = scenario.expectedRanges.find((r) => r.resultField === "totalVariancePct")!;
    expect(pct).toBeGreaterThanOrEqual(range.min);
    expect(pct).toBeLessThanOrEqual(range.max);
  });

  it("compute and storage are over budget; network is not", () => {
    const result = computeBudgetVariance(rawInput.items, rawInput.currency);
    const compute = result.items.find((i) => i.id === "compute")!;
    const storage = result.items.find((i) => i.id === "storage")!;
    const network = result.items.find((i) => i.id === "network")!;
    expect(compute.isOverBudget).toBe(true);
    expect(storage.isOverBudget).toBe(false);
    expect(network.isOverBudget).toBe(false);
  });
});
