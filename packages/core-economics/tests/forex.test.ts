import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { StaticForexAdapter } from "../src/forex/static-adapter.js";
import type { ForexRates } from "../src/forex/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture: ForexRates = JSON.parse(
  readFileSync(join(__dirname, "../fixtures/forex-rates.json"), "utf-8")
);

describe("StaticForexAdapter", () => {
  it("returns the fixture rates", async () => {
    const adapter = new StaticForexAdapter(fixture);
    const rates = await adapter.getRates("USD");
    expect(rates.base).toBe("USD");
    expect(rates.rates["EUR"]).toBeDefined();
    expect(rates.rates["MUR"]).toBeDefined();
  });

  it("age is 0 for same-day fixture", () => {
    const adapter = new StaticForexAdapter({ ...fixture, asOf: "2026-03-20" });
    const age = adapter.getAgeInDays(new Date("2026-03-20"));
    expect(age).toBe(0);
  });

  it("age is 7 for week-old fixture", () => {
    const adapter = new StaticForexAdapter({ ...fixture, asOf: "2026-03-13" });
    const age = adapter.getAgeInDays(new Date("2026-03-20"));
    expect(age).toBe(7);
  });

  it("USD rate is 1 (base)", async () => {
    const adapter = new StaticForexAdapter(fixture);
    const rates = await adapter.getRates("USD");
    expect(rates.rates["USD"]).toBe("1");
  });
});
