export type {
  McpMode,
  McpActor,
  McpTimeRange,
  McpContractVersions,
  McpRequestContext,
  McpToolEnvelope,
  McpToolInputSchema,
  McpToolDescriptor,
  McpToolResult,
  McpToolNamespaceManifest,
  McpCapabilitiesManifest,
} from "./types.js";

export { McpToolRegistry } from "./tool-registry.js";

export { costEstimateTool } from "./tools/cost-estimate.js";
export { healthScoreQueryTool } from "./tools/health-score-query.js";
export { periodNormalizeTool } from "./tools/period-normalize.js";

// ─── Billing tools ─────────────────────────────────────────────────────────────
export type {
  BillingEstimateActualInput,
  BillingEstimateActualOutput,
  BillingLineItemOutput,
  BillingAdapterRegistry,
} from "./tools/billing-estimate-actual.js";
export {
  billingEstimateActualTool,
  setBillingRegistry as setEstimateBillingRegistry,
  _resetBillingRegistry as _resetEstimateBillingRegistry,
} from "./tools/billing-estimate-actual.js";

export type {
  BillingComparePeriodInput,
  BillingComparePeriodOutput,
  ServiceDelta,
} from "./tools/billing-compare-period.js";
export {
  billingComparePeriodTool,
  setBillingRegistry as setCompareBillingRegistry,
  _resetBillingRegistry as _resetCompareBillingRegistry,
} from "./tools/billing-compare-period.js";
