# F2-TASK-077 QA Evidence: Pagination and Incremental Sync

## Scope

Implement and validate Azure adapter pagination and incremental sync baseline for P07.

## Artifacts

- `services/mcp/src/billing/adapters/azure.ts`
- `docs/billing-adapter-azure-contract.md`
- `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/response.expected.json`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- Pagination baseline configured with deterministic page size and page count metadata.
- Provenance warnings include pagination policy and incremental sync baseline entries.
- Canonical output remains deterministic for repeated runs with unchanged inputs.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
