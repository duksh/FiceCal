export const BUILTIN_BILLING_ADAPTER_IDS = [
  "openops-billing",
  "aws-billing",
  "azure-billing",
  "gcp-billing",
  "oci-billing",
  "ibm-billing",
  "alibaba-billing",
  "huawei-billing",
] as const;

export type BuiltinBillingAdapterId = (typeof BUILTIN_BILLING_ADAPTER_IDS)[number];
export type BillingAdapterId = `${string}-billing`;

export type MappingConfidence = "low" | "medium" | "high";

export type BillingAuthMode = "read-only";

export type BillingIngestMode = "deterministic" | "live";

export type BillingScope = {
  startDate: string;
  endDate: string;
  currency: string;
};

export type BillingProviderScope = Record<string, unknown>;

export type BillingIngestRequest = BillingScope & {
  integrationRunId: string;
  mappingProfile: string;
  ingestMode?: BillingIngestMode;
  credentialRef?: string;
  authMode?: BillingAuthMode;
  workspaceScope?: string[];
  accountScope?: string[];
  subscriptionScope?: string[];
  billingAccountScope?: string[];
  tenantScope?: string[];
  providerScope?: BillingProviderScope;
};

export type CanonicalBillingSnapshot = {
  infraTotal: number;
  cudPct: number;
  budgetCap: number;
  nRef: number;
};

export type BillingProvenance = {
  sourceVersion: string;
  coveragePct: number;
  mappingConfidence: MappingConfidence;
  warnings: string[];
};

export type BillingCanonicalHandoff = {
  integrationRunId: string;
  providerAdapterId: BillingAdapterId;
  scope: BillingScope;
  canonical: CanonicalBillingSnapshot;
  provenance: BillingProvenance;
};

export type BillingPeriodSnapshot = {
  startDate: string;
  endDate: string;
  currency: string;
  rawRecordCount: number;
};

export interface BillingAdapter {
  adapterId: BillingAdapterId;
  discoverAccounts(request: BillingIngestRequest): Promise<string[]>;
  fetchBillingPeriod(request: BillingIngestRequest): Promise<BillingPeriodSnapshot>;
  validateBillingPayload(payload: unknown): { valid: boolean; errors: string[] };
  mapToCanonical(request: BillingIngestRequest, payload: unknown): BillingCanonicalHandoff;
  emitProvenance(result: BillingCanonicalHandoff): BillingProvenance;
}
