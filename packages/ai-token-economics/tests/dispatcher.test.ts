import { describe, it, expect } from "vitest";
import { computeAiCost } from "../src/dispatcher.js";

describe("computeAiCost dispatcher", () => {
  describe("per_token routing", () => {
    it("routes per_token to token cost engine", () => {
      const result = computeAiCost({
        pricingUnit: "per_token",
        inputTokens: 1000,
        outputTokens: 500,
        inputPricePerUnit: "0.000015",
        outputPricePerUnit: "0.000060",
        currency: "USD",
        period: "monthly",
      });
      expect(result.pricingUnit).toBe("per_token");
      expect(result.formulasApplied).toContain("unit.tokenCost");
    });
  });

  describe("per_1k_tokens routing", () => {
    it("routes per_1k_tokens to token cost engine", () => {
      const result = computeAiCost({
        pricingUnit: "per_1k_tokens",
        inputTokens: 10_000,
        outputTokens: 5_000,
        inputPricePerUnit: "3.00",
        outputPricePerUnit: "15.00",
        currency: "USD",
        period: "monthly",
      });
      expect(result.pricingUnit).toBe("per_1k_tokens");
      expect(result.totalCost).toBe("105.0000000000");
    });
  });

  describe("per_1m_tokens routing", () => {
    it("routes per_1m_tokens to token cost engine", () => {
      const result = computeAiCost({
        pricingUnit: "per_1m_tokens",
        inputTokens: 1_000_000,
        outputTokens: 500_000,
        inputPricePerUnit: "0.50",
        outputPricePerUnit: "1.50",
        currency: "USD",
        period: "monthly",
      });
      expect(result.pricingUnit).toBe("per_1m_tokens");
    });
  });

  describe("per_image routing (Gap 1)", () => {
    it("routes per_image to image cost engine", () => {
      const result = computeAiCost({
        pricingUnit: "per_image",
        imageCount: 10,
        pricePerImage: "0.040",
        currency: "USD",
        period: "monthly",
      });
      expect(result.pricingUnit).toBe("per_image");
      expect(result.formulasApplied).toContain("unit.imageCost");
      expect(result.totalCost).toBe("0.4000000000");
    });

    it("per_image with multipliers routes correctly", () => {
      const result = computeAiCost({
        pricingUnit: "per_image",
        imageCount: 5,
        pricePerImage: "0.040",
        resolutionMultiplier: "2.0",
        currency: "USD",
        period: "monthly",
      });
      expect(result.pricingUnit).toBe("per_image");
      expect(result.totalCost).toBe("0.4000000000");
    });
  });

  describe("per_request routing", () => {
    it("routes per_request to request cost engine", () => {
      const result = computeAiCost({
        pricingUnit: "per_request",
        requestCount: 1000,
        pricePerRequest: "0.0005",
        currency: "USD",
        period: "monthly",
      });
      expect(result.pricingUnit).toBe("per_request");
      expect(result.totalCost).toBe("0.5000000000");
      expect(result.formulasApplied).toContain("unit.requestCost");
    });
  });

  describe("per_second routing", () => {
    it("routes per_second to time cost engine", () => {
      const result = computeAiCost({
        pricingUnit: "per_second",
        durationSeconds: 3600,
        pricePerSecond: "0.00010",
        currency: "USD",
        period: "monthly",
      });
      expect(result.pricingUnit).toBe("per_second");
      expect(result.totalCost).toBe("0.3600000000");
      expect(result.formulasApplied).toContain("unit.timeCost");
    });
  });

  describe("result invariants", () => {
    it("all routes produce a valid computedAt ISO timestamp", () => {
      const inputs = [
        {
          pricingUnit: "per_token" as const,
          inputTokens: 100,
          outputTokens: 50,
          inputPricePerUnit: "0.000010",
          currency: "USD",
          period: "monthly" as const,
        },
        {
          pricingUnit: "per_image" as const,
          imageCount: 1,
          pricePerImage: "0.040",
          currency: "USD",
          period: "monthly" as const,
        },
        {
          pricingUnit: "per_request" as const,
          requestCount: 1,
          pricePerRequest: "0.001",
          currency: "USD",
          period: "monthly" as const,
        },
        {
          pricingUnit: "per_second" as const,
          durationSeconds: 1,
          pricePerSecond: "0.001",
          currency: "USD",
          period: "monthly" as const,
        },
      ];

      for (const input of inputs) {
        const result = computeAiCost(input);
        expect(new Date(result.computedAt).toISOString()).toBe(result.computedAt);
      }
    });

    it("all routes return a breakdown array", () => {
      const result = computeAiCost({
        pricingUnit: "per_request",
        requestCount: 5,
        pricePerRequest: "0.001",
        currency: "USD",
        period: "monthly",
      });
      expect(Array.isArray(result.breakdown)).toBe(true);
    });
  });
});
