import { resolveBillingAdapter } from "../registry";
import { BillingAdapterId, BillingCanonicalHandoff, BillingIngestRequest } from "../types";
import { createDefaultMcpContext, McpRequestContext, McpToolEnvelope, validateMcpContext } from "../../mcp";

export type BillingIngestEnvelope = McpToolEnvelope<BillingIngestRequest>;

function hasEnvelopeShape(value: unknown): value is BillingIngestEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "context" in value &&
    "input" in value
  );
}

function normalizeEnvelope(
  envelopeOrRequest: BillingIngestEnvelope | BillingIngestRequest,
): BillingIngestEnvelope {
  if (hasEnvelopeShape(envelopeOrRequest)) {
    return {
      context: validateMcpContext(envelopeOrRequest.context),
      input: envelopeOrRequest.input,
    };
  }

  const fallbackContext = createDefaultMcpContext({
    requestId: envelopeOrRequest.integrationRunId,
    traceId: envelopeOrRequest.integrationRunId,
  });

  return {
    context: validateMcpContext(fallbackContext),
    input: envelopeOrRequest,
  };
}

async function runIngest(
  adapterId: BillingAdapterId | string,
  request: BillingIngestRequest,
  _context: McpRequestContext,
): Promise<BillingCanonicalHandoff> {
  const resolution = resolveBillingAdapter(adapterId);
  const { adapter, resolvedAdapterId } = resolution;
  const payload = {
    adapterId: resolvedAdapterId,
    period: {
      startDate: request.startDate,
      endDate: request.endDate,
      currency: request.currency,
    },
    credentialRef: request.credentialRef,
    authMode: request.authMode,
    workspaceScope: request.workspaceScope,
    accountScope: request.accountScope,
    subscriptionScope: request.subscriptionScope,
    billingAccountScope: request.billingAccountScope,
    tenantScope: request.tenantScope,
  };

  const validation = adapter.validateBillingPayload(payload);
  if (!validation.valid) {
    throw new Error(`Invalid payload for ${resolvedAdapterId}: ${validation.errors.join(", ")}`);
  }

  return adapter.mapToCanonical(request, payload);
}

async function runIngestFromEnvelope(
  adapterId: BillingAdapterId,
  envelopeOrRequest: BillingIngestEnvelope | BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  const envelope = normalizeEnvelope(envelopeOrRequest);
  return runIngest(adapterId, envelope.input, envelope.context);
}

export async function billingOpenopsIngestV2(
  envelope: BillingIngestEnvelope,
): Promise<BillingCanonicalHandoff> {
  return runIngestFromEnvelope("openops-billing", envelope);
}

export async function billingAwsIngestV2(
  envelope: BillingIngestEnvelope,
): Promise<BillingCanonicalHandoff> {
  return runIngestFromEnvelope("aws-billing", envelope);
}

export async function billingAzureIngestV2(
  envelope: BillingIngestEnvelope,
): Promise<BillingCanonicalHandoff> {
  return runIngestFromEnvelope("azure-billing", envelope);
}

export async function billingGcpIngestV2(
  envelope: BillingIngestEnvelope,
): Promise<BillingCanonicalHandoff> {
  return runIngestFromEnvelope("gcp-billing", envelope);
}

export async function billingOpenopsIngest(
  request: BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  return runIngestFromEnvelope("openops-billing", request);
}

export async function billingAwsIngest(
  request: BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  return runIngestFromEnvelope("aws-billing", request);
}

export async function billingAzureIngest(
  request: BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  return runIngestFromEnvelope("azure-billing", request);
}

export async function billingGcpIngest(
  request: BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  return runIngestFromEnvelope("gcp-billing", request);
}
