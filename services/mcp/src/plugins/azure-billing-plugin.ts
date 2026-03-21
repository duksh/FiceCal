// ─── Azure Billing Plugin ──────────────────────────────────────────────────────
//
// Phase 6 billing plugin for Microsoft Azure.
// Ingest mode: deterministic (fixture data from packages/schemas/fixtures/).
// Live mode (Azure Cost Management REST API): deferred to Phase 7+.

import type { FicecalPlugin, BillingPeriodSummary } from "@ficecal/plugin-api";
import azureFixture from "../../../../packages/schemas/fixtures/azure-billing-fixture.json" assert { type: "json" };

const data = azureFixture.data as BillingPeriodSummary;

export const azureBillingPlugin: FicecalPlugin = {
  id: "@ficecal/billing-azure",
  name: "Azure Billing Adapter",
  version: "1.0.0",
  description:
    "Deterministic Azure billing adapter for Phase 6. " +
    "Returns Cost Management fixture data. Live SDK integration deferred to Phase 7+.",
  contributions: {
    billingFixtures: [
      {
        provider: "azure",
        version: azureFixture.version,
        rawFormat: "azure-cost-management",
        data,
      },
    ],
    billingAdapters: [
      {
        provider: "azure",
        ingestMode: "deterministic",
        async load(_periodStart: string, _periodEnd: string): Promise<BillingPeriodSummary> {
          return data;
        },
      },
    ],
  },
};
