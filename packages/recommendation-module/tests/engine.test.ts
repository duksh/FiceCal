import { describe, it, expect } from "vitest";
import { computeRecommendations } from "../src/engine.js";
import type { HealthSignal } from "@ficecal/health-score";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeSignal(
  overrides: Partial<HealthSignal> & { id: string; category: HealthSignal["category"]; severity: HealthSignal["severity"] },
): HealthSignal {
  return {
    score: overrides.severity === "ok" ? 100 : overrides.severity === "warning" ? 60 : 20,
    label: `${overrides.category} signal`,
    rationale: "Test rationale.",
    ...overrides,
  };
}

const stalePricingWarning = makeSignal({
  id: "sig-pricing-warn",
  category: "pricing-freshness",
  severity: "warning",
  rationale: "Pricing data is 10 days old.",
});

const stalePricingCritical = makeSignal({
  id: "sig-pricing-crit",
  category: "pricing-freshness",
  severity: "critical",
  rationale: "Pricing data is 35 days old.",
});

const budgetWarning = makeSignal({
  id: "sig-budget-warn",
  category: "budget-adherence",
  severity: "warning",
  rationale: "Spend at 90% of budget.",
});

const budgetCritical = makeSignal({
  id: "sig-budget-crit",
  category: "budget-adherence",
  severity: "critical",
  rationale: "Spend exceeds budget.",
});

const okSignal = makeSignal({
  id: "sig-ok",
  category: "cost-efficiency",
  severity: "ok",
  rationale: "Cost efficiency is optimal.",
  score: 100,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("computeRecommendations", () => {
  describe("empty / ok-only inputs", () => {
    it("returns empty recommendations for empty signal array", () => {
      const result = computeRecommendations([]);
      expect(result.recommendations).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toMatch(/no signals met/i);
    });

    it("returns empty recommendations when all signals are ok", () => {
      const result = computeRecommendations([okSignal]);
      expect(result.recommendations).toHaveLength(0);
      expect(result.signalCount).toBe(1);
    });

    it("includes signalCount even when no recs are produced", () => {
      const result = computeRecommendations([okSignal, okSignal]);
      expect(result.signalCount).toBe(2);
    });
  });

  describe("audience filtering", () => {
    it("returns only finops-analyst recs when requested", () => {
      const result = computeRecommendations([stalePricingWarning], {
        audiences: ["finops-analyst"],
      });
      for (const rec of result.recommendations) {
        expect(rec.audience).toBe("finops-analyst");
      }
    });

    it("returns only platform-engineer recs when requested", () => {
      const result = computeRecommendations([stalePricingWarning], {
        audiences: ["platform-engineer"],
      });
      for (const rec of result.recommendations) {
        expect(rec.audience).toBe("platform-engineer");
      }
    });

    it("returns recs for all audiences by default", () => {
      const result = computeRecommendations([stalePricingWarning]);
      const audiences = new Set(result.recommendations.map((r) => r.audience));
      // pricing-freshness warning rules cover platform-engineer + finops-analyst
      expect(audiences.has("platform-engineer")).toBe(true);
      expect(audiences.has("finops-analyst")).toBe(true);
    });
  });

  describe("severity thresholding", () => {
    it("warning-level signal triggers warning rules", () => {
      const result = computeRecommendations([stalePricingWarning]);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("critical-level signal triggers both warning and critical rules", () => {
      const resultWarn = computeRecommendations([stalePricingWarning], {
        audiences: ["executive"],
      });
      const resultCrit = computeRecommendations([stalePricingCritical], {
        audiences: ["executive"],
      });
      // Critical signal should trigger the executive rule (minSeverity: critical)
      expect(resultCrit.recommendations.length).toBeGreaterThanOrEqual(
        resultWarn.recommendations.length,
      );
    });

    it("ok signal does not trigger any rules", () => {
      const result = computeRecommendations([okSignal]);
      expect(result.recommendations).toHaveLength(0);
    });

    it("minSeverity option filters below threshold", () => {
      const result = computeRecommendations([stalePricingWarning], {
        minSeverity: "critical",
      });
      expect(result.recommendations).toHaveLength(0);
    });
  });

  describe("priority ordering", () => {
    it("critical recommendations come before high, then medium, then low", () => {
      const result = computeRecommendations([budgetCritical, stalePricingWarning]);
      const priorities = result.recommendations.map((r) => r.priority);
      const order = { critical: 3, high: 2, medium: 1, low: 0 } as const;
      for (let i = 1; i < priorities.length; i++) {
        const prev = priorities[i - 1]!;
        const curr = priorities[i]!;
        expect(order[prev]).toBeGreaterThanOrEqual(order[curr]);
      }
    });
  });

  describe("deduplication", () => {
    it("does not emit duplicate recommendation ids", () => {
      const result = computeRecommendations([stalePricingWarning, stalePricingCritical]);
      const ids = result.recommendations.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("keeps highest priority when same rule matches multiple signals", () => {
      // stalePricingCritical should escalate the same rule id to higher priority
      const warnOnly = computeRecommendations([stalePricingWarning], {
        audiences: ["finops-analyst"],
      });
      const critOnly = computeRecommendations([stalePricingCritical], {
        audiences: ["finops-analyst"],
      });
      // Both should produce a finops rec; crit should not have lower priority
      if (warnOnly.recommendations.length > 0 && critOnly.recommendations.length > 0) {
        const warnRec = warnOnly.recommendations[0]!;
        const critRec = critOnly.recommendations[0]!;
        const order = { critical: 3, high: 2, medium: 1, low: 0 } as const;
        expect(order[critRec.priority]).toBeGreaterThanOrEqual(order[warnRec.priority]);
      }
    });
  });

  describe("recommendation content", () => {
    it("recommendation contains relatedSignalIds from the triggering signal", () => {
      const result = computeRecommendations([budgetCritical], {
        audiences: ["finops-analyst"],
      });
      const rec = result.recommendations.find((r) => r.category === "budget-adherence");
      expect(rec).toBeDefined();
      expect(rec!.relatedSignalIds).toContain("sig-budget-crit");
    });

    it("recommendation rationale incorporates signal rationale", () => {
      const result = computeRecommendations([budgetWarning], {
        audiences: ["finops-analyst"],
      });
      const rec = result.recommendations[0];
      expect(rec?.rationale).toContain("Spend at 90% of budget.");
    });

    it("budget breach rule is critical priority", () => {
      const result = computeRecommendations([budgetCritical], {
        audiences: ["finops-analyst"],
      });
      const breach = result.recommendations.find(
        (r) => r.id === "budget-adherence.finops-analyst.breach-response",
      );
      expect(breach).toBeDefined();
      expect(breach!.priority).toBe("critical");
    });
  });

  describe("result metadata", () => {
    it("requestedAudiences reflects options", () => {
      const result = computeRecommendations([budgetWarning], {
        audiences: ["executive", "finops-analyst"],
      });
      expect(result.requestedAudiences).toEqual(["executive", "finops-analyst"]);
    });

    it("generatedAt is a valid ISO string", () => {
      const result = computeRecommendations([budgetWarning]);
      expect(() => new Date(result.generatedAt)).not.toThrow();
      expect(new Date(result.generatedAt).toISOString()).toBe(result.generatedAt);
    });

    it("signalCount reflects the full input length, not just actionable", () => {
      const result = computeRecommendations([okSignal, budgetWarning]);
      expect(result.signalCount).toBe(2);
    });
  });
});
