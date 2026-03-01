import { BillingAdapterId, BillingIngestMode } from "./types";

type RuntimeEnv = {
  FICECAL_CREDENTIALS_BACKEND?: string;
  FICECAL_SECRET_RESOLVER_ENDPOINT?: string;
};

function getRuntimeEnv(): RuntimeEnv {
  const runtime = globalThis as { process?: { env?: RuntimeEnv } };
  return runtime.process?.env ?? {};
}

export type BillingCredentialResolution = {
  adapterId: BillingAdapterId;
  ingestMode: BillingIngestMode;
  credentialRef?: string;
  backend?: string;
  resolverEndpoint?: string;
  resolved: boolean;
  reason?: string;
};

export function resolveBillingCredentialRef(
  adapterId: BillingAdapterId,
  ingestMode: BillingIngestMode,
  credentialRef?: string,
): BillingCredentialResolution {
  const env = getRuntimeEnv();
  const backend = env.FICECAL_CREDENTIALS_BACKEND;
  const resolverEndpoint = env.FICECAL_SECRET_RESOLVER_ENDPOINT;

  if (ingestMode === "deterministic") {
    return {
      adapterId,
      ingestMode,
      credentialRef,
      backend,
      resolverEndpoint,
      resolved: true,
      reason: "deterministic_mode",
    };
  }

  if (!credentialRef) {
    return {
      adapterId,
      ingestMode,
      backend,
      resolverEndpoint,
      resolved: false,
      reason: "missing_credential_ref",
    };
  }

  if (!backend) {
    return {
      adapterId,
      ingestMode,
      credentialRef,
      resolverEndpoint,
      resolved: false,
      reason: "missing_credentials_backend",
    };
  }

  if (!resolverEndpoint) {
    return {
      adapterId,
      ingestMode,
      credentialRef,
      backend,
      resolved: false,
      reason: "missing_secret_resolver_endpoint",
    };
  }

  return {
    adapterId,
    ingestMode,
    credentialRef,
    backend,
    resolverEndpoint,
    resolved: true,
    reason: "resolver_wired",
  };
}
