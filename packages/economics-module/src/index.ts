// ─── Core types ───────────────────────────────────────────────────────────────
export type {
  EconomicsPlugin,
  EconomicsDomainManifest,
} from "./types.js";
export { EconomicsRegistryError } from "./types.js";

// ─── Registry ─────────────────────────────────────────────────────────────────
export { EconomicsRegistry } from "./registry.js";

// ─── Built-in plugins ─────────────────────────────────────────────────────────
export {
  aiTokenPlugin,
  reliabilityErrorBudgetPlugin,
  reliabilityDowntimeCostPlugin,
  reliabilityRoiPlugin,
  techNormalizationPlugin,
} from "./built-in-plugins.js";
export type {
  ErrorBudgetPluginInput,
  TechNormalizationPluginInput,
} from "./built-in-plugins.js";

// ─── Default registry factory ─────────────────────────────────────────────────
import { EconomicsRegistry } from "./registry.js";
import {
  aiTokenPlugin,
  reliabilityErrorBudgetPlugin,
  reliabilityDowntimeCostPlugin,
  reliabilityRoiPlugin,
  techNormalizationPlugin,
} from "./built-in-plugins.js";

/**
 * Create a pre-populated EconomicsRegistry with all built-in plugins registered.
 *
 * Returns a new registry instance each call — callers own their instance.
 * Additional plugins can be registered after creation without affecting other
 * registries.
 *
 * Built-in domains:
 *   - ai.token                  (@ficecal/ai-token-economics)
 *   - reliability.error-budget  (@ficecal/sla-slo-sli-economics)
 *   - reliability.downtime-cost (@ficecal/sla-slo-sli-economics)
 *   - reliability.roi           (@ficecal/sla-slo-sli-economics)
 *   - tech.normalization        (@ficecal/multi-tech-normalization)
 */
export function createDefaultRegistry(): EconomicsRegistry {
  const registry = new EconomicsRegistry();
  registry.register(aiTokenPlugin);
  registry.register(reliabilityErrorBudgetPlugin);
  registry.register(reliabilityDowntimeCostPlugin);
  registry.register(reliabilityRoiPlugin);
  registry.register(techNormalizationPlugin);
  return registry;
}

// ─── Sub-module re-exports (for convenience; avoid double-import) ─────────────

// core-economics
export type { Period, Currency } from "@ficecal/core-economics";
export { Decimal, toOutputString, normalizePeriod } from "@ficecal/core-economics";

// ai-token-economics
export type {
  AiPricingUnit,
  AiCostInput,
  AiCostResult,
  TokenCostInput,
  ImageCostInput,
  RequestCostInput,
  TimeCostInput,
} from "@ficecal/ai-token-economics";
export { computeAiCost } from "@ficecal/ai-token-economics";

// sla-slo-sli-economics
export type {
  SloTarget,
  ErrorBudgetResult,
  DowntimeCostInput,
  DowntimeCostResult,
  ReliabilityRoiInput,
  ReliabilityRoiResult,
} from "@ficecal/sla-slo-sli-economics";
export {
  STANDARD_SLO_TIERS,
  computeErrorBudget,
  computeDowntimeCost,
  computeReliabilityRoi,
} from "@ficecal/sla-slo-sli-economics";

// multi-tech-normalization
export type {
  TechCategory,
  TechCostInput,
  NormalizedTechCost,
  TechNormalizationResult,
} from "@ficecal/multi-tech-normalization";
export { normalizeTechCosts, CATEGORY_BASIS_UNIT } from "@ficecal/multi-tech-normalization";
