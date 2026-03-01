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

## Contract and fixture version mapping (`F2-TASK-066`)

| MCP tool | Adapter ID | Fixture version path | Schema/contract version | Notes anchor |
|---|---|---|---|---|
| `billing.openops.ingest` | `openops-billing` | `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/` | `1.0` | `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/notes.md` |
| `billing.aws.ingest` | `aws-billing` | `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/` | `1.0` | `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/notes.md` |
| `billing.azure.ingest` | `azure-billing` | `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/` | `1.0` | `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/notes.md` |
| `billing.gcp.ingest` | `gcp-billing` | `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/` | `1.0` | `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/notes.md` |

Versioning rules:

1. `1.0` fixture folders are immutable once published.
2. Any behavioral contract change requires a new version folder (for example `1.1`) and updated notes.
3. Contract document, fixture pack update, and validation evidence must ship in the same PR.

## Operationalization checklist (`F2-TASK-065`)

Use this checklist when updating phase-1 stubs:

1. Confirm adapter ID + tool namespace alignment in:
   - `services/mcp/src/billing/types.ts`
   - `services/mcp/src/billing/registry.ts`
2. Keep routing deterministic via resolver guard + fallback behavior.
3. Ensure canonical handoff fields remain contract-compliant:
   - `integrationRunId`, `providerAdapterId`, `scope`, `canonical`, `provenance`
4. Update fixture files (`request.valid`, `request.invalid`, `response.expected`, `notes.md`) when behavior changes.
5. Run validation anchors:
   - `python3 scripts/validate-billing-canonical-handoff.py`
   - `python3 scripts/validate-fixture-coverage.py`
   - `npm run validate`
6. Publish evidence in `tests/evidence/p06/` before marking tasks done.

## Upgrade path to real SDK integrations

1. Replace adapter stub warning with actual provider SDK/API calls.
2. Keep `mapToCanonical()` contract output stable.
3. Increase provenance confidence/coverage from stub defaults.
4. Add provider-specific retry, pagination, and rate-limit controls.
5. Expand fixtures with edge-case payloads (currency variance, partial fields, schema drift).

## Tier-1 cutover checklist (`F2-TASK-083`)

Before production cutover, complete:

1. `docs/playbooks/billing-tier1-cutover-checklist.md`
2. `python3 scripts/validate-billing-canonical-handoff.py`
3. `npm run validate`
4. Stage/prod resolver mode set to strict:
   - `BILLING_ADAPTER_RESOLUTION_MODE=strict`

## Governance checks

- contract updates + fixture changes in same PR
- security and dependency checks green
- no secrets or absolute local paths
- sponsor/CODEOWNER approvals

## Evidence anchors

- `tests/evidence/p06/f2-task-063-registry-routing-hardening.md`
- `tests/evidence/p06/f2-task-064-canonical-handoff-validation.md`
- `tests/evidence/p06/f2-task-065-phase1-stub-playbook.md`
- `tests/evidence/p06/f2-task-066-stub-fixture-version-mapping.md`
