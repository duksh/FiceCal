// ─── GCP Billing Plugin ────────────────────────────────────────────────────────
//
// Phase 6 billing plugin for Google Cloud Platform.
// Ingest mode: deterministic (fixture data from packages/schemas/fixtures/).
// Live mode (GCP BigQuery Billing Export): deferred to Phase 7+.

import type { FicecalPlugin, BillingPeriodSummary } from "@ficecal/plugin-api";
import gcpFixture from "../../../../packages/schemas/fixtures/gcp-billing-fixture.json" assert { type: "json" };

const data = gcpFixture.data as BillingPeriodSummary;

export const gcpBillingPlugin: FicecalPlugin = {
  id: "@ficecal/billing-gcp",
  name: "GCP Billing Adapter",
  version: "1.0.0",
  description:
    "Deterministic GCP billing adapter for Phase 6. " +
    "Returns BigQuery Billing Export fixture data. Live SDK integration deferred to Phase 7+.",
  contributions: {
    billingFixtures: [
      {
        provider: "gcp",
        version: gcpFixture.version,
        rawFormat: "gcp-billing-export",
        data,
      },
    ],
    billingAdapters: [
      {
        provider: "gcp",
        ingestMode: "deterministic",
        async load(_periodStart: string, _periodEnd: string): Promise<BillingPeriodSummary> {
          return data;
        },
      },
    ],
  },
};
