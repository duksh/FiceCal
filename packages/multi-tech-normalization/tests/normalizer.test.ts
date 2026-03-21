import { describe, it, expect } from "vitest";
import { normalizeTechCosts, CATEGORY_BASIS_UNIT } from "../src/index.js";
import type { TechCostInput } from "../src/index.js";

function input(overrides: Partial<TechCostInput> & Pick<TechCostInput, "id" | "category" | "rawCost" | "quantity">): TechCostInput {
  return {
    label: overrides.id,
    currency: "USD",
    nativeUnit: "units",
    ...overrides,
  };
}

describe("normalizeTechCosts", () => {
  describe("empty / edge cases", () => {
    it("returns empty portfolio for no inputs", () => {
      const r = normalizeTechCosts([]);
      expect(r.items).toHaveLength(0);
      expect(r.portfolioTotal).toBe("0.0000000000");
      expect(r.warnings.length).toBeGreaterThan(0);
    });

    it("warns when quantity is zero", () => {
      const r = normalizeTechCosts([input({ id: "x", category: "cloud-compute", rawCost: "100", quantity: 0 })]);
      expect(r.warnings.some(w => w.includes("quantity is zero"))).toBe(true);
    });

    it("warns on mixed currencies", () => {
      const r = normalizeTechCosts([
        input({ id: "a", category: "cloud-compute", rawCost: "100", quantity: 10, currency: "USD" }),
        input({ id: "b", category: "ai-inference", rawCost: "50", quantity: 5, currency: "EUR" }),
      ]);
      expect(r.warnings.some(w => w.includes("Mixed currencies"))).toBe(true);
    });
  });

  describe("single item normalization", () => {
    it("computes costPerBasisUnit correctly for cloud-compute", () => {
      // $240 for 100 vCPU-hours → $2.40/vCPU-hour
      const r = normalizeTechCosts([input({ id: "ec2", category: "cloud-compute", rawCost: "240", quantity: 100 })]);
      expect(r.items[0]?.costPerBasisUnit).toBe("2.4000000000");
      expect(r.items[0]?.basisUnit).toBe(CATEGORY_BASIS_UNIT["cloud-compute"]);
    });

    it("computes costPerBasisUnit for ai-inference", () => {
      // $15 for 10M tokens → $1.50/1M tokens
      const r = normalizeTechCosts([input({ id: "claude", category: "ai-inference", rawCost: "15", quantity: 10 })]);
      expect(r.items[0]?.costPerBasisUnit).toBe("1.5000000000");
    });

    it("normalizedTotal equals rawCost for single item", () => {
      const r = normalizeTechCosts([input({ id: "x", category: "cloud-storage", rawCost: "45.50", quantity: 500 })]);
      expect(r.items[0]?.normalizedTotal).toBe("45.5000000000");
      expect(r.portfolioTotal).toBe("45.5000000000");
    });
  });

  describe("efficiency index", () => {
    it("efficiency index is 1.0 when cost equals category median", () => {
      // cloud-compute median = $0.048/vCPU-hour → $4.80 for 100 vCPU-hours
      const r = normalizeTechCosts([input({ id: "x", category: "cloud-compute", rawCost: "4.80", quantity: 100 })]);
      const idx = parseFloat(r.items[0]!.efficiencyIndex);
      expect(idx).toBeCloseTo(1.0, 5);
    });

    it("efficiency index < 1 means below-median cost (efficient)", () => {
      // $2.40 for 100 vCPU-hours = $0.024/hr vs median $0.048 → idx = 0.5
      const r = normalizeTechCosts([input({ id: "x", category: "cloud-compute", rawCost: "2.40", quantity: 100 })]);
      const idx = parseFloat(r.items[0]!.efficiencyIndex);
      expect(idx).toBeCloseTo(0.5, 5);
    });

    it("efficiency index > 1 means above-median cost (expensive)", () => {
      // $9.60 for 100 vCPU-hours = $0.096/hr vs median $0.048 → idx = 2.0
      const r = normalizeTechCosts([input({ id: "x", category: "cloud-compute", rawCost: "9.60", quantity: 100 })]);
      const idx = parseFloat(r.items[0]!.efficiencyIndex);
      expect(idx).toBeCloseTo(2.0, 5);
    });
  });

  describe("portfolio aggregation", () => {
    it("portfolioTotal is sum of all normalizedTotals", () => {
      const r = normalizeTechCosts([
        input({ id: "a", category: "cloud-compute", rawCost: "100", quantity: 10 }),
        input({ id: "b", category: "ai-inference", rawCost: "200", quantity: 5 }),
        input({ id: "c", category: "saas-licence", rawCost: "300", quantity: 20 }),
      ]);
      expect(r.portfolioTotal).toBe("600.0000000000");
    });

    it("byCategory groups items correctly", () => {
      const r = normalizeTechCosts([
        input({ id: "a", category: "cloud-compute", rawCost: "100", quantity: 10 }),
        input({ id: "b", category: "cloud-compute", rawCost: "50", quantity: 5 }),
        input({ id: "c", category: "ai-inference", rawCost: "200", quantity: 5 }),
      ]);
      expect(r.byCategory["cloud-compute"]).toBe("150.0000000000");
      expect(r.byCategory["ai-inference"]).toBe("200.0000000000");
    });

    it("identifies dominantCategory as the highest-spend category", () => {
      const r = normalizeTechCosts([
        input({ id: "a", category: "cloud-compute", rawCost: "100", quantity: 10 }),
        input({ id: "b", category: "ai-inference", rawCost: "400", quantity: 5 }),
        input({ id: "c", category: "saas-licence", rawCost: "200", quantity: 20 }),
      ]);
      expect(r.dominantCategory).toBe("ai-inference");
    });
  });

  describe("output metadata", () => {
    it("computedAt is a valid ISO string", () => {
      const r = normalizeTechCosts([input({ id: "x", category: "cloud-compute", rawCost: "10", quantity: 1 })]);
      expect(new Date(r.computedAt).toISOString()).toBe(r.computedAt);
    });

    it("formulasApplied contains expected formula ids", () => {
      const r = normalizeTechCosts([input({ id: "x", category: "cloud-compute", rawCost: "10", quantity: 1 })]);
      expect(r.items[0]?.formulasApplied).toContain("tech.normalization.costPerBasisUnit");
      expect(r.items[0]?.formulasApplied).toContain("tech.normalization.efficiencyIndex");
    });

    it("all categories have a basis unit defined", () => {
      const categories: Array<TechCostInput["category"]> = [
        "cloud-compute", "cloud-storage", "cloud-network", "ai-inference",
        "ai-training", "saas-licence", "on-prem-hardware", "managed-service",
        "data-transfer", "support-contract",
      ];
      for (const cat of categories) {
        expect(CATEGORY_BASIS_UNIT[cat]).toBeDefined();
        expect(CATEGORY_BASIS_UNIT[cat].length).toBeGreaterThan(0);
      }
    });
  });

  describe("real-world scenario", () => {
    it("mixed AI + cloud + SaaS portfolio normalises correctly", () => {
      const r = normalizeTechCosts([
        input({ id: "bedrock", category: "ai-inference", rawCost: "1250", quantity: 500, label: "AWS Bedrock Claude 3" }),
        input({ id: "ec2", category: "cloud-compute", rawCost: "480", quantity: 1000, label: "EC2 compute fleet" }),
        input({ id: "s3", category: "cloud-storage", rawCost: "46", quantity: 2000, label: "S3 storage" }),
        input({ id: "datadog", category: "saas-licence", rawCost: "300", quantity: 20, label: "Datadog seats" }),
      ]);
      expect(r.items).toHaveLength(4);
      expect(parseFloat(r.portfolioTotal)).toBeCloseTo(2076, 0);
      expect(r.dominantCategory).toBe("ai-inference");
      expect(r.warnings).toHaveLength(0);
    });
  });
});
