// Public API
export { computeEconomics } from "./engine.js";
export type { EngineOptions } from "./engine.js";
export type { EconomicsInput, EconomicsOutput } from "./types.js";
export { EconomicsInputSchema, EconomicsOutputSchema } from "./types.js";
export type { Period } from "./types.js";
export { normalizePeriod, periodsPerYear, PERIODS, MONTHS_IN_PERIOD } from "./period.js";
export { FORMULA_REGISTRY, getFormula, requireFormula } from "./formula-registry.js";
export type { FormulaEntry } from "./formula-registry.js";
export type { ForexRateProvider, ForexRates } from "./forex/types.js";
export { StaticForexAdapter } from "./forex/static-adapter.js";
export { EcbForexAdapter } from "./forex/ecb-adapter.js";
export {
  Decimal,
  toOutputString,
  toDisplayString,
  OUTPUT_DECIMAL_PLACES,
  DISPLAY_DECIMAL_PLACES,
} from "./precision.js";
