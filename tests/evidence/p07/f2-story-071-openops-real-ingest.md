# F2-STORY-071 QA Evidence: OpenOps Real Ingest Baseline

## Scope

Implement the OpenOps billing adapter real-ingest baseline with deterministic non-zero canonical mapping while preserving read-only safety constraints.

## Artifacts

- `services/mcp/src/billing/adapters/openops.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- `services/mcp/src/billing/types.ts`
- `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/request.valid.json`
- `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/response.expected.json`
- `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/notes.md`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- OpenOps adapter now emits deterministic non-zero canonical values from scoped input.
- Provenance now uses `openops-readonly-v1.0.0` with `medium` confidence baseline.
- Ingest payload carries credential and scope metadata into adapter validation.
- Fixture pack for `billing.openops.ingest` reflects read-only ingest baseline output.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
