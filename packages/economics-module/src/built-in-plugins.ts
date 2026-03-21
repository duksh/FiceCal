/**
 * Built-in economics plugins — one per domain module.
 *
 * Each plugin wraps an engine from a sub-package into the EconomicsPlugin
 * interface so it can be auto-registered in the default EconomicsRegistry
 * instance (see createDefaultRegistry).
 *
 * Extension pattern for future modules (cloud-economics, licensing, etc.):
 *   1. Create @ficecal/<domain>-economics package with its own engine
 *   2. Add an EconomicsPlugin wrapper here (or in the package itself)
 *   3. Register it in createDefaultRegistry()
 */

import { computeAiCost } from "@ficecal/ai-token-economics";
import type { AiCostInput, AiCostResult } from "@ficecal/ai-token-economics";

import {
  computeErrorBudget,
  computeDowntimeCost,
  computeReliabilityRoi,
} from "@ficecal/sla-slo-sli-economics";
import type {
  SloTarget,
  DowntimeCostInput,
  ReliabilityRoiInput,
} from "@ficecal/sla-slo-sli-economics";

import { normalizeTechCosts } from "@ficecal/multi-tech-normalization";
import type {
  TechCostInput,
  TechNormalizationResult,
} from "@ficecal/multi-tech-normalization";

import type { Period } from "@ficecal/core-economics";
import type { EconomicsPlugin } from "./types.js";

// ─── ai.token ─────────────────────────────────────────────────────────────────

export const aiTokenPlugin: EconomicsPlugin<AiCostInput, AiCostResult> = {
  domain: "ai.token",
  version: "1.0.0",
  description: "AI inference cost calculation: token, image, request, and time-based pricing units",
  compute: computeAiCost,
};

// ─── reliability.error-budget ─────────────────────────────────────────────────

export interface ErrorBudgetPluginInput {
  sloTarget: SloTarget;
  period: Period;
  options?: { actualUptimePct?: string };
}

export const reliabilityErrorBudgetPlugin: EconomicsPlugin<
  ErrorBudgetPluginInput,
  ReturnType<typeof computeErrorBudget>
> = {
  domain: "reliability.error-budget",
  version: "1.0.0",
  description: "SLO error budget: allowable downtime per period, budget consumed/remaining %",
  compute: ({ sloTarget, period, options }) =>
    computeErrorBudget(sloTarget, period, options),
};

// ─── reliability.downtime-cost ────────────────────────────────────────────────

export const reliabilityDowntimeCostPlugin: EconomicsPlugin<
  DowntimeCostInput,
  ReturnType<typeof computeDowntimeCost>
> = {
  domain: "reliability.downtime-cost",
  version: "1.0.0",
  description: "Downtime cost: revenue impact plus engineering response cost during outages",
  compute: computeDowntimeCost,
};

// ─── reliability.roi ─────────────────────────────────────────────────────────

export const reliabilityRoiPlugin: EconomicsPlugin<
  ReliabilityRoiInput,
  ReturnType<typeof computeReliabilityRoi>
> = {
  domain: "reliability.roi",
  version: "1.0.0",
  description: "Reliability ROI: minutes saved, revenue protected, ROI multiple, payback periods",
  compute: computeReliabilityRoi,
};

// ─── tech.normalization ───────────────────────────────────────────────────────

export interface TechNormalizationPluginInput {
  items: TechCostInput[];
  currency: string;
}

export const techNormalizationPlugin: EconomicsPlugin<
  TechNormalizationPluginInput,
  TechNormalizationResult
> = {
  domain: "tech.normalization",
  version: "1.0.0",
  description: "Multi-technology cost normalization: per-unit basis, efficiency index, portfolio roll-up",
  compute: ({ items, currency }) => normalizeTechCosts(items, currency),
};
