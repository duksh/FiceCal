# F2-TASK-082 QA Evidence: Ingest Error Normalization

## Scope

Normalize billing ingest validation and runtime errors into shared contract categories for MCP and UI consumers.

## Artifacts

- `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- `services/mcp/src/billing/index.ts`
- `docs/billing-adapter-azure-contract.md`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- Added `BillingIngestError` and `BillingIngestErrorCode` with standardized category mapping.
- Validation failures now emit normalized error categories.
- Runtime adapter exceptions are mapped to normalized categories with adapter context.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
