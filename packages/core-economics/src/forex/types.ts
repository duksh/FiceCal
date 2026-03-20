export type ForexRates = {
  base: string; // ISO currency code, e.g. "USD"
  asOf: string; // ISO date string YYYY-MM-DD
  rates: Record<string, string>; // currency code → decimal-safe rate string relative to base
};

export interface ForexRateProvider {
  /** Returns exchange rates relative to baseCurrency as of asOf date (defaults to today) */
  getRates(baseCurrency: string, asOf?: Date): Promise<ForexRates>;
  /** Returns age in calendar days of the most recently fetched rates, or null if never fetched */
  getAgeInDays(relativeTo?: Date): number | null;
}
