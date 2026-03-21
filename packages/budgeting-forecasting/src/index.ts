export type {
  BudgetLineItem,
  BudgetVarianceItem,
  BudgetVarianceResult,
  SpendDataPoint,
  TrendMethod,
  TrendExtrapolationInput,
  ForecastDataPoint,
  TrendExtrapolationResult,
  BudgetProjectionInput,
  ProjectedPeriod,
  BudgetProjectionResult,
} from "./types.js";

export {
  computeBudgetVariance,
  extrapolateTrend,
  projectBudget,
} from "./engine.js";
