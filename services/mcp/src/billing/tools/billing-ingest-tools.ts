import { BillingAdapterResolutionError, isBillingAdapterIdFormat, resolveBillingAdapter } from "../registry";
import { BillingAdapterId, BillingCanonicalHandoff, BillingIngestRequest } from "../types";
import { createDefaultMcpContext, McpRequestContext, McpToolEnvelope, validateMcpContext } from "../../mcp";

export type BillingIngestEnvelope = McpToolEnvelope<BillingIngestRequest>;

export type BillingIngestErrorCode =
  | "auth_error"
  | "permission_error"
  | "rate_limit"
  | "timeout"
  | "upstream_unavailable"
  | "validation_error"
  | "unknown_runtime_error";

export class BillingIngestError extends Error {
  readonly code: BillingIngestErrorCode;
  readonly adapterId: BillingAdapterId;

  constructor(code: BillingIngestErrorCode, adapterId: BillingAdapterId, message: string) {
    super(message);
    this.name = "BillingIngestError";
    this.code = code;
    this.adapterId = adapterId;
  }
}

function inferValidationErrorCode(errors: string[]): BillingIngestErrorCode {
  const combined = errors.join(" ").toLowerCase();
  if (combined.includes("authmode") || combined.includes("credentialref")) {
    return "auth_error";
  }
  if (combined.includes("permission")) {
    return "permission_error";
  }
  return "validation_error";
}

function normalizeRuntimeError(adapterId: BillingAdapterId, error: unknown): BillingIngestError {
  if (error instanceof BillingIngestError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  const lowered = message.toLowerCase();

  let code: BillingIngestErrorCode = "unknown_runtime_error";
  if (lowered.includes("auth") || lowered.includes("credential")) {
    code = "auth_error";
  } else if (lowered.includes("permission") || lowered.includes("forbidden")) {
    code = "permission_error";
  } else if (lowered.includes("rate") && lowered.includes("limit")) {
    code = "rate_limit";
  } else if (lowered.includes("timeout")) {
    code = "timeout";
  } else if (lowered.includes("unavailable") || lowered.includes("upstream")) {
    code = "upstream_unavailable";
  } else if (lowered.includes("invalid") || lowered.includes("validation")) {
    code = "validation_error";
  }

  return new BillingIngestError(code, adapterId, `Billing ingest failed for ${adapterId}: ${message}`);
}

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
  const resolution = (() => {
    try {
      return resolveBillingAdapter(adapterId);
    } catch (error) {
      if (error instanceof BillingAdapterResolutionError) {
        const normalizedAdapterId = isBillingAdapterIdFormat(error.requestedAdapterId)
          ? error.requestedAdapterId
          : "openops-billing";

        throw new BillingIngestError(
          "validation_error",
          normalizedAdapterId,
          `Adapter resolution failed for '${error.requestedAdapterId}': ${error.message}`,
        );
      }
      throw error;
    }
  })();

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
    providerScope: request.providerScope,
  };

  const validation = adapter.validateBillingPayload(payload);
  if (!validation.valid) {
    throw new BillingIngestError(
      inferValidationErrorCode(validation.errors),
      resolvedAdapterId,
      `Invalid payload for ${resolvedAdapterId}: ${validation.errors.join(", ")}`,
    );
  }

  try {
    return adapter.mapToCanonical(request, payload);
  } catch (error) {
    throw normalizeRuntimeError(resolvedAdapterId, error);
  }
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
