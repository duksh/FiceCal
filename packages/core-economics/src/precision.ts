import Decimal from "decimal.js";

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export const INTERNAL_PRECISION = 28;
export const OUTPUT_DECIMAL_PLACES = 10;
export const DISPLAY_DECIMAL_PLACES = 6;

export function toOutputString(d: Decimal): string {
  return d.toDecimalPlaces(OUTPUT_DECIMAL_PLACES, Decimal.ROUND_HALF_UP).toFixed(OUTPUT_DECIMAL_PLACES);
}

export function toDisplayString(d: Decimal): string {
  return d.toDecimalPlaces(DISPLAY_DECIMAL_PLACES, Decimal.ROUND_HALF_UP).toFixed(DISPLAY_DECIMAL_PLACES);
}

export const ZERO = new Decimal(0);

export { Decimal };
