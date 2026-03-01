import { awsBillingAdapter } from "./adapters/aws";
import { azureBillingAdapter } from "./adapters/azure";
import { gcpBillingAdapter } from "./adapters/gcp";
import { openopsBillingAdapter } from "./adapters/openops";
import { BillingAdapter, BillingAdapterId } from "./types";

const DEFAULT_BILLING_ADAPTER_ID: BillingAdapterId = "openops-billing";

function createPlaceholderAdapter(adapterId: BillingAdapterId): BillingAdapter {
  const placeholderVersion = `${adapterId.replace("-billing", "")}-placeholder-v0.1.0`;

  return {
    adapterId,
    async discoverAccounts() {
      return [];
    },
    async fetchBillingPeriod(request) {
      return {
        startDate: request.startDate,
        endDate: request.endDate,
        currency: request.currency,
        rawRecordCount: 0,
      };
    },
    validateBillingPayload() {
      return { valid: true, errors: [] };
    },
    mapToCanonical(request) {
      return {
        integrationRunId: request.integrationRunId,
        providerAdapterId: adapterId,
        scope: {
          startDate: request.startDate,
          endDate: request.endDate,
          currency: request.currency,
        },
        canonical: { infraTotal: 0, cudPct: 0, budgetCap: 0, nRef: 0 },
        provenance: {
          sourceVersion: placeholderVersion,
          coveragePct: 0,
          mappingConfidence: "low",
          warnings: ["Placeholder adapter - not in Phase 1 scope."],
        },
      };
    },
    emitProvenance(result) {
      return result.provenance;
    },
  };
}

const adapters: Record<BillingAdapterId, BillingAdapter> = {
  "openops-billing": openopsBillingAdapter,
  "aws-billing": awsBillingAdapter,
  "azure-billing": azureBillingAdapter,
  "gcp-billing": gcpBillingAdapter,
  "oci-billing": createPlaceholderAdapter("oci-billing"),
  "ibm-billing": createPlaceholderAdapter("ibm-billing"),
  "alibaba-billing": createPlaceholderAdapter("alibaba-billing"),
  "huawei-billing": createPlaceholderAdapter("huawei-billing"),
};

export type BillingAdapterResolution = {
  requestedAdapterId: string;
  resolvedAdapterId: BillingAdapterId;
  usedFallback: boolean;
  adapter: BillingAdapter;
};

export function isBillingAdapterId(value: string): value is BillingAdapterId {
  return value in adapters;
}

export function resolveBillingAdapter(
  adapterId: BillingAdapterId | string,
  fallbackAdapterId: BillingAdapterId = DEFAULT_BILLING_ADAPTER_ID,
): BillingAdapterResolution {
  if (isBillingAdapterId(adapterId)) {
    return {
      requestedAdapterId: adapterId,
      resolvedAdapterId: adapterId,
      usedFallback: false,
      adapter: adapters[adapterId],
    };
  }

  return {
    requestedAdapterId: adapterId,
    resolvedAdapterId: fallbackAdapterId,
    usedFallback: true,
    adapter: adapters[fallbackAdapterId],
  };
}

export function getBillingAdapter(adapterId: BillingAdapterId | string): BillingAdapter {
  return resolveBillingAdapter(adapterId).adapter;
}

export function listBillingAdapterIds(): BillingAdapterId[] {
  return Object.keys(adapters) as BillingAdapterId[];
}
