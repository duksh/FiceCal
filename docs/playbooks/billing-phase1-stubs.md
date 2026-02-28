# Billing Phase 1 Stub Playbook (OpenOps + AWS + Azure + GCP)

This playbook defines the initial MCP billing adapter stubs in the monorepo blueprint.

## Scope

Phase 1 includes only:

- `billing.openops.ingest`
- `billing.aws.ingest`
- `billing.azure.ingest`
- `billing.gcp.ingest`

## Source files

- `services/mcp/src/billing/types.ts`
- `services/mcp/src/billing/registry.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- `services/mcp/src/billing/adapters/openops.ts`
- `services/mcp/src/billing/adapters/aws.ts`
- `services/mcp/src/billing/adapters/azure.ts`
- `services/mcp/src/billing/adapters/gcp.ts`

## Fixture skeletons

- `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/*`
- `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/*`
- `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/*`
- `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/*`

Each tool fixture set includes:

- `request.valid.json`
- `request.invalid.json`
- `response.expected.json`
- `notes.md`

## Upgrade path to real SDK integrations

1. Replace adapter stub warning with actual provider SDK/API calls.
2. Keep `mapToCanonical()` contract output stable.
3. Increase provenance confidence/coverage from stub defaults.
4. Add provider-specific retry, pagination, and rate-limit controls.
5. Expand fixtures with edge-case payloads (currency variance, partial fields, schema drift).

## Governance checks

- contract updates + fixture changes in same PR
- security and dependency checks green
- no secrets or absolute local paths
- sponsor/CODEOWNER approvals
