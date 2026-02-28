import {
  BillingAdapter,
  BillingCanonicalHandoff,
  BillingIngestRequest,
  BillingProvenance,
} from "../types";

const ADAPTER_ID = "gcp-billing" as const;

function toCanonical(request: BillingIngestRequest): BillingCanonicalHandoff {
  return {
    integrationRunId: request.integrationRunId,
    providerAdapterId: ADAPTER_ID,
    scope: {
      startDate: request.startDate,
      endDate: request.endDate,
      currency: request.currency,
    },
    canonical: {
      infraTotal: 0,
      cudPct: 0,
      budgetCap: 0,
      nRef: 0,
    },
    provenance: {
      sourceVersion: "gcp-stub-v0.1.0",
      coveragePct: 0,
      mappingConfidence: "low",
      warnings: ["Stub adapter: replace with GCP Billing/Recommender APIs + mapping profile implementation."],
    },
  };
}

export const gcpBillingAdapter: BillingAdapter = {
  adapterId: ADAPTER_ID,
  async discoverAccounts(request: BillingIngestRequest): Promise<string[]> {
    return request.billingAccountScope ?? [];
  },
  async fetchBillingPeriod(request: BillingIngestRequest) {
    return {
      startDate: request.startDate,
      endDate: request.endDate,
      currency: request.currency,
      rawRecordCount: 0,
    };
  },
  validateBillingPayload(payload: unknown) {
    if (!payload || typeof payload !== "object") {
      return { valid: false, errors: ["Payload must be an object"] };
    }
    return { valid: true, errors: [] };
  },
  mapToCanonical(request: BillingIngestRequest): BillingCanonicalHandoff {
    return toCanonical(request);
  },
  emitProvenance(result: BillingCanonicalHandoff): BillingProvenance {
    return result.provenance;
  },
};
