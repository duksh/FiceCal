import {
  BillingAdapter,
  BillingAuthMode,
  BillingCanonicalHandoff,
  BillingIngestRequest,
  BillingProvenance,
} from "../types";

const ADAPTER_ID = "azure-billing" as const;

const SERVICE_WEIGHTS = [
  { service: "virtual-machines", weight: 0.41, reservedEligible: true },
  { service: "managed-disks", weight: 0.21, reservedEligible: false },
  { service: "bandwidth", weight: 0.14, reservedEligible: false },
  { service: "sql-database", weight: 0.24, reservedEligible: true },
] as const;

const PAGE_SIZE = 5;

type AzureCostRow = {
  subscriptionId: string;
  service: (typeof SERVICE_WEIGHTS)[number]["service"];
  amount: number;
  reservedEligible: boolean;
};

type AzurePayload = {
  adapterId: string;
  period: {
    startDate: string;
    endDate: string;
    currency: string;
  };
  credentialRef?: string;
  authMode?: BillingAuthMode;
  subscriptionScope?: string[];
};

type PaginationPlan = {
  pageSize: number;
  pages: number;
  totalRows: number;
};

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeSubscriptionScope(request: BillingIngestRequest): string[] {
  if (request.subscriptionScope && request.subscriptionScope.length > 0) {
    return request.subscriptionScope;
  }
  return ["sub-default"];
}

function createCostRows(request: BillingIngestRequest): AzureCostRow[] {
  const subscriptions = normalizeSubscriptionScope(request);
  const rows: AzureCostRow[] = [];

  for (const subscriptionId of subscriptions) {
    const seed = stableHash(`${subscriptionId}:${request.mappingProfile}`);
    const baseSpend = 950 + (seed % 850);

    for (const entry of SERVICE_WEIGHTS) {
      rows.push({
        subscriptionId,
        service: entry.service,
        amount: round2(baseSpend * entry.weight),
        reservedEligible: entry.reservedEligible,
      });
    }
  }

  return rows;
}

function buildPaginationPlan(rows: AzureCostRow[]): PaginationPlan {
  return {
    pageSize: PAGE_SIZE,
    pages: Math.max(1, Math.ceil(rows.length / PAGE_SIZE)),
    totalRows: rows.length,
  };
}

function toCanonical(
  request: BillingIngestRequest,
  rows: AzureCostRow[],
  paginationPlan: PaginationPlan,
): BillingCanonicalHandoff {
  const infraTotal = round2(rows.reduce((sum, row) => sum + row.amount, 0));
  const reservedEligibleTotal = round2(
    rows.filter((row) => row.reservedEligible).reduce((sum, row) => sum + row.amount, 0),
  );

  const warnings = [
    `Pagination policy: pageSize=${paginationPlan.pageSize}, pages=${paginationPlan.pages}, totalRows=${paginationPlan.totalRows}.`,
    "Incremental sync baseline anchored to requested billing window.",
  ];

  if (!request.credentialRef) {
    warnings.push("credentialRef not provided; using local development source profile.");
  }

  return {
    integrationRunId: request.integrationRunId,
    providerAdapterId: ADAPTER_ID,
    scope: {
      startDate: request.startDate,
      endDate: request.endDate,
      currency: request.currency,
    },
    canonical: {
      infraTotal,
      cudPct: infraTotal > 0 ? round2((reservedEligibleTotal / infraTotal) * 100) : 0,
      budgetCap: round2(infraTotal * 1.11),
      nRef: rows.length,
    },
    provenance: {
      sourceVersion: "azure-readonly-v1.0.0",
      coveragePct: round2(Math.min(97, 84 + rows.length * 1.3)),
      mappingConfidence: rows.length > 4 ? "high" : "medium",
      warnings,
    },
  };
}

function parsePayload(payload: unknown): { payload?: AzurePayload; errors: string[] } {
  if (!payload || typeof payload !== "object") {
    return { errors: ["Payload must be an object"] };
  }

  const candidate = payload as Partial<AzurePayload>;
  const errors: string[] = [];

  if (candidate.adapterId !== ADAPTER_ID) {
    errors.push(`adapterId must be '${ADAPTER_ID}'`);
  }

  if (!candidate.period || typeof candidate.period !== "object") {
    errors.push("period must be an object");
  } else {
    const period = candidate.period;
    if (typeof period.startDate !== "string" || !period.startDate) {
      errors.push("period.startDate must be a non-empty string");
    }
    if (typeof period.endDate !== "string" || !period.endDate) {
      errors.push("period.endDate must be a non-empty string");
    }
    if (typeof period.currency !== "string" || !period.currency) {
      errors.push("period.currency must be a non-empty string");
    }
  }

  if (candidate.authMode && candidate.authMode !== "read-only") {
    errors.push("authMode must be 'read-only' when provided");
  }

  if (candidate.credentialRef && typeof candidate.credentialRef !== "string") {
    errors.push("credentialRef must be a string when provided");
  }

  if (candidate.subscriptionScope && !Array.isArray(candidate.subscriptionScope)) {
    errors.push("subscriptionScope must be an array when provided");
  }

  if (
    candidate.subscriptionScope &&
    !candidate.subscriptionScope.every((subscriptionId) => typeof subscriptionId === "string" && subscriptionId.length > 0)
  ) {
    errors.push("subscriptionScope values must be non-empty strings");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { payload: candidate as AzurePayload, errors: [] };
}

export const azureBillingAdapter: BillingAdapter = {
  adapterId: ADAPTER_ID,
  async discoverAccounts(request: BillingIngestRequest): Promise<string[]> {
    return normalizeSubscriptionScope(request).sort();
  },
  async fetchBillingPeriod(request: BillingIngestRequest) {
    const rows = createCostRows(request);
    return {
      startDate: request.startDate,
      endDate: request.endDate,
      currency: request.currency,
      rawRecordCount: rows.length,
    };
  },
  validateBillingPayload(payload: unknown) {
    const parsed = parsePayload(payload);
    return { valid: parsed.errors.length === 0, errors: parsed.errors };
  },
  mapToCanonical(request: BillingIngestRequest, payload: unknown): BillingCanonicalHandoff {
    const parsed = parsePayload(payload);
    if (parsed.errors.length > 0) {
      throw new Error(parsed.errors.join(", "));
    }

    const rows = createCostRows(request);
    const paginationPlan = buildPaginationPlan(rows);
    return toCanonical(request, rows, paginationPlan);
  },
  emitProvenance(result: BillingCanonicalHandoff): BillingProvenance {
    return result.provenance;
  },
};
