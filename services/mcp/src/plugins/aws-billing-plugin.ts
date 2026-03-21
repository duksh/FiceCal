// ─── AWS Billing Plugin ────────────────────────────────────────────────────────
//
// Phase 6 billing plugin for AWS.
// Ingest mode: deterministic (fixture data from packages/schemas/fixtures/).
// Live mode (AWS Cost Explorer SDK): deferred to Phase 7+.

import type { FicecalPlugin, BillingPeriodSummary } from "@ficecal/plugin-api";
import awsFixture from "../../../../packages/schemas/fixtures/aws-billing-fixture.json" assert { type: "json" };

const data = awsFixture.data as BillingPeriodSummary;

export const awsBillingPlugin: FicecalPlugin = {
  id: "@ficecal/billing-aws",
  name: "AWS Billing Adapter",
  version: "1.0.0",
  description:
    "Deterministic AWS billing adapter for Phase 6. " +
    "Returns Cost Explorer fixture data. Live SDK integration deferred to Phase 7+.",
  contributions: {
    billingFixtures: [
      {
        provider: "aws",
        version: awsFixture.version,
        rawFormat: "cost-explorer",
        data,
      },
    ],
    billingAdapters: [
      {
        provider: "aws",
        ingestMode: "deterministic",
        async load(_periodStart: string, _periodEnd: string): Promise<BillingPeriodSummary> {
          // Phase 6: return fixture data regardless of requested period.
          // Phase 7: call AWS Cost Explorer SDK with periodStart/periodEnd.
          return data;
        },
      },
    ],
  },
};
