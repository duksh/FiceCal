// ─── Feature descriptor ───────────────────────────────────────────────────────

/**
 * Describes a registerable FiceCal feature or plugin.
 *
 * The registry uses this contract to:
 * - Detect duplicate registrations (by id)
 * - Resolve dependency load order (topological sort)
 * - Surface capability queries (by provides)
 */
export interface FeatureDescriptor {
  /**
   * Globally unique feature identifier.
   * Convention: `<scope>.<name>` — e.g. "economics.core", "billing.aws"
   */
  id: string;

  /** Semver-compatible version string. */
  version: string;

  /**
   * IDs of features that must be registered before this one can be resolved.
   * The registry validates these are present and resolves a load order.
   */
  dependsOn: string[];

  /**
   * Capability tokens this feature exposes to consumers.
   * Other features can query the registry by capability rather than id.
   * Example: ["cost-compute", "forex-conversion"]
   */
  provides: string[];

  /** Arbitrary metadata — stable KV bag for tooling and introspection. */
  metadata?: Record<string, unknown>;
}

// ─── Registry entry ───────────────────────────────────────────────────────────

export interface FeatureRegistryEntry {
  descriptor: FeatureDescriptor;
  registeredAt: string; // ISO timestamp
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export type FeatureRegistryErrorCode =
  | "DUPLICATE_ID"
  | "NOT_FOUND"
  | "MISSING_DEPENDENCY"
  | "CIRCULAR_DEPENDENCY"
  | "INVALID_DESCRIPTOR";

export class FeatureRegistryError extends Error {
  constructor(
    message: string,
    public readonly code: FeatureRegistryErrorCode,
    public readonly featureId?: string,
  ) {
    super(message);
    this.name = "FeatureRegistryError";
  }
}

// ─── Validation result ────────────────────────────────────────────────────────

export interface RegistryValidationResult {
  valid: boolean;
  errors: Array<{ featureId: string; message: string; code: FeatureRegistryErrorCode }>;
}
