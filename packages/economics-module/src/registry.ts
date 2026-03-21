import type {
  EconomicsPlugin,
  EconomicsDomainManifest,
} from "./types.js";
import { EconomicsRegistryError } from "./types.js";

// ─── EconomicsRegistry ────────────────────────────────────────────────────────

/**
 * Central registry for all FiceCal economics engines.
 *
 * Design goals:
 * - Single import surface: consumers import one package and get every engine
 * - Plugin extension: future modules (cloud-economics, licensing, FinOps)
 *   self-register without changing core consumers
 * - Type-safe dispatch: lookup<TInput, TResult>() narrows plugin types at
 *   call site; registry internals use `unknown` to avoid a mega-union type
 */
export class EconomicsRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly plugins = new Map<string, EconomicsPlugin<any, any>>();

  // ─── Registration ──────────────────────────────────────────────────────────

  /**
   * Register an economics plugin. Throws if the domain is already taken.
   * To replace, call unregister() first.
   */
  register<TInput, TResult>(plugin: EconomicsPlugin<TInput, TResult>): void {
    if (this.plugins.has(plugin.domain)) {
      throw new EconomicsRegistryError(
        "DOMAIN_ALREADY_REGISTERED",
        `Domain "${plugin.domain}" is already registered. Call unregister() first to replace it.`,
      );
    }
    this.plugins.set(plugin.domain, plugin);
  }

  /**
   * Remove a plugin by domain. Safe to call even if not registered.
   */
  unregister(domain: string): boolean {
    return this.plugins.delete(domain);
  }

  // ─── Lookup ────────────────────────────────────────────────────────────────

  /**
   * Look up a plugin by domain, narrowing to the expected TInput/TResult types.
   * Returns undefined if the domain is not registered.
   */
  lookup<TInput = unknown, TResult = unknown>(
    domain: string,
  ): EconomicsPlugin<TInput, TResult> | undefined {
    return this.plugins.get(domain) as EconomicsPlugin<TInput, TResult> | undefined;
  }

  /**
   * Look up a plugin or throw EconomicsRegistryError("DOMAIN_NOT_FOUND").
   */
  require<TInput = unknown, TResult = unknown>(
    domain: string,
  ): EconomicsPlugin<TInput, TResult> {
    const plugin = this.lookup<TInput, TResult>(domain);
    if (!plugin) {
      throw new EconomicsRegistryError(
        "DOMAIN_NOT_FOUND",
        `No economics plugin registered for domain "${domain}". Registered: [${this.listDomains().join(", ")}]`,
      );
    }
    return plugin;
  }

  // ─── Dispatch ──────────────────────────────────────────────────────────────

  /**
   * Convenience dispatcher — looks up the plugin by domain and invokes compute().
   * Throws DOMAIN_NOT_FOUND if unregistered, or COMPUTE_ERROR if compute throws.
   */
  compute<TInput, TResult>(domain: string, input: TInput): TResult {
    const plugin = this.require<TInput, TResult>(domain);
    try {
      return plugin.compute(input);
    } catch (err) {
      throw new EconomicsRegistryError(
        "COMPUTE_ERROR",
        `Plugin "${domain}" threw during compute: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // ─── Introspection ─────────────────────────────────────────────────────────

  /** List all registered domain keys. */
  listDomains(): string[] {
    return [...this.plugins.keys()].sort();
  }

  /** Return a structured manifest of all registered plugins. */
  manifest(): EconomicsDomainManifest[] {
    return this.listDomains().map((domain) => {
      const p = this.plugins.get(domain)!;
      return { domain: p.domain, version: p.version, description: p.description };
    });
  }

  /** Number of registered plugins. */
  get size(): number {
    return this.plugins.size;
  }
}
