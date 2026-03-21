// ─── Economics plugin interface ────────────────────────────────────────────────

/**
 * Contract that every economics engine must satisfy to self-register with the
 * EconomicsRegistry. The generic parameters are intentionally open so the
 * registry can hold mixed-domain plugins without requiring a discriminated union
 * at registration time; call sites narrow types via lookup<TInput, TResult>().
 */
export interface EconomicsPlugin<TInput = unknown, TResult = unknown> {
  /** Stable dot-namespaced domain key. e.g. "ai.token", "reliability.slo", "tech.normalization" */
  readonly domain: string;

  /** Semver string for this plugin's computation contract. */
  readonly version: string;

  /** Human-readable description shown in capabilities manifests. */
  readonly description: string;

  /** Executes the economics computation and returns a typed result. */
  compute(input: TInput): TResult;
}

// ─── Registry error ────────────────────────────────────────────────────────────

export type EconomicsRegistryErrorCode =
  | "DOMAIN_NOT_FOUND"
  | "DOMAIN_ALREADY_REGISTERED"
  | "COMPUTE_ERROR";

export class EconomicsRegistryError extends Error {
  constructor(
    public readonly code: EconomicsRegistryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "EconomicsRegistryError";
  }
}

// ─── Domain manifest entry ─────────────────────────────────────────────────────

export interface EconomicsDomainManifest {
  domain: string;
  version: string;
  description: string;
}
