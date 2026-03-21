// ─── billing.compare.period — MCP tool ────────────────────────────────────────
//
// Compare actual billing between two time periods for the same provider.
// Returns delta cost, percentage change, and per-service breakdowns.
//
// Tool id: billing.compare.period
// Namespace: billing
// Stability: beta

import type { McpToolDescriptor, McpToolResult } from "../types.js";
import type { BillingAdapterRegistry } from "./billing-estimate-actual.js";
import { _resetBillingRegistry } from "./billing-estimate-actual.js";

export { _resetBillingRegistry };

// ─── Input / Output ───────────────────────────────────────────────────────────

export interface BillingComparePeriodInput {
  provider: string;
  baselineStart: string;   // ISO date
  baselineEnd: string;     // ISO date
  comparisonStart: string; // ISO date
  comparisonEnd: string;   // ISO date
}

export interface ServiceDelta {
  service: string;
  baselineCost: number;
  comparisonCost: number;
  deltaCost: number;
  deltaPercent: number | null; // null if baselineCost was 0
}

export interface BillingComparePeriodOutput {
  provider: string;
  baselinePeriod: { start: string; end: string; totalCost: number };
  comparisonPeriod: { start: string; end: string; totalCost: number };
  currency: string;
  deltaCost: number;
  deltaPercent: number | null;
  trend: "increase" | "decrease" | "flat";
  serviceDeltas: ServiceDelta[];
  warnings: string[];
}

// ─── Module-level registry (shared with billing-estimate-actual) ───────────────

let _billingRegistry: BillingAdapterRegistry | null = null;

export function setBillingRegistry(registry: BillingAdapterRegistry): void {
  _billingRegistry = registry;
}

// ─── Tool descriptor ──────────────────────────────────────────────────────────

export const billingComparePeriodTool: McpToolDescriptor<BillingComparePeriodInput, BillingComparePeriodOutput> = {
  id: "billing.compare.period",
  name: "Billing Compare Period",
  description:
    "Compare actual cloud billing costs between two time periods for the same provider. " +
    "Returns total delta, percentage change, trend, and per-service cost breakdowns.",
  namespace: "billing",
  stability: "beta",
  inputSchema: {
    type: "object",
    properties: {
      provider: { type: "string", description: "Cloud provider: aws | gcp | azure | openai" },
      baselineStart: { type: "string", description: "Baseline period start (YYYY-MM-DD)" },
      baselineEnd: { type: "string", description: "Baseline period end (YYYY-MM-DD)" },
      comparisonStart: { type: "string", description: "Comparison period start (YYYY-MM-DD)" },
      comparisonEnd: { type: "string", description: "Comparison period end (YYYY-MM-DD)" },
    },
    required: ["provider", "baselineStart", "baselineEnd", "comparisonStart", "comparisonEnd"],
  },

  handler: async (envelope) => {
    const { input, context } = envelope;

    if (_billingRegistry === null) {
      throw new Error("BillingAdapterRegistry not initialised. Call setBillingRegistry() at startup.");
    }

    const adapter = _billingRegistry.getAdapter(input.provider);
    if (!adapter) {
      throw Object.assign(
        new Error(`No billing adapter registered for provider "${input.provider}".`),
        { code: "PROVIDER_NOT_FOUND" },
      );
    }

    const [baselineRaw, comparisonRaw] = await Promise.all([
      adapter.load(input.baselineStart, input.baselineEnd),
      adapter.load(input.comparisonStart, input.comparisonEnd),
    ]);

    type RawData = {
      provider: string;
      billingPeriodStart: string;
      billingPeriodEnd: string;
      totalCost: number;
      currency: string;
      lineItems: Array<{ service: string; cost: number }>;
    };

    const baseline = baselineRaw as RawData;
    const comparison = comparisonRaw as RawData;

    // Build per-service maps
    const baselineByService = new Map<string, number>();
    for (const li of baseline.lineItems) {
      baselineByService.set(li.service, (baselineByService.get(li.service) ?? 0) + li.cost);
    }
    const comparisonByService = new Map<string, number>();
    for (const li of comparison.lineItems) {
      comparisonByService.set(li.service, (comparisonByService.get(li.service) ?? 0) + li.cost);
    }

    const allServices = new Set([...baselineByService.keys(), ...comparisonByService.keys()]);
    const serviceDeltas: ServiceDelta[] = [...allServices].map((service) => {
      const b = baselineByService.get(service) ?? 0;
      const c = comparisonByService.get(service) ?? 0;
      return {
        service,
        baselineCost: Number(b.toFixed(2)),
        comparisonCost: Number(c.toFixed(2)),
        deltaCost: Number((c - b).toFixed(2)),
        deltaPercent: b !== 0 ? Number((((c - b) / b) * 100).toFixed(1)) : null,
      };
    });

    const totalBaseline = Number(baseline.totalCost.toFixed(2));
    const totalComparison = Number(comparison.totalCost.toFixed(2));
    const deltaCost = Number((totalComparison - totalBaseline).toFixed(2));
    const deltaPercent =
      totalBaseline !== 0 ? Number((((totalComparison - totalBaseline) / totalBaseline) * 100).toFixed(1)) : null;

    const trend: "increase" | "decrease" | "flat" =
      deltaCost > 0 ? "increase" : deltaCost < 0 ? "decrease" : "flat";

    const fixtureVersion = _billingRegistry.getFixture(input.provider)?.version;
    const warnings: string[] = fixtureVersion
      ? [`Billing data is deterministic (fixture v${fixtureVersion}). Live data available in Phase 7+.`]
      : [];

    const output: BillingComparePeriodOutput = {
      provider: input.provider,
      baselinePeriod: { start: baseline.billingPeriodStart, end: baseline.billingPeriodEnd, totalCost: totalBaseline },
      comparisonPeriod: { start: comparison.billingPeriodStart, end: comparison.billingPeriodEnd, totalCost: totalComparison },
      currency: baseline.currency,
      deltaCost,
      deltaPercent,
      trend,
      serviceDeltas,
      warnings,
    };

    return {
      output,
      toolId: billingComparePeriodTool.id,
      executedAt: new Date().toISOString(),
      requestId: context.requestId,
      warnings,
      appliedIds: ["billing.compare.deterministic"],
    };
  },
};
