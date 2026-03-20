import { describe, it, expect } from "vitest";
import { normalizePeriod, periodsPerYear, MONTHS_IN_PERIOD } from "../src/period.js";

describe("normalizePeriod", () => {
  it("monthly → annual: multiplies by 12", () => {
    const result = normalizePeriod("1000", "monthly", "annual");
    expect(parseFloat(result)).toBeCloseTo(12000, 4);
  });
  it("annual → monthly: divides by 12", () => {
    const result = normalizePeriod("12000", "annual", "monthly");
    expect(parseFloat(result)).toBeCloseTo(1000, 4);
  });
  it("monthly → quarterly: multiplies by 3", () => {
    const result = normalizePeriod("1000", "monthly", "quarterly");
    expect(parseFloat(result)).toBeCloseTo(3000, 4);
  });
  it("identity: same period returns same amount", () => {
    const result = normalizePeriod("999.99", "monthly", "monthly");
    expect(parseFloat(result)).toBeCloseTo(999.99, 4);
  });
  it("handles decimal input strings", () => {
    const result = normalizePeriod("1000.50", "monthly", "annual");
    expect(parseFloat(result)).toBeCloseTo(12006, 4);
  });
  it("daily → monthly: approximately 30.4375 days/month", () => {
    const result = normalizePeriod("100", "daily", "monthly");
    expect(parseFloat(result)).toBeCloseTo(3043.75, 1);
  });
});

describe("periodsPerYear", () => {
  it("monthly → 12", () => {
    expect(parseFloat(periodsPerYear("monthly"))).toBeCloseTo(12, 4);
  });
  it("quarterly → 4", () => {
    expect(parseFloat(periodsPerYear("quarterly"))).toBeCloseTo(4, 4);
  });
  it("annual → 1", () => {
    expect(parseFloat(periodsPerYear("annual"))).toBeCloseTo(1, 4);
  });
});

describe("MONTHS_IN_PERIOD", () => {
  it("monthly is 1", () => {
    expect(MONTHS_IN_PERIOD["monthly"]).toBe("1");
  });
  it("quarterly is 3", () => {
    expect(MONTHS_IN_PERIOD["quarterly"]).toBe("3");
  });
  it("annual is 12", () => {
    expect(MONTHS_IN_PERIOD["annual"]).toBe("12");
  });
});
