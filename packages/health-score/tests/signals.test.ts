import { describe, it, expect } from "vitest";
import {
  evaluatePricingFreshness,
  evaluateBudgetAdherence,
  evaluateModelTrust,
} from "../src/signals.js";

describe("evaluatePricingFreshness", () => {
  it("verified → score 100, severity ok", () => {
    const result = evaluatePricingFreshness({ snapshotAgeInDays: 100, pricingSourceType: "verified" });
    expect(result.score).toBe(100);
    expect(result.severity).toBe("ok");
  });

  it("dynamic, 3 days → score 100, severity ok", () => {
    const result = evaluatePricingFreshness({ snapshotAgeInDays: 3, pricingSourceType: "dynamic" });
    expect(result.score).toBe(100);
    expect(result.severity).toBe("ok");
  });

  it("dynamic, 25 days → score between 50–74, severity warning", () => {
    const result = evaluatePricingFreshness({ snapshotAgeInDays: 25, pricingSourceType: "dynamic" });
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThanOrEqual(74);
    expect(result.severity).toBe("warning");
  });

  it("dynamic, 45 days → score 0, severity critical", () => {
    const result = evaluatePricingFreshness({ snapshotAgeInDays: 45, pricingSourceType: "dynamic" });
    expect(result.score).toBe(0);
    expect(result.severity).toBe("critical");
  });

  it("hardcoded, 3 days → score 75, severity ok", () => {
    const result = evaluatePricingFreshness({ snapshotAgeInDays: 3, pricingSourceType: "hardcoded" });
    expect(result.score).toBe(75);
    expect(result.severity).toBe("ok");
  });

  it("hardcoded, 15 days → score 40, severity warning", () => {
    const result = evaluatePricingFreshness({ snapshotAgeInDays: 15, pricingSourceType: "hardcoded" });
    expect(result.score).toBe(40);
    expect(result.severity).toBe("warning");
  });

  it("hardcoded, 45 days → score 0, severity critical", () => {
    const result = evaluatePricingFreshness({ snapshotAgeInDays: 45, pricingSourceType: "hardcoded" });
    expect(result.score).toBe(0);
    expect(result.severity).toBe("critical");
  });

  it("all signals have required fields", () => {
    const result = evaluatePricingFreshness({ snapshotAgeInDays: 5, pricingSourceType: "dynamic" });
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("label");
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("severity");
    expect(result).toHaveProperty("rationale");
    expect(typeof result.id).toBe("string");
    expect(typeof result.category).toBe("string");
    expect(typeof result.label).toBe("string");
    expect(typeof result.score).toBe("number");
    expect(typeof result.severity).toBe("string");
    expect(typeof result.rationale).toBe("string");
  });
});

describe("evaluateBudgetAdherence", () => {
  it("50% used → score 100, severity ok", () => {
    const result = evaluateBudgetAdherence({ actualAmount: "500", budgetAmount: "1000" });
    expect(result.score).toBe(100);
    expect(result.severity).toBe("ok");
  });

  it("90% used → score in warning range", () => {
    const result = evaluateBudgetAdherence({ actualAmount: "900", budgetAmount: "1000" });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThan(75);
    expect(result.severity).toBe("warning");
  });

  it("105% used → score 0, severity critical", () => {
    const result = evaluateBudgetAdherence({ actualAmount: "1050", budgetAmount: "1000" });
    expect(result.score).toBe(0);
    expect(result.severity).toBe("critical");
  });

  it("invalid budget (0) → severity critical", () => {
    const result = evaluateBudgetAdherence({ actualAmount: "500", budgetAmount: "0" });
    expect(result.severity).toBe("critical");
  });
});

describe("evaluateModelTrust", () => {
  it("verified → score 100, severity ok", () => {
    const result = evaluateModelTrust({ pricingSourceType: "verified", snapshotAgeInDays: 100 });
    expect(result.score).toBe(100);
    expect(result.severity).toBe("ok");
  });

  it("dynamic + 3 days → score 90, severity ok", () => {
    const result = evaluateModelTrust({ pricingSourceType: "dynamic", snapshotAgeInDays: 3 });
    expect(result.score).toBe(90);
    expect(result.severity).toBe("ok");
  });

  it("hardcoded + 45 days → score 20, severity critical", () => {
    const result = evaluateModelTrust({ pricingSourceType: "hardcoded", snapshotAgeInDays: 45 });
    expect(result.score).toBe(20);
    expect(result.severity).toBe("critical");
  });
});
