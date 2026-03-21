// ─── PluginHost ────────────────────────────────────────────────────────────────
//
// Routes plugin contributions to the appropriate sub-registries.
// Accepts a McpToolRegistrar interface so this package stays zero-dependency.

import type { FicecalPlugin } from "./types.js";
import { PluginRegistrationError } from "./types.js";
import { ThemeRegistry } from "./theme-registry.js";
import { BillingRegistry } from "./billing-registry.js";

/**
 * Minimal MCP tool registrar interface.
 * Structurally compatible with McpToolRegistry from @ficecal/mcp-tooling.
 * Kept here as an interface to avoid importing that package.
 */
export interface McpToolRegistrar {
  register(tool: unknown): void;
}

/**
 * Central registration host for FiceCal plugins.
 *
 * Usage:
 * ```ts
 * const host = new PluginHost(mcpToolRegistry);
 * host.register(lightThemePlugin);
 * host.register(awsBillingPlugin);
 * ```
 *
 * The PluginHost:
 * - Validates plugin id uniqueness
 * - Checks feature flag requirements
 * - Routes each contribution to the correct sub-registry
 * - Provides a listing API for inspection / admin UIs
 */
export class PluginHost {
  private readonly _plugins = new Map<string, FicecalPlugin>();
  readonly themes = new ThemeRegistry();
  readonly billing = new BillingRegistry();
  private readonly _mcpTools: McpToolRegistrar;
  private readonly _activeFlags: ReadonlySet<string>;

  constructor(
    mcpTools: McpToolRegistrar,
    activeFeatureFlags: string[] = [],
  ) {
    this._mcpTools = mcpTools;
    this._activeFlags = new Set(activeFeatureFlags);
  }

  /**
   * Register a plugin and route its contributions.
   *
   * Throws PluginRegistrationError if:
   * - A plugin with the same id is already registered
   * - The plugin's required feature flags are not all active
   * - Any contribution registration fails (duplicate theme, adapter, etc.)
   */
  register(plugin: FicecalPlugin): void {
    if (this._plugins.has(plugin.id)) {
      throw new PluginRegistrationError(
        "DUPLICATE_PLUGIN",
        `Plugin "${plugin.id}" is already registered.`,
        plugin.id,
      );
    }

    // Feature flag guard
    for (const flag of plugin.requires ?? []) {
      if (!this._activeFlags.has(flag)) {
        throw new PluginRegistrationError(
          "UNMET_REQUIREMENTS",
          `Plugin "${plugin.id}" requires feature flag "${flag}" which is not active.`,
          plugin.id,
        );
      }
    }

    // Register the plugin
    this._plugins.set(plugin.id, plugin);

    // Route contributions
    for (const theme of plugin.contributions.themes ?? []) {
      this.themes.register(theme, plugin.id);
    }
    for (const tool of plugin.contributions.mcpTools ?? []) {
      this._mcpTools.register(tool);
    }
    for (const fixture of plugin.contributions.billingFixtures ?? []) {
      this.billing.registerFixture(fixture, plugin.id);
    }
    for (const adapter of plugin.contributions.billingAdapters ?? []) {
      this.billing.registerAdapter(adapter, plugin.id);
    }
  }

  getPlugin(id: string): FicecalPlugin | undefined {
    return this._plugins.get(id);
  }

  listPlugins(): FicecalPlugin[] {
    return [...this._plugins.values()];
  }

  get pluginCount(): number {
    return this._plugins.size;
  }
}
