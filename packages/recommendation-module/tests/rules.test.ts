import { describe, it, expect } from "vitest";
import { RECOMMENDATION_RULES } from "../src/rules.js";

describe("RECOMMENDATION_RULES catalogue", () => {
  it("has no duplicate rule ids", () => {
    const ids = RECOMMENDATION_RULES.map((r) => r.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it("all rule ids match the <category>.<audience>.<slug> convention", () => {
    for (const rule of RECOMMENDATION_RULES) {
      const parts = rule.id.split(".");
      expect(parts.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("minSeverity is always 'warning' or 'critical'", () => {
    for (const rule of RECOMMENDATION_RULES) {
      expect(["warning", "critical"]).toContain(rule.minSeverity);
    }
  });

  it("priority is always a valid RecommendationPriority", () => {
    const valid = new Set(["critical", "high", "medium", "low"]);
    for (const rule of RECOMMENDATION_RULES) {
      expect(valid.has(rule.priority)).toBe(true);
    }
  });

  it("all categories are valid SignalCategory values", () => {
    const validCategories = new Set([
      "cost-efficiency",
      "pricing-freshness",
      "data-completeness",
      "commitment-utilisation",
      "budget-adherence",
      "model-trust",
    ]);
    for (const rule of RECOMMENDATION_RULES) {
      expect(validCategories.has(rule.category)).toBe(true);
    }
  });

  it("all audiences are valid RecommendationAudience values", () => {
    const validAudiences = new Set([
      "finops-analyst",
      "developer",
      "executive",
      "platform-engineer",
    ]);
    for (const rule of RECOMMENDATION_RULES) {
      expect(validAudiences.has(rule.audience)).toBe(true);
    }
  });

  it("title is non-empty and ≤80 characters for all rules", () => {
    for (const rule of RECOMMENDATION_RULES) {
      expect(rule.title.length).toBeGreaterThan(0);
      expect(rule.title.length).toBeLessThanOrEqual(80);
    }
  });

  it("action is non-empty for all rules", () => {
    for (const rule of RECOMMENDATION_RULES) {
      expect(rule.action.length).toBeGreaterThan(0);
    }
  });

  it("rationale factory returns a non-empty string", () => {
    for (const rule of RECOMMENDATION_RULES) {
      const result = rule.rationale("test signal rationale");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it("budget-adherence has at least one critical-priority rule", () => {
    const criticalBudget = RECOMMENDATION_RULES.filter(
      (r) => r.category === "budget-adherence" && r.priority === "critical",
    );
    expect(criticalBudget.length).toBeGreaterThan(0);
  });

  it("pricing-freshness rules exist for platform-engineer and finops-analyst", () => {
    const audiences = RECOMMENDATION_RULES.filter(
      (r) => r.category === "pricing-freshness",
    ).map((r) => r.audience);
    expect(audiences).toContain("platform-engineer");
    expect(audiences).toContain("finops-analyst");
  });

  it("covers all six signal categories", () => {
    const coveredCategories = new Set(RECOMMENDATION_RULES.map((r) => r.category));
    const allCategories = [
      "cost-efficiency",
      "pricing-freshness",
      "data-completeness",
      "commitment-utilisation",
      "budget-adherence",
      "model-trust",
    ];
    for (const cat of allCategories) {
      expect(coveredCategories.has(cat)).toBe(true);
    }
  });
});
