# MCP Service (Blueprint Stub)

This service folder contains Phase 1 billing ingestion stubs for provider adapters.

## Included Phase 1 tools

- `billing.openops.ingest`
- `billing.aws.ingest`
- `billing.azure.ingest`
- `billing.gcp.ingest`

## MCP v2 baseline surface

- `mcpCapabilitiesGet()` capability handshake helper
- shared MCP context envelope types and validators (`services/mcp/src/mcp/`)
- v2 billing tool entrypoints that consume context envelopes

## Source layout

```text
services/mcp/src/billing/
  adapters/
  tools/
  types.ts
  registry.ts
  index.ts
```

These are contract-aligned stubs (not production SDK integrations yet).
