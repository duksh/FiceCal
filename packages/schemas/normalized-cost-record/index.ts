/**
 * NormalizedCostRecord — FiceCal v2 Phase 1 companion contract
 *
 * A FOCUS-informed billing record type that provides a canonical, vendor-neutral
 * representation of cloud/AI cost line items for FinOps analysis and economics computation.
 *
 * Schema version: 1.0.0
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const NORMALIZED_COST_RECORD_SCHEMA_VERSION = "1.0.0";

// ---------------------------------------------------------------------------
// Enums (string union types)
// ---------------------------------------------------------------------------

/**
 * The nature of the cost amount.
 * - "actual"    : On-demand / pay-as-you-go charges as billed
 * - "amortized" : Upfront commitment cost spread over the commitment term
 * - "blended"   : Weighted average of on-demand and committed pricing
 * - "list"      : Public list price before any discounts
 * - "allocated" : Cost that has been re-allocated from a parent entity
 */
export type AmountType = "actual" | "amortized" | "blended" | "list" | "allocated";

/**
 * The role of the provider in the billing relationship.
 * - "service-provider" : Provides the service being consumed (e.g. OpenAI)
 * - "host-provider"    : Hosts/resells the service (e.g. Azure hosting OpenAI models)
 * - "direct-provider"  : Both hosts and provides the service natively
 * - "unknown"          : Provider role cannot be determined
 */
export type ProviderRole = "service-provider" | "host-provider" | "direct-provider" | "unknown";

/**
 * Confidence level in the completeness of the record's data.
 * - "complete" : All mandatory fields are present and validated
 * - "partial"  : Some optional or expected fields are missing
 * - "unknown"  : Cannot determine completeness (e.g. raw ingest not validated)
 */
export type DataCompleteness = "complete" | "partial" | "unknown";

/**
 * Type of pricing commitment associated with this charge.
 * - "on-demand"       : No commitment; pay per use
 * - "reserved"        : Reserved capacity commitment (1yr, 3yr, etc.)
 * - "savings-plan"    : Flexible commitment (AWS Savings Plans style)
 * - "committed-use"   : GCP committed use discounts
 * - "spot"            : Spot / preemptible / interruptible instance pricing
 * - "none"            : No commitment type applicable (e.g. data transfer)
 */
export type CommitmentType =
  | "on-demand"
  | "reserved"
  | "savings-plan"
  | "committed-use"
  | "spot"
  | "none";

/**
 * Method used to allocate costs to a consumer entity.
 * - "direct"        : Cost is directly attributed (no allocation needed)
 * - "proportional"  : Allocated proportionally to usage or spend share
 * - "equal-split"   : Divided equally among consumers
 * - "rule-based"    : Custom allocation rule applied
 * - "none"          : No allocation performed
 */
export type AllocationMethod =
  | "direct"
  | "proportional"
  | "equal-split"
  | "rule-based"
  | "none";

// ---------------------------------------------------------------------------
// Core record type
// ---------------------------------------------------------------------------

/**
 * NormalizedCostRecord — canonical billing line item.
 *
 * All monetary amounts are decimal-safe strings to prevent floating-point loss.
 * All date/time fields use ISO 8601 format.
 *
 * @see NORMALIZED_COST_RECORD_SCHEMA_VERSION
 */
export type NormalizedCostRecord = {
  // ---- Identity ----

  /**
   * Globally unique record identifier (UUID v4 recommended).
   * @required
   */
  recordId: string;

  /**
   * Identifier of the upstream system that produced this record.
   * E.g. "aws-cur", "azure-cost-management", "openai-usage-api".
   * @required
   */
  sourceSystem: string;

  // ---- Provider ----

  /**
   * Canonical name of the cloud/AI provider.
   * E.g. "aws", "azure", "gcp", "openai", "anthropic".
   * @required
   */
  provider: string;

  /**
   * Provider-side account or subscription identifier.
   * E.g. AWS account ID, Azure subscription ID.
   * @optional
   */
  providerAccountId?: string;

  /**
   * The role this provider plays in the billing relationship.
   * @required
   */
  providerRole: ProviderRole;

  // ---- Billing period ----

  /**
   * Start of the billing period (inclusive), ISO 8601.
   * This is the period covered by the invoice or statement.
   * @required
   */
  billingPeriodStart: string;

  /**
   * End of the billing period (exclusive), ISO 8601.
   * @required
   */
  billingPeriodEnd: string;

  /**
   * Start of the actual charge period (inclusive), ISO 8601.
   * May differ from billingPeriodStart for amortized charges.
   * @required
   */
  chargePeriodStart: string;

  /**
   * End of the actual charge period (exclusive), ISO 8601.
   * @required
   */
  chargePeriodEnd: string;

  // ---- Monetary ----

  /**
   * ISO 4217 currency code of the amount field.
   * @required
   */
  currency: string;

  /**
   * Monetary charge amount as a decimal-safe string.
   * Positive = charge; negative = credit.
   * @required
   */
  amount: string;

  /**
   * The nature of the amount (actual, amortized, blended, list, allocated).
   * @required
   */
  amountType: AmountType;

  // ---- Service classification ----

  /**
   * High-level service category.
   * E.g. "AI / Machine Learning", "Compute", "Storage", "Networking".
   * @optional
   */
  serviceCategory?: string;

  /**
   * Specific service name as reported by the provider.
   * E.g. "Amazon Bedrock", "Azure OpenAI Service", "Claude API".
   * @optional
   */
  serviceName?: string;

  /**
   * Provider-assigned resource identifier (ARN, resource ID, etc.).
   * @optional
   */
  resourceId?: string;

  /**
   * Human-readable name of the resource, if available.
   * @optional
   */
  resourceName?: string;

  // ---- Usage ----

  /**
   * Quantity of the resource consumed during the charge period.
   * Stored as a decimal-safe string.
   * @optional
   */
  usageQuantity?: string;

  /**
   * Unit of measurement for usageQuantity.
   * E.g. "tokens", "GB", "hours", "API calls", "requests".
   * @optional
   */
  usageUnit?: string;

  // ---- Commitment / pricing ----

  /**
   * The type of pricing commitment associated with this charge.
   * @optional — defaults to "on-demand" if omitted
   */
  commitmentType?: CommitmentType;

  /**
   * Reference ID of the commitment (e.g. reservation ID, savings plan ARN).
   * @optional
   */
  commitmentReference?: string;

  // ---- Allocation ----

  /**
   * Scope to which costs are allocated (e.g. team name, project, cost center).
   * @optional
   */
  allocationScope?: string;

  /**
   * Method used to allocate this cost.
   * @optional
   */
  allocationMethod?: AllocationMethod;

  /**
   * Source of the allocation rule or policy that produced this record.
   * E.g. "ficecal-allocation-engine-v1", "manual".
   * @optional
   */
  allocationSource?: string;

  /**
   * Identifier of the entity consuming the resource.
   * E.g. a team ID, user ID, or workload identifier.
   * @optional
   */
  consumerEntityId?: string;

  /**
   * Identifier of the entity that owns the resource subscription or account.
   * @optional
   */
  ownerEntityId?: string;

  // ---- Geography ----

  /**
   * Cloud region where the resource was consumed.
   * E.g. "us-east-1", "eastus", "europe-west1".
   * @optional
   */
  region?: string;

  // ---- Tagging and dimensions ----

  /**
   * Provider-level resource tags as key-value pairs.
   * @optional
   */
  tags?: Record<string, string>;

  /**
   * Additional provider-specific or organization-specific dimensions.
   * @optional
   */
  dimensions?: Record<string, string>;

  // ---- Data quality ----

  /**
   * Completeness confidence of this record.
   * @required
   */
  dataCompleteness: DataCompleteness;

  /**
   * ISO 8601 timestamp indicating how recent the source data is.
   * E.g. the export timestamp of the billing file.
   * @optional
   */
  dataRecencyTimestamp?: string;

  /**
   * ISO 8601 timestamp when this record was ingested into FiceCal.
   * @required
   */
  ingestedAt: string;

  /**
   * Schema version of this record, for forward compatibility.
   * Should match NORMALIZED_COST_RECORD_SCHEMA_VERSION.
   * @required
   */
  schemaVersion: string;
};

// ---------------------------------------------------------------------------
// Validation error
// ---------------------------------------------------------------------------

/**
 * Thrown when a NormalizedCostRecord fails structural or business-rule validation.
 */
export class NormalizedCostRecordValidationError extends Error {
  public readonly field?: string;
  public readonly recordId?: string;

  constructor(message: string, options?: { field?: string; recordId?: string }) {
    super(message);
    this.name = "NormalizedCostRecordValidationError";
    this.field = options?.field;
    this.recordId = options?.recordId;
  }
}

// ---------------------------------------------------------------------------
// Validation helper (lightweight, no zod dependency)
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS: Array<keyof NormalizedCostRecord> = [
  "recordId",
  "sourceSystem",
  "provider",
  "providerRole",
  "billingPeriodStart",
  "billingPeriodEnd",
  "chargePeriodStart",
  "chargePeriodEnd",
  "currency",
  "amount",
  "amountType",
  "dataCompleteness",
  "ingestedAt",
  "schemaVersion",
];

/**
 * Validates that a NormalizedCostRecord has all required fields populated.
 * Throws NormalizedCostRecordValidationError on the first missing or empty field.
 */
export function validateNormalizedCostRecord(
  record: Partial<NormalizedCostRecord>
): asserts record is NormalizedCostRecord {
  for (const field of REQUIRED_FIELDS) {
    const value = record[field];
    if (value === undefined || value === null || value === "") {
      throw new NormalizedCostRecordValidationError(
        `Missing required field: "${field}"`,
        { field, recordId: record.recordId }
      );
    }
  }
}

/**
 * Type-guard that checks if an object conforms to NormalizedCostRecord shape
 * without throwing. Returns false on the first validation failure.
 */
export function isNormalizedCostRecord(
  value: unknown
): value is NormalizedCostRecord {
  if (typeof value !== "object" || value === null) return false;
  try {
    validateNormalizedCostRecord(value as Partial<NormalizedCostRecord>);
    return true;
  } catch {
    return false;
  }
}
