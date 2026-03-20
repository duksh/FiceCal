/**
 * Tests for computeImageCost — Gap 1 close.
 *
 * Verifies that the "per_image" pricing unit dispatches to its own
 * computation path with correct multiplier logic.
 */
import { describe, it, expect } from "vitest";
import { computeImageCost } from "../src/compute.js";

describe("computeImageCost (Gap 1 — per_image)", () => {
  describe("basic computation", () => {
    it("computes correct total at base rate, no multipliers", () => {
      // 10 images @ $0.040 = $0.40
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 10,
        pricePerImage: "0.040",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.4000000000");
      expect(result.pricingUnit).toBe("per_image");
      expect(result.currency).toBe("USD");
    });

    it("computes single image cost correctly", () => {
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 1,
        pricePerImage: "0.080",
        currency: "USD",
        period: "daily",
      });
      expect(result.totalCost).toBe("0.0800000000");
    });

    it("handles zero images", () => {
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 0,
        pricePerImage: "0.040",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.0000000000");
    });
  });

  describe("resolution multiplier", () => {
    it("applies resolution multiplier correctly", () => {
      // 5 images @ $0.040 × 1.5 resolution = $0.30
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 5,
        pricePerImage: "0.040",
        resolutionMultiplier: "1.5",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.3000000000");
    });

    it("HD multiplier scenario: 20 images at 2× HD rate", () => {
      // 20 images @ $0.020 × 2.0 = $0.80
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 20,
        pricePerImage: "0.020",
        resolutionMultiplier: "2.0",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.8000000000");
    });

    it("warns when resolutionMultiplier < 1", () => {
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 1,
        pricePerImage: "0.040",
        resolutionMultiplier: "0.5",
        currency: "USD",
        period: "monthly",
      });
      expect(result.warnings.some((w) => w.includes("resolutionMultiplier"))).toBe(true);
    });
  });

  describe("steps multiplier", () => {
    it("applies steps multiplier correctly", () => {
      // 4 images @ $0.050 × 2.0 steps = $0.40
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 4,
        pricePerImage: "0.050",
        stepsMultiplier: "2.0",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.4000000000");
    });

    it("warns when stepsMultiplier < 1", () => {
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 1,
        pricePerImage: "0.040",
        stepsMultiplier: "0.8",
        currency: "USD",
        period: "monthly",
      });
      expect(result.warnings.some((w) => w.includes("stepsMultiplier"))).toBe(true);
    });
  });

  describe("combined multipliers", () => {
    it("applies both multipliers correctly", () => {
      // 3 images @ $0.040 × 1.5 res × 2.0 steps = $0.36
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 3,
        pricePerImage: "0.040",
        resolutionMultiplier: "1.5",
        stepsMultiplier: "2.0",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("0.3600000000");
    });

    it("includes base rate and multiplier breakdown lines when non-unity multipliers applied", () => {
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 1,
        pricePerImage: "0.040",
        resolutionMultiplier: "1.5",
        stepsMultiplier: "2.0",
        currency: "USD",
        period: "monthly",
      });
      const labels = result.breakdown.map((b) => b.label);
      expect(labels).toContain("Base rate");
      expect(labels).toContain("Resolution multiplier");
      expect(labels).toContain("Steps multiplier");
    });
  });

  describe("real-world scenarios", () => {
    it("DALL-E 3 HD 1024×1024: 100 images @ $0.080", () => {
      // $8.00 total
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 100,
        pricePerImage: "0.080",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("8.0000000000");
    });

    it("Titan Image Generator: 1000 images @ $0.010 × 1.2 HD = $12.00", () => {
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 1000,
        pricePerImage: "0.010",
        resolutionMultiplier: "1.2",
        currency: "USD",
        period: "monthly",
      });
      expect(result.totalCost).toBe("12.0000000000");
    });
  });

  describe("output metadata", () => {
    it("includes formulasApplied: unit.imageCost", () => {
      const result = computeImageCost({
        pricingUnit: "per_image",
        imageCount: 1,
        pricePerImage: "0.040",
        currency: "USD",
        period: "monthly",
      });
      expect(result.formulasApplied).toContain("unit.imageCost");
    });
  });
});
