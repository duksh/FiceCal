import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { computeEconomics } from "../src/engine.js";
import { StaticForexAdapter } from "../src/forex/static-adapter.js";
import type { ForexRates } from "../src/forex/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const forexFixture: ForexRates = JSON.parse(
  readFileSync(join(__dirname, "../fixtures/forex-rates.json"), "utf-8")
);
const forex = new StaticForexAdapter(forexFixture);

describe("computeEconomics — period normalization", () => {
  it("monthly → annual", async () => {
    const out = await computeEconomics({
      amount: "1000",
      currency: "USD",
      period: "monthly",
      targetPeriod: "annual",
    });
    expect(parseFloat(out.amount)).toBeCloseTo(12000, 4);
    expect(out.period).toBe("annual");
    expect(out.formulasApplied).toContain("period.normalize");
    expect(out.warnings).toHaveLength(0);
  });

  it("annual → monthly", async () => {
    const out = await computeEconomics({
      amount: "12000",
      currency: "USD",
      period: "annual",
      targetPeriod: "monthly",
    });
    expect(parseFloat(out.amount)).toBeCloseTo(1000, 4);
  });

  it("identity: no period change", async () => {
    const out = await computeEconomics({
      amount: "500",
      currency: "USD",
      period: "monthly",
    });
    expect(parseFloat(out.amount)).toBeCloseTo(500, 4);
    expect(out.formulasApplied).not.toContain("period.normalize");
  });
});

describe("computeEconomics — currency conversion", () => {
  it("USD → EUR with forex", async () => {
    const out = await computeEconomics(
      { amount: "1000", currency: "USD", period: "monthly", targetCurrency: "EUR" },
      { forex }
    );
    expect(out.currency).toBe("EUR");
    expect(parseFloat(out.amount)).toBeCloseTo(923, 0);
    expect(out.formulasApplied).toContain("currency.convert");
  });

  it("USD → MUR with forex", async () => {
    const out = await computeEconomics(
      { amount: "100", currency: "USD", period: "monthly", targetCurrency: "MUR" },
      { forex }
    );
    expect(out.currency).toBe("MUR");
    expect(parseFloat(out.amount)).toBeCloseTo(4650, 0);
  });

  it("warns when no forex provider supplied but targetCurrency differs", async () => {
    const out = await computeEconomics({
      amount: "1000",
      currency: "USD",
      period: "monthly",
      targetCurrency: "EUR",
    });
    expect(out.currency).toBe("USD");
    expect(out.warnings.some((w) => w.includes("no ForexRateProvider"))).toBe(true);
  });

  it("same currency: no conversion applied", async () => {
    const out = await computeEconomics(
      { amount: "1000", currency: "USD", period: "monthly", targetCurrency: "USD" },
      { forex }
    );
    expect(out.formulasApplied).not.toContain("currency.convert");
    expect(out.currency).toBe("USD");
  });
});

describe("computeEconomics — unit economics", () => {
  it("derives costPerUnit", async () => {
    const out = await computeEconomics({
      amount: "1000",
      currency: "USD",
      period: "monthly",
      usageQuantity: "500",
      usageUnit: "API calls",
    });
    expect(parseFloat(out.costPerUnit!)).toBeCloseTo(2, 4);
    expect(out.usageUnit).toBe("API calls");
    expect(out.formulasApplied).toContain("unit.costPerUnit");
  });

  it("warns on zero usageQuantity", async () => {
    const out = await computeEconomics({
      amount: "1000",
      currency: "USD",
      period: "monthly",
      usageQuantity: "0",
    });
    expect(out.warnings.some((w) => w.includes("zero"))).toBe(true);
  });
});

describe("computeEconomics — combined period + currency", () => {
  it("monthly USD → annual EUR", async () => {
    const out = await computeEconomics(
      {
        amount: "1000",
        currency: "USD",
        period: "monthly",
        targetPeriod: "annual",
        targetCurrency: "EUR",
      },
      { forex }
    );
    // 1000 * 12 = 12000 USD → 12000 * 0.923 = 11076 EUR
    expect(out.period).toBe("annual");
    expect(out.currency).toBe("EUR");
    expect(parseFloat(out.amount)).toBeCloseTo(11076, 0);
    expect(out.formulasApplied).toContain("period.normalize");
    expect(out.formulasApplied).toContain("currency.convert");
  });
});

describe("computeEconomics — input validation", () => {
  it("rejects invalid period enum", async () => {
    await expect(
      computeEconomics({ amount: "1000", currency: "USD", period: "biweekly" })
    ).rejects.toThrow();
  });

  it("rejects missing amount", async () => {
    await expect(
      computeEconomics({ currency: "USD", period: "monthly" })
    ).rejects.toThrow();
  });
});
