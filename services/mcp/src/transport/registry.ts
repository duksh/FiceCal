// ─── Tool Registry Bootstrap ──────────────────────────────────────────────────
//
// Creates and pre-populates the singleton McpToolRegistry with all three
// Phase 5 economics tools. This is the single source of truth for which
// tools the service exposes.

import { McpToolRegistry } from "@ficecal/mcp-tooling";
import { costEstimateTool } from "@ficecal/mcp-tooling";
import { healthScoreQueryTool } from "@ficecal/mcp-tooling";
import { periodNormalizeTool } from "@ficecal/mcp-tooling";

let _registry: McpToolRegistry | null = null;

/**
 * Returns the singleton tool registry, creating and populating it on first call.
 * Idempotent — safe to call multiple times.
 */
export function getToolRegistry(): McpToolRegistry {
  if (_registry !== null) return _registry;

  const registry = new McpToolRegistry();
  registry.register(costEstimateTool);
  registry.register(healthScoreQueryTool);
  registry.register(periodNormalizeTool);

  _registry = registry;
  return _registry;
}

/** Reset the registry singleton — for use in tests only. */
export function _resetRegistry(): void {
  _registry = null;
}
