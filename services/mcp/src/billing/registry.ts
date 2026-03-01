import { awsBillingAdapter } from "./adapters/aws";
import { azureBillingAdapter } from "./adapters/azure";
import { gcpBillingAdapter } from "./adapters/gcp";
import { openopsBillingAdapter } from "./adapters/openops";
import {
  BillingAdapter,
  BillingAdapterId,
  BUILTIN_BILLING_ADAPTER_IDS,
  BuiltinBillingAdapterId,
} from "./types";

const DEFAULT_BILLING_ADAPTER_ID: BillingAdapterId = "openops-billing";

export type BillingAdapterResolutionMode = "fallback" | "strict";

export type BillingAdapterRegistrationOptions = {
  replaceExisting?: boolean;
};

export type BillingAdapterResolutionOptions = {
  fallbackAdapterId?: BillingAdapterId;
  mode?: BillingAdapterResolutionMode;
};

export class BillingAdapterResolutionError extends Error {
  readonly requestedAdapterId: string;

  constructor(requestedAdapterId: string, message: string) {
    super(message);
    this.name = "BillingAdapterResolutionError";
    this.requestedAdapterId = requestedAdapterId;
  }
}

type RuntimeEnv = {
  NODE_ENV?: string;
  BILLING_ADAPTER_RESOLUTION_MODE?: string;
};

function getRuntimeEnv(): RuntimeEnv {
  const runtime = globalThis as { process?: { env?: RuntimeEnv } };
  return runtime.process?.env ?? {};
}

function getDefaultResolutionMode(): BillingAdapterResolutionMode {
  const env = getRuntimeEnv();
  const configuredMode = env.BILLING_ADAPTER_RESOLUTION_MODE;
  if (configuredMode === "strict" || configuredMode === "fallback") {
    return configuredMode;
  }

  if (env.NODE_ENV === "production") {
    return "strict";
  }

  return "fallback";
}

const DEFAULT_RESOLUTION_MODE = getDefaultResolutionMode();

function createPlaceholderAdapter(adapterId: BillingAdapterId): BillingAdapter {
  const placeholderVersion = `${adapterId.replace("-billing", "")}-placeholder-v0.1.0`;

  return {
    adapterId,
    async discoverAccounts() {
      return [];
    },
    async fetchBillingPeriod(request) {
      return {
        startDate: request.startDate,
        endDate: request.endDate,
        currency: request.currency,
        rawRecordCount: 0,
      };
    },
    validateBillingPayload() {
      return { valid: true, errors: [] };
    },
    mapToCanonical(request) {
      return {
        integrationRunId: request.integrationRunId,
        providerAdapterId: adapterId,
        scope: {
          startDate: request.startDate,
          endDate: request.endDate,
          currency: request.currency,
        },
        canonical: { infraTotal: 0, cudPct: 0, budgetCap: 0, nRef: 0 },
        provenance: {
          sourceVersion: placeholderVersion,
          coveragePct: 0,
          mappingConfidence: "low",
          warnings: ["Placeholder adapter - not in Phase 1 scope."],
        },
      };
    },
    emitProvenance(result) {
      return result.provenance;
    },
  };
}

const adapters = new Map<BillingAdapterId, BillingAdapter>();

export function isBillingAdapterIdFormat(value: string): value is BillingAdapterId {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*-billing$/.test(value);
}

export function registerBillingAdapter(
  adapter: BillingAdapter,
  options: BillingAdapterRegistrationOptions = {},
): void {
  if (!isBillingAdapterIdFormat(adapter.adapterId)) {
    throw new Error(`Invalid adapter id format '${adapter.adapterId}'. Expected '*-billing'.`);
  }

  const exists = adapters.has(adapter.adapterId);
  if (exists && !options.replaceExisting) {
    throw new Error(`Billing adapter '${adapter.adapterId}' is already registered.`);
  }

  adapters.set(adapter.adapterId, adapter);
}

export function registerBillingAdapters(
  adapterList: BillingAdapter[],
  options: BillingAdapterRegistrationOptions = {},
): void {
  for (const adapter of adapterList) {
    registerBillingAdapter(adapter, options);
  }
}

function registerBuiltinPlaceholders(): void {
  for (const adapterId of BUILTIN_BILLING_ADAPTER_IDS) {
    if (!adapters.has(adapterId)) {
      registerBillingAdapter(createPlaceholderAdapter(adapterId as BuiltinBillingAdapterId));
    }
  }
}

function bootstrapBuiltins(): void {
  registerBillingAdapters([
    openopsBillingAdapter,
    awsBillingAdapter,
    azureBillingAdapter,
    gcpBillingAdapter,
  ]);
  registerBuiltinPlaceholders();
}

bootstrapBuiltins();

export type BillingAdapterResolution = {
  requestedAdapterId: string;
  resolvedAdapterId: BillingAdapterId;
  usedFallback: boolean;
  adapter: BillingAdapter;
};

export function isBillingAdapterId(value: string): value is BillingAdapterId {
  return adapters.has(value as BillingAdapterId);
}

export function resolveBillingAdapter(
  adapterId: BillingAdapterId | string,
  options: BillingAdapterResolutionOptions = {},
): BillingAdapterResolution {
  const fallbackAdapterId = options.fallbackAdapterId ?? DEFAULT_BILLING_ADAPTER_ID;
  const mode = options.mode ?? DEFAULT_RESOLUTION_MODE;

  if (isBillingAdapterId(adapterId)) {
    const adapter = adapters.get(adapterId);
    if (!adapter) {
      throw new BillingAdapterResolutionError(
        adapterId,
        `Billing adapter '${adapterId}' resolved as registered id but no implementation was found.`,
      );
    }

    return {
      requestedAdapterId: adapterId,
      resolvedAdapterId: adapterId,
      usedFallback: false,
      adapter,
    };
  }

  if (mode === "strict") {
    throw new BillingAdapterResolutionError(
      adapterId,
      `Unknown billing adapter '${adapterId}' and strict resolution mode is enabled.`,
    );
  }

  const fallbackAdapter = adapters.get(fallbackAdapterId);
  if (!fallbackAdapter) {
    throw new BillingAdapterResolutionError(
      adapterId,
      `Fallback billing adapter '${fallbackAdapterId}' is not registered.`,
    );
  }

  return {
    requestedAdapterId: adapterId,
    resolvedAdapterId: fallbackAdapterId,
    usedFallback: true,
    adapter: fallbackAdapter,
  };
}

export function getBillingAdapter(adapterId: BillingAdapterId | string): BillingAdapter {
  return resolveBillingAdapter(adapterId).adapter;
}

export function listBillingAdapterIds(): BillingAdapterId[] {
  return Array.from(adapters.keys()).sort();
}
