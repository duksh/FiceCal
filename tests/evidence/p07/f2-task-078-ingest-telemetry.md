# F2-TASK-078 QA Evidence: Ingest Telemetry

## Scope

Emit ingest telemetry events for run status and canonical mapping summary across billing adapters.

## Artifacts

- `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- `services/mcp/src/billing/telemetry.ts`
- `services/mcp/src/billing/index.ts`
- `docs/billing-direct-integration-contract.md`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- `billing.run` telemetry emitted for success/failure outcomes.
- `billing.mapping.summary` telemetry emitted with canonical rollup fields and confidence metadata.
- Telemetry events include context and fallback metadata for troubleshooting.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
