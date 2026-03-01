import {
  BillingAdapter,
  BillingAuthMode,
  BillingCanonicalHandoff,
  BillingIngestRequest,
  BillingProvenance,
} from "../types";

const ADAPTER_ID = "openops-billing" as const;

const SERVICE_WEIGHTS = [
  { service: "compute", weight: 0.44, cudEligible: true },
  { service: "storage", weight: 0.18, cudEligible: false },
  { service: "network", weight: 0.16, cudEligible: false },
  { service: "database", weight: 0.22, cudEligible: true },
] as const;

type OpenopsCostRow = {
  workspaceId: string;
  accountId: string;
  service: (typeof SERVICE_WEIGHTS)[number]["service"];
  amount: number;
  cudEligible: boolean;
};

type OpenopsPayload = {
  adapterId: string;
  period: {
    startDate: string;
    endDate: string;
    currency: string;
  };
  credentialRef?: string;
  authMode?: BillingAuthMode;
  workspaceScope?: string[];
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

function normalizeWorkspaceScope(request: BillingIngestRequest): string[] {
  if (request.workspaceScope && request.workspaceScope.length > 0) {
    return request.workspaceScope;
  }
  return ["workspace-default"];
}

function createCostRows(request: BillingIngestRequest): OpenopsCostRow[] {
  const workspaces = normalizeWorkspaceScope(request);
  const rows: OpenopsCostRow[] = [];

  for (const workspaceId of workspaces) {
    const seed = stableHash(`${workspaceId}:${request.mappingProfile}`);
    const baseSpend = 800 + (seed % 700);
    const accountId = `acct-${workspaceId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "default"}`;

    for (const entry of SERVICE_WEIGHTS) {
      rows.push({
        workspaceId,
        accountId,
        service: entry.service,
        amount: round2(baseSpend * entry.weight),
        cudEligible: entry.cudEligible,
      });
    }
  }

  return rows;
}

function toCanonical(request: BillingIngestRequest, rows: OpenopsCostRow[]): BillingCanonicalHandoff {
  const infraTotal = round2(rows.reduce((sum, row) => sum + row.amount, 0));
  const cudEligibleTotal = round2(
    rows.filter((row) => row.cudEligible).reduce((sum, row) => sum + row.amount, 0),
  );

  const warnings: string[] = [];
  if (!request.credentialRef) {
    warnings.push("credentialRef not provided; using local development source profile.");
  }

  const mappingConfidence = request.workspaceScope && request.workspaceScope.length > 1 ? "high" : "medium";

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
      cudPct: infraTotal > 0 ? round2((cudEligibleTotal / infraTotal) * 100) : 0,
      budgetCap: round2(infraTotal * 1.15),
      nRef: rows.length,
    },
    provenance: {
      sourceVersion: "openops-readonly-v1.0.0",
      coveragePct: round2(Math.min(98, 82 + rows.length * 1.5)),
      mappingConfidence,
      warnings,
    },
  };
}

function parsePayload(payload: unknown): { payload?: OpenopsPayload; errors: string[] } {
  if (!payload || typeof payload !== "object") {
    return { errors: ["Payload must be an object"] };
  }

  const candidate = payload as Partial<OpenopsPayload>;
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

  if (candidate.workspaceScope && !Array.isArray(candidate.workspaceScope)) {
    errors.push("workspaceScope must be an array when provided");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { payload: candidate as OpenopsPayload, errors: [] };
}

export const openopsBillingAdapter: BillingAdapter = {
  adapterId: ADAPTER_ID,
  async discoverAccounts(request: BillingIngestRequest): Promise<string[]> {
    const rows = createCostRows(request);
    return Array.from(new Set(rows.map((row) => row.accountId))).sort();
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
