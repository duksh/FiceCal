import { Decimal, toOutputString } from "./precision.js";

export type Period = "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "annual";

export const PERIODS: readonly Period[] = [
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "annual",
];

export const MONTHS_IN_PERIOD: Record<Period, string> = {
  hourly: "0.00136986301369863",
  daily: "0.03285420944558521561",
  weekly: "0.22997946611909650927",
  monthly: "1",
  quarterly: "3",
  annual: "12",
};

/**
 * Converts a monetary amount from one billing period to another using month-equivalent ratios.
 */
export function normalizePeriod(
  amount: string,
  fromPeriod: Period,
  toPeriod: Period
): string {
  const fromMonths = new Decimal(MONTHS_IN_PERIOD[fromPeriod]);
  const toMonths = new Decimal(MONTHS_IN_PERIOD[toPeriod]);
  const ratio = toMonths.div(fromMonths);
  const result = new Decimal(amount).mul(ratio);
  return toOutputString(result);
}

/**
 * Returns the number of periods per year for a given period granularity.
 */
export function periodsPerYear(period: Period): string {
  const annualMonths = new Decimal(MONTHS_IN_PERIOD["annual"]);
  const periodMonths = new Decimal(MONTHS_IN_PERIOD[period]);
  const result = annualMonths.div(periodMonths);
  return toOutputString(result);
}
