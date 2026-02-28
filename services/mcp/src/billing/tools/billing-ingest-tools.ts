import { getBillingAdapter } from "../registry";
import { BillingAdapterId, BillingCanonicalHandoff, BillingIngestRequest } from "../types";

async function runIngest(
  adapterId: BillingAdapterId,
  request: BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  const adapter = getBillingAdapter(adapterId);
  const payload = {
    adapterId,
    period: {
      startDate: request.startDate,
      endDate: request.endDate,
      currency: request.currency,
    },
  };

  const validation = adapter.validateBillingPayload(payload);
  if (!validation.valid) {
    throw new Error(`Invalid payload for ${adapterId}: ${validation.errors.join(", ")}`);
  }

  return adapter.mapToCanonical(request, payload);
}

export async function billingOpenopsIngest(
  request: BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  return runIngest("openops-billing", request);
}

export async function billingAwsIngest(
  request: BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  return runIngest("aws-billing", request);
}

export async function billingAzureIngest(
  request: BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  return runIngest("azure-billing", request);
}

export async function billingGcpIngest(
  request: BillingIngestRequest,
): Promise<BillingCanonicalHandoff> {
  return runIngest("gcp-billing", request);
}
