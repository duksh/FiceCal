import { McpCapabilitiesResponse } from "./types";

const BILLING_TOOLS = [
  "billing.openops.ingest",
  "billing.aws.ingest",
  "billing.azure.ingest",
  "billing.gcp.ingest",
] as const;

export function mcpCapabilitiesGet(): McpCapabilitiesResponse {
  return {
    mcpVersion: "2.0",
    schemaVersion: "2026-03-01",
    toolNamespaces: [
      {
        namespace: "billing",
        version: "1.0",
        tools: [...BILLING_TOOLS],
        ownerTeam: "integration-team",
        stability: "phase-1-stub",
      },
    ],
    compatibility: {
      legacyAliasesEnabled: true,
      aliasNamespace: "finops",
      parityFixtureVersion: "1.0",
    },
    featureFlags: ["mcp_v2", "legacy_alias_parity"],
  };
}
