# MCP Evolution Contract (P03)

## Purpose

Define the Phase P03 contract baseline for MCP v2 capabilities, common request context, legacy alias parity, telemetry events, namespace ownership, and release gate checks.

## Scope

- `F2-EPIC-030` MCP v2 baseline and compatibility
- `F2-STORY-031` Implement capabilities handshake
- `F2-STORY-032` Implement common context envelope
- `F2-TASK-033` Define legacy alias parity tests
- `F2-TASK-034` Define MCP telemetry event contracts
- `F2-TASK-035` Create MCP tool ownership matrix
- `F2-TASK-036` Add MCP release gate checklist

## MCP v2 capabilities handshake contract (`F2-STORY-031`)

Canonical `mcp.capabilities.get` response must expose:

1. protocol and schema versions
2. available tool namespaces and versions
3. compatibility surface for legacy aliases
4. gate-critical feature flags

Example response envelope:

```json
{
  "mcpVersion": "2.0",
  "schemaVersion": "2026-03-01",
  "toolNamespaces": [
    {
      "namespace": "billing",
      "version": "1.0",
      "tools": [
        "billing.openops.ingest",
        "billing.aws.ingest",
        "billing.azure.ingest",
        "billing.gcp.ingest"
      ],
      "ownerTeam": "integration-team",
      "stability": "phase-1-stub"
    }
  ],
  "compatibility": {
    "legacyAliasesEnabled": true,
    "aliasNamespace": "finops",
    "parityFixtureVersion": "1.0"
  }
}
```

## Common context envelope contract (`F2-STORY-032`)

All v2 MCP tools consume a shared context object alongside tool-specific inputs.

Required envelope fields:

- `requestId` (string)
- `traceId` (string)
- `mode` (`quick` | `operator` | `architect`)
- `workspaceId` (string)
- `actor` (`human` | `agent` | `system`)
- `timeRange` (`start`, `end`, `tz`)
- `contractVersions` (`mcp`, `tool`, `fixture`)
- `featureFlags` (string array)

Normalization rule: tool handlers may enrich context but cannot remove required fields before downstream handoff.

## Legacy alias parity test baseline (`F2-TASK-033`)

Initial alias-to-canonical parity rows:

| Legacy alias | Canonical tool | Expected parity mode | Fixture anchor |
|---|---|---|---|
| `finops.billing.openops.ingest` | `billing.openops.ingest` | response shape parity | `tests/contracts/fixtures/mcp/legacy-alias-parity/1.0/` |
| `finops.billing.aws.ingest` | `billing.aws.ingest` | response shape parity | `tests/contracts/fixtures/mcp/legacy-alias-parity/1.0/` |
| `finops.billing.azure.ingest` | `billing.azure.ingest` | response shape parity | `tests/contracts/fixtures/mcp/legacy-alias-parity/1.0/` |
| `finops.billing.gcp.ingest` | `billing.gcp.ingest` | response shape parity | `tests/contracts/fixtures/mcp/legacy-alias-parity/1.0/` |

Parity definition: identical canonical response shape and compatible error taxonomy between alias and canonical entry points.

## Telemetry event contracts (`F2-TASK-034`)

### Event: `mcp.tool.call`

Required fields:

- `eventName`: `mcp.tool.call`
- `ts`
- `requestId`
- `traceId`
- `toolName`
- `namespace`
- `actor`
- `mode`
- `inputSchemaVersion`

### Event: `mcp.tool.result`

Required fields:

- `eventName`: `mcp.tool.result`
- `ts`
- `requestId`
- `traceId`
- `toolName`
- `status` (`ok` | `degraded` | `error`)
- `durationMs`
- `errorCategory` (nullable)
- `outputSchemaVersion`

### Event: `mcp.alias.call`

Required fields:

- `eventName`: `mcp.alias.call`
- `ts`
- `requestId`
- `traceId`
- `aliasName`
- `canonicalToolName`
- `parityFixtureVersion`

## MCP tool ownership matrix (`F2-TASK-035`)

| Namespace | Owner (now) | Future owner (target) | Notes |
|---|---|---|---|
| `billing.*` | `duksh` | `integration-team` | Provider ingest and canonical billing handoff |
| `core.*` | `duksh` | `platform-core` | Core economics and orchestration |
| `mcp.capabilities.*` | `duksh` | `agent-platform` | Runtime capability discovery surface |
| `recommendation.*` | `duksh` | `recommendation-team` | Next-move ranking and explainability |
| `community.*` | `duksh` | `governance-office` + `docs-team` | Community lane governance controls |

## MCP release gate checklist (`F2-TASK-036`)

Before merge/release for MCP-surface changes:

1. Capabilities handshake payload includes current namespace/tool surface.
2. Common context envelope fields are present and schema-valid.
3. Alias parity fixture set updated for changed/added tools.
4. Telemetry events (`mcp.tool.call`, `mcp.tool.result`, `mcp.alias.call`) emitted with required fields.
5. Contract drift checks are green.
6. Security/SBOM gate is green for release-facing branches.
7. Evidence artifacts are attached in CI and issue/PR references.

## Current implementation anchors

- `services/mcp/README.md`
- `services/mcp/src/mcp/capabilities.ts`
- `services/mcp/src/mcp/context.ts`
- `services/mcp/src/mcp/types.ts`
- `services/mcp/src/billing/types.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- `tests/contracts/fixtures/mcp/`
- `scripts/validate-legacy-alias-parity.py`
