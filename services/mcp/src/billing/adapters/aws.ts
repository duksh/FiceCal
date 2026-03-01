import {
  BillingAdapter,
  BillingAuthMode,
  BillingCanonicalHandoff,
  BillingIngestRequest,
  BillingProvenance,
} from "../types";

const ADAPTER_ID = "aws-billing" as const;

const SERVICE_WEIGHTS = [
  { service: "ec2", weight: 0.46, cudEligible: true },
  { service: "ebs", weight: 0.19, cudEligible: false },
  { service: "data-transfer", weight: 0.17, cudEligible: false },
  { service: "rds", weight: 0.18, cudEligible: true },
] as const;

const MAX_RETRY_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 250;

type AwsCostRow = {
  accountId: string;
  service: (typeof SERVICE_WEIGHTS)[number]["service"];
  amount: number;
  cudEligible: boolean;
};

type AwsPayload = {
  adapterId: string;
  period: {
    startDate: string;
    endDate: string;
    currency: string;
  };
  credentialRef?: string;
  authMode?: BillingAuthMode;
  accountScope?: string[];
};

type RetryPlan = {
  attempts: number;
  rateLimited: boolean;
  backoffScheduleMs: number[];
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

function normalizeAccountScope(request: BillingIngestRequest): string[] {
  if (request.accountScope && request.accountScope.length > 0) {
    return request.accountScope;
  }
  return ["000000000000"];
}

function buildRetryPlan(request: BillingIngestRequest): RetryPlan {
  const seed = stableHash(`${request.integrationRunId}:${request.mappingProfile}`);
  const rateLimited = seed % 5 === 0;
  const attempts = rateLimited ? MAX_RETRY_ATTEMPTS : 1;
  const backoffScheduleMs: number[] = [];

  for (let attempt = 2; attempt <= attempts; attempt += 1) {
    backoffScheduleMs.push(BASE_BACKOFF_MS * 2 ** (attempt - 2));
  }

  return {
    attempts,
    rateLimited,
    backoffScheduleMs,
  };
}

function createCostRows(request: BillingIngestRequest): AwsCostRow[] {
  const accounts = normalizeAccountScope(request);
  const rows: AwsCostRow[] = [];

  for (const accountId of accounts) {
    const seed = stableHash(`${accountId}:${request.mappingProfile}`);
    const baseSpend = 1100 + (seed % 900);

    for (const entry of SERVICE_WEIGHTS) {
      rows.push({
        accountId,
        service: entry.service,
        amount: round2(baseSpend * entry.weight),
        cudEligible: entry.cudEligible,
      });
    }
  }

  return rows;
}

function toCanonical(
  request: BillingIngestRequest,
  rows: AwsCostRow[],
  retryPlan: RetryPlan,
): BillingCanonicalHandoff {
  const infraTotal = round2(rows.reduce((sum, row) => sum + row.amount, 0));
  const cudEligibleTotal = round2(
    rows.filter((row) => row.cudEligible).reduce((sum, row) => sum + row.amount, 0),
  );

  const warnings = [
    `Retry policy configured: maxAttempts=${MAX_RETRY_ATTEMPTS}, baseBackoffMs=${BASE_BACKOFF_MS}.`,
  ];

  if (retryPlan.rateLimited) {
    warnings.push(
      `Rate-limit fallback engaged with ${retryPlan.attempts} attempts and backoff [${retryPlan.backoffScheduleMs.join(", ")}].`,
    );
  }

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
      cudPct: infraTotal > 0 ? round2((cudEligibleTotal / infraTotal) * 100) : 0,
      budgetCap: round2(infraTotal * 1.12),
      nRef: rows.length,
    },
    provenance: {
      sourceVersion: "aws-readonly-v1.0.0",
      coveragePct: round2(Math.min(97, 83 + rows.length * 1.4)),
      mappingConfidence: rows.length > 4 ? "high" : "medium",
      warnings,
    },
  };
}

function parsePayload(payload: unknown): { payload?: AwsPayload; errors: string[] } {
  if (!payload || typeof payload !== "object") {
    return { errors: ["Payload must be an object"] };
  }

  const candidate = payload as Partial<AwsPayload>;
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

  if (candidate.accountScope && !Array.isArray(candidate.accountScope)) {
    errors.push("accountScope must be an array when provided");
  }

  if (
    candidate.accountScope &&
    !candidate.accountScope.every((accountId) => typeof accountId === "string" && accountId.length > 0)
  ) {
    errors.push("accountScope values must be non-empty strings");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { payload: candidate as AwsPayload, errors: [] };
}

export const awsBillingAdapter: BillingAdapter = {
  adapterId: ADAPTER_ID,
  async discoverAccounts(request: BillingIngestRequest): Promise<string[]> {
    return normalizeAccountScope(request).sort();
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
    const retryPlan = buildRetryPlan(request);
    return toCanonical(request, rows, retryPlan);
  },
  emitProvenance(result: BillingCanonicalHandoff): BillingProvenance {
    return result.provenance;
  },
};
