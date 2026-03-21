// ─── billing.estimate.actual — MCP tool ───────────────────────────────────────
//
// Retrieves a normalised billing period summary from a registered billing
// adapter (deterministic mode: fixture data; live mode: 501 Not Implemented).
//
// Tool id: billing.estimate.actual
// Namespace: billing
// Stability: beta

import type { McpToolDescriptor, McpToolResult } from "../types.js";

// ─── Input / Output ───────────────────────────────────────────────────────────

export interface BillingEstimateActualInput {
  provider: string;           // "aws" | "gcp" | "azure" | "openai"
  periodStart: string;        // ISO date "YYYY-MM-DD"
  periodEnd: string;          // ISO date "YYYY-MM-DD"
  currency?: string;          // ISO 4217 — defaults to provider's native currency
}

export interface BillingLineItemOutput {
  service: string;
  sku?: string;
  usageType?: string;
  cost: number;
  currency: string;
  startDate: string;
  endDate: string;
}

export interface BillingEstimateActualOutput {
  provider: string;
  accountId?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  totalCost: number;
  currency: string;
  lineItemCount: number;
  lineItems: BillingLineItemOutput[];
  ingestMode: "deterministic" | "live";
  fixtureVersion?: string;
}

// ─── Registry interface ───────────────────────────────────────────────────────
//
// The tool accesses billing data through an injectable adapter registry.
// In production, this is supplied by the PluginHost's BillingRegistry.
// In tests, a mock is injected.

export interface BillingAdapterRegistry {
  getAdapter(provider: string): { load(start: string, end: string): Promise<unknown> } | undefined;
  getFixture(provider: string): { version: string } | undefined;
}

// ─── Module-level registry (set by transport layer at startup) ─────────────────

let _billingRegistry: BillingAdapterRegistry | null = null;

export function setBillingRegistry(registry: BillingAdapterRegistry): void {
  _billingRegistry = registry;
}

export function _resetBillingRegistry(): void {
  _billingRegistry = null;
}

// ─── Tool descriptor ──────────────────────────────────────────────────────────

export const billingEstimateActualTool: McpToolDescriptor<BillingEstimateActualInput, BillingEstimateActualOutput> = {
  id: "billing.estimate.actual",
  name: "Billing Estimate Actual",
  description:
    "Retrieve actual cloud billing data for a given provider and time period. " +
    "Returns normalised line items and totals. " +
    "In deterministic mode (Phase 6), returns fixture data. " +
    "Live provider SDK calls are available in Phase 7+.",
  namespace: "billing",
  stability: "beta",
  inputSchema: {
    type: "object",
    properties: {
      provider: { type: "string", description: "Cloud provider: aws | gcp | azure | openai" },
      periodStart: { type: "string", description: "Billing period start date (YYYY-MM-DD)" },
      periodEnd: { type: "string", description: "Billing period end date (YYYY-MM-DD)" },
      currency: { type: "string", description: "ISO 4217 currency code (optional, defaults to provider native)" },
    },
    required: ["provider", "periodStart", "periodEnd"],
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

    const raw = await adapter.load(input.periodStart, input.periodEnd);
    // Type-narrowing the raw unknown result
    const data = raw as {
      provider: string;
      accountId?: string;
      billingPeriodStart: string;
      billingPeriodEnd: string;
      totalCost: number;
      currency: string;
      lineItems: Array<{
        service: string;
        sku?: string;
        usageType?: string;
        cost: number;
        currency: string;
        startDate: string;
        endDate: string;
      }>;
    };

    const fixtureVersion = _billingRegistry.getFixture(input.provider)?.version;

    const output: BillingEstimateActualOutput = {
      provider: data.provider,
      ...(data.accountId !== undefined ? { accountId: data.accountId } : {}),
      billingPeriodStart: data.billingPeriodStart,
      billingPeriodEnd: data.billingPeriodEnd,
      totalCost: Number(data.totalCost.toFixed(2)),
      currency: input.currency ?? data.currency,
      lineItemCount: data.lineItems.length,
      lineItems: data.lineItems.map((li) => ({
        service: li.service,
        ...(li.sku !== undefined ? { sku: li.sku } : {}),
        ...(li.usageType !== undefined ? { usageType: li.usageType } : {}),
        cost: Number(li.cost.toFixed(2)),
        currency: li.currency,
        startDate: li.startDate,
        endDate: li.endDate,
      })),
      ingestMode: "deterministic",
      ...(fixtureVersion !== undefined ? { fixtureVersion } : {}),
    };

    const result: McpToolResult<BillingEstimateActualOutput> = {
      output,
      toolId: billingEstimateActualTool.id,
      executedAt: new Date().toISOString(),
      requestId: context.requestId,
      warnings: fixtureVersion
        ? [`Billing data is deterministic (fixture v${fixtureVersion}). Live data available in Phase 7+.`]
        : [],
      appliedIds: ["billing.adapter.deterministic"],
    };

    return result;
  },
};
