// ─── Tool Registry Bootstrap ──────────────────────────────────────────────────
//
// Creates and pre-populates the singleton McpToolRegistry with all tools.
// Phase 5: economics tools (cost estimate, health score, period normalize)
// Phase 6: billing tools (estimate actual, compare period) + 4 provider plugins

import { McpToolRegistry } from "@ficecal/mcp-tooling";
import { costEstimateTool } from "@ficecal/mcp-tooling";
import { healthScoreQueryTool } from "@ficecal/mcp-tooling";
import { periodNormalizeTool } from "@ficecal/mcp-tooling";
import {
  billingEstimateActualTool,
  billingComparePeriodTool,
  setEstimateBillingRegistry,
  setCompareBillingRegistry,
} from "@ficecal/mcp-tooling";

import { PluginHost, BillingRegistry } from "@ficecal/plugin-api";
import { awsBillingPlugin } from "../plugins/aws-billing-plugin.js";
import { gcpBillingPlugin } from "../plugins/gcp-billing-plugin.js";
import { azureBillingPlugin } from "../plugins/azure-billing-plugin.js";
import { openaiBillingPlugin } from "../plugins/openai-billing-plugin.js";

let _registry: McpToolRegistry | null = null;
let _pluginHost: PluginHost | null = null;

/**
 * Returns the singleton tool registry, creating and populating it on first call.
 * Idempotent — safe to call multiple times.
 *
 * Phase 6 bootstrap:
 * 1. Create McpToolRegistry and register Phase 5 economics tools
 * 2. Create PluginHost (wraps registry as McpToolRegistrar)
 * 3. Register 4 provider billing plugins (AWS, GCP, Azure, OpenAI)
 * 4. Wire BillingRegistry into billing tool module-level registries
 * 5. Register billing MCP tools
 */
export function getToolRegistry(): McpToolRegistry {
  if (_registry !== null) return _registry;

  const registry = new McpToolRegistry();

  // ── Phase 5: economics tools ────────────────────────────────────────────────
  registry.register(costEstimateTool);
  registry.register(healthScoreQueryTool);
  registry.register(periodNormalizeTool);

  // ── Phase 6: billing plugins ────────────────────────────────────────────────
  // PluginHost routes billing fixtures + adapters to BillingRegistry.
  // McpToolRegistrar wrapper forwards .register() calls back to our registry.
  const mcpRegistrar = { register: (tool: unknown) => registry.register(tool as Parameters<typeof registry.register>[0]) };
  const host = new PluginHost(mcpRegistrar);

  host.register(awsBillingPlugin);
  host.register(gcpBillingPlugin);
  host.register(azureBillingPlugin);
  host.register(openaiBillingPlugin);

  // Wire the BillingRegistry into billing tool handlers
  const billingReg = host.billing;
  setEstimateBillingRegistry(billingReg);
  setCompareBillingRegistry(billingReg);

  // Register billing MCP tools (after registry is wired)
  registry.register(billingEstimateActualTool);
  registry.register(billingComparePeriodTool);

  _registry = registry;
  _pluginHost = host;
  return _registry;
}

/** Expose the PluginHost for inspection (health endpoint, admin routes). */
export function getPluginHost(): PluginHost | null {
  return _pluginHost;
}

/** Reset all singletons — for use in tests only. */
export function _resetRegistry(): void {
  _registry = null;
  _pluginHost = null;
}
