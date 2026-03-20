import { describe, it, expect } from "vitest";
import { computeTokenCost } from "../src/compute.js";

describe("computeTokenCost", () => {
  describe("per_token", () => {
    it("computes correct total for separate input/output rates", () => {
      // 1000 input @ $0.000015/token = $0.015
      // 500 output @ $0.000060/token = $0.030
      // total = $0.045
      const result = computeTokenCost({
        pricingUnit: "per_token",
        inputTokens: 1000,
        outputTokens: 500,
        inputPricePerUnit: "0.000015",
        outputPricePerUnit: "0.000060",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.0450000000");
      expect(result.currency).toBe("USD");
      expect(result.pricingUnit).toBe("per_token");
    });

    it("uses inputPricePerUnit for output when outputPricePerUnit is omitted", () => {
      // 2000 total tokens @ $0.000010/token = $0.020
      const result = computeTokenCost({
        pricingUnit: "per_token",
        inputTokens: 1000,
        outputTokens: 1000,
        inputPricePerUnit: "0.000010",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.0200000000");
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toMatch(/outputPricePerUnit not provided/i);
    });

    it("returns breakdown with two line items", () => {
      const result = computeTokenCost({
        pricingUnit: "per_token",
        inputTokens: 500,
        outputTokens: 250,
        inputPricePerUnit: "0.000020",
        outputPricePerUnit: "0.000040",
        currency: "USD",
        period: "daily",
      });
      expect(result.breakdown).toHaveLength(2);
      expect(result.breakdown[0]!.label).toBe("Input tokens");
      expect(result.breakdown[1]!.label).toBe("Output tokens");
    });

    it("handles zero tokens gracefully", () => {
      const result = computeTokenCost({
        pricingUnit: "per_token",
        inputTokens: 0,
        outputTokens: 0,
        inputPricePerUnit: "0.000015",
        outputPricePerUnit: "0.000060",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.0000000000");
    });
  });

  describe("per_1k_tokens", () => {
    it("scales price correctly for 1k tokens", () => {
      // 10,000 input @ $3.00/1k = $30.00
      // 5,000 output @ $15.00/1k = $75.00
      // total = $105.00
      const result = computeTokenCost({
        pricingUnit: "per_1k_tokens",
        inputTokens: 10_000,
        outputTokens: 5_000,
        inputPricePerUnit: "3.00",
        outputPricePerUnit: "15.00",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("105.0000000000");
    });

    it("correctly prices 1000 tokens at 1k rate", () => {
      // 1000 tokens @ $1.00/1k = $1.00 exactly
      const result = computeTokenCost({
        pricingUnit: "per_1k_tokens",
        inputTokens: 1000,
        outputTokens: 0,
        inputPricePerUnit: "1.00",
        outputPricePerUnit: "0",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("1.0000000000");
    });
  });

  describe("per_1m_tokens", () => {
    it("scales price correctly for 1m tokens", () => {
      // 2,000,000 input @ $0.50/1M = $1.00
      // 1,000,000 output @ $1.50/1M = $1.50
      // total = $2.50
      const result = computeTokenCost({
        pricingUnit: "per_1m_tokens",
        inputTokens: 2_000_000,
        outputTokens: 1_000_000,
        inputPricePerUnit: "0.50",
        outputPricePerUnit: "1.50",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("2.5000000000");
    });

    it("real-world Claude 3 Haiku pricing — 100k input, 50k output", () => {
      // Claude 3 Haiku: $0.25/1M input, $1.25/1M output
      // 100k input: 0.25 * 0.1 = $0.025
      // 50k output: 1.25 * 0.05 = $0.0625
      // total = $0.0875
      const result = computeTokenCost({
        pricingUnit: "per_1m_tokens",
        inputTokens: 100_000,
        outputTokens: 50_000,
        inputPricePerUnit: "0.25",
        outputPricePerUnit: "1.25",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.0875000000");
    });
  });

  describe("output metadata", () => {
    it("includes formulasApplied", () => {
      const result = computeTokenCost({
        pricingUnit: "per_token",
        inputTokens: 100,
        outputTokens: 50,
        inputPricePerUnit: "0.000010",
        currency: "USD",
        period: "monthly",
      });
      expect(result.formulasApplied).toContain("unit.tokenCost");
    });

    it("computedAt is a valid ISO string", () => {
      const result = computeTokenCost({
        pricingUnit: "per_token",
        inputTokens: 100,
        outputTokens: 50,
        inputPricePerUnit: "0.000010",
        currency: "USD",
        period: "monthly",
      });
      expect(new Date(result.computedAt).toISOString()).toBe(result.computedAt);
    });
  });
});
