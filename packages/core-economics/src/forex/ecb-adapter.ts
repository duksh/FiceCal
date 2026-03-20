import { Decimal } from "../precision.js";
import type { ForexRateProvider, ForexRates } from "./types.js";

const ECB_URL =
  "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

export class EcbForexAdapter implements ForexRateProvider {
  private lastFetched: ForexRates | null = null;

  async getRates(baseCurrency: string, _asOf?: Date): Promise<ForexRates> {
    const raw = await this.fetchEcb();
    return this.rebase(raw, baseCurrency.toUpperCase());
  }

  getAgeInDays(relativeTo?: Date): number | null {
    if (!this.lastFetched) return null;
    const ref = relativeTo ?? new Date();
    const fetchDate = new Date(this.lastFetched.asOf);
    const diffMs = ref.getTime() - fetchDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  private async fetchEcb(): Promise<ForexRates> {
    const res = await fetch(ECB_URL);
    if (!res.ok)
      throw new Error(`ECB fetch failed: ${res.status} ${res.statusText}`);
    const xml = await res.text();
    const parsed = this.parseXml(xml);
    this.lastFetched = parsed;
    return parsed;
  }

  private parseXml(xml: string): ForexRates {
    // Extract the date from time attribute
    const dateMatch = xml.match(/time='(\d{4}-\d{2}-\d{2})'/);
    if (!dateMatch) throw new Error("ECB XML: could not find date");
    const asOf = dateMatch[1];

    // Extract all currency/rate pairs
    const rateRegex = /currency='([A-Z]+)'\s+rate='([0-9.]+)'/g;
    const rates: Record<string, string> = { EUR: "1" }; // ECB base is EUR
    let match;
    while ((match = rateRegex.exec(xml)) !== null) {
      rates[match[1]] = match[2];
    }
    if (Object.keys(rates).length < 2)
      throw new Error("ECB XML: no rates parsed");
    return { base: "EUR", asOf, rates };
  }

  /** Rebase EUR-denominated ECB rates to any target base currency */
  private rebase(eurBased: ForexRates, targetBase: string): ForexRates {
    if (targetBase === "EUR") return eurBased;

    const baseRateStr = eurBased.rates[targetBase];
    if (!baseRateStr)
      throw new Error(
        `EcbForexAdapter: no EUR→${targetBase} rate available`
      );

    const baseRate = new Decimal(baseRateStr);
    const rebased: Record<string, string> = {};

    for (const [currency, rateStr] of Object.entries(eurBased.rates)) {
      if (currency === targetBase) {
        rebased[currency] = "1";
        continue;
      }
      // rate_new = rate_eur / base_eur
      const crossRate = new Decimal(rateStr).div(baseRate);
      rebased[currency] = crossRate.toFixed(10);
    }

    // Also add EUR itself
    rebased["EUR"] = new Decimal(1).div(baseRate).toFixed(10);

    return { base: targetBase, asOf: eurBased.asOf, rates: rebased };
  }
}
