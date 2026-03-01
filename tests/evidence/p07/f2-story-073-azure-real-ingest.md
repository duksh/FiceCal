# F2-STORY-073 QA Evidence: Azure Real Ingest Baseline

## Scope

Implement Azure billing adapter real-ingest baseline with deterministic non-zero canonical mapping and read-only auth enforcement.

## Artifacts

- `services/mcp/src/billing/adapters/azure.ts`
- `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/request.valid.json`
- `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/response.expected.json`
- `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/notes.md`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- Azure adapter now emits deterministic non-zero canonical values and read-only provenance output.
- Adapter payload validation enforces auth mode and subscription scope shape constraints.
- Fixture pack for `billing.azure.ingest` reflects Azure read-only real-ingest baseline.

## Proof Artifacts

- log: `[billing-canonical-handoff] OK: validated 4 billing tool fixture packs`
- log: `[validate] OK: root validation chain passed`

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
