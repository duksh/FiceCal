export type BillingAdapterId =
  | "openops-billing"
  | "aws-billing"
  | "azure-billing"
  | "gcp-billing"
  | "oci-billing"
  | "ibm-billing"
  | "alibaba-billing"
  | "huawei-billing";

export type MappingConfidence = "low" | "medium" | "high";

export type BillingScope = {
  startDate: string;
  endDate: string;
  currency: string;
};

export type BillingIngestRequest = BillingScope & {
  integrationRunId: string;
  mappingProfile: string;
  workspaceScope?: string[];
  accountScope?: string[];
  subscriptionScope?: string[];
  billingAccountScope?: string[];
  tenantScope?: string[];
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
