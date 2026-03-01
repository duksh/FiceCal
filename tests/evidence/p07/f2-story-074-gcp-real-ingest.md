# F2-STORY-074 QA Evidence: GCP Real Ingest Baseline

## Scope

Implement GCP billing adapter real-ingest baseline with deterministic non-zero canonical mapping, read-only auth controls, and recommender-ready provenance.

## Artifacts

- `services/mcp/src/billing/adapters/gcp.ts`
- `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/request.valid.json`
- `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/response.expected.json`
- `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/notes.md`
- `docs/billing-adapter-gcp-contract.md`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- GCP adapter now emits deterministic non-zero canonical values and read-only provenance output.
- Payload validation enforces auth mode, billing account scope shape, and providerScope object constraints.
- Fixture pack for `billing.gcp.ingest` reflects real-ingest baseline behavior.

## Proof Artifacts

- log: `[billing-canonical-handoff] OK: validated 4 billing tool fixture packs`
- log: `[validate] OK: root validation chain passed`

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
