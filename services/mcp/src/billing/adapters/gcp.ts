import {
  BillingAdapter,
  BillingAuthMode,
  BillingCanonicalHandoff,
  BillingIngestRequest,
  BillingProvenance,
} from "../types";

const ADAPTER_ID = "gcp-billing" as const;

const SERVICE_WEIGHTS = [
  { service: "compute-engine", weight: 0.43, commitmentEligible: true },
  { service: "cloud-storage", weight: 0.14, commitmentEligible: false },
  { service: "cloud-sql", weight: 0.23, commitmentEligible: true },
  { service: "cloud-networking", weight: 0.12, commitmentEligible: false },
  { service: "bigquery", weight: 0.08, commitmentEligible: false },
] as const;

type GcpCostRow = {
  billingAccountId: string;
  service: (typeof SERVICE_WEIGHTS)[number]["service"];
  amount: number;
  commitmentEligible: boolean;
};

type GcpPayload = {
  adapterId: string;
  period: {
    startDate: string;
    endDate: string;
    currency: string;
  };
  credentialRef?: string;
  authMode?: BillingAuthMode;
  billingAccountScope?: string[];
  providerScope?: Record<string, unknown>;
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

function normalizeBillingAccountScope(request: BillingIngestRequest): string[] {
  if (request.billingAccountScope && request.billingAccountScope.length > 0) {
    return request.billingAccountScope;
  }
  return ["000000-000000-000000"];
}

function createCostRows(request: BillingIngestRequest): GcpCostRow[] {
  const billingAccounts = normalizeBillingAccountScope(request);
  const rows: GcpCostRow[] = [];

  for (const billingAccountId of billingAccounts) {
    const seed = stableHash(`${billingAccountId}:${request.mappingProfile}`);
    const baseSpend = 980 + (seed % 1020);

    for (const entry of SERVICE_WEIGHTS) {
      rows.push({
        billingAccountId,
        service: entry.service,
        amount: round2(baseSpend * entry.weight),
        commitmentEligible: entry.commitmentEligible,
      });
    }
  }

  return rows;
}

function toCanonical(request: BillingIngestRequest, rows: GcpCostRow[]): BillingCanonicalHandoff {
  const infraTotal = round2(rows.reduce((sum, row) => sum + row.amount, 0));
  const commitmentEligibleTotal = round2(
    rows.filter((row) => row.commitmentEligible).reduce((sum, row) => sum + row.amount, 0),
  );

  const warnings = [
    "Telemetry baseline: billing.run and billing.mapping.summary emitted.",
    "Recommender-ready provenance baseline enabled.",
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
      cudPct: infraTotal > 0 ? round2((commitmentEligibleTotal / infraTotal) * 100) : 0,
      budgetCap: round2(infraTotal * 1.09),
      nRef: rows.length,
    },
    provenance: {
      sourceVersion: "gcp-readonly-v1.0.0",
      coveragePct: round2(Math.min(98, 85 + rows.length * 1.25)),
      mappingConfidence: rows.length > 5 ? "high" : "medium",
      warnings,
    },
  };
}

function parsePayload(payload: unknown): { payload?: GcpPayload; errors: string[] } {
  if (!payload || typeof payload !== "object") {
    return { errors: ["Payload must be an object"] };
  }

  const candidate = payload as Partial<GcpPayload>;
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

  if (candidate.billingAccountScope && !Array.isArray(candidate.billingAccountScope)) {
    errors.push("billingAccountScope must be an array when provided");
  }

  if (
    candidate.billingAccountScope &&
    !candidate.billingAccountScope.every((billingAccountId) => typeof billingAccountId === "string" && billingAccountId.length > 0)
  ) {
    errors.push("billingAccountScope values must be non-empty strings");
  }

  if (
    candidate.providerScope !== undefined &&
    (!candidate.providerScope || typeof candidate.providerScope !== "object")
  ) {
    errors.push("providerScope must be an object when provided");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { payload: candidate as GcpPayload, errors: [] };
}

export const gcpBillingAdapter: BillingAdapter = {
  adapterId: ADAPTER_ID,
  async discoverAccounts(request: BillingIngestRequest): Promise<string[]> {
    return normalizeBillingAccountScope(request).sort();
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
    return toCanonical(request, rows);
  },
  emitProvenance(result: BillingCanonicalHandoff): BillingProvenance {
    return result.provenance;
  },
};
