# F2-TASK-064 QA Evidence: Canonical Handoff Validation Checks

## Scope

Define and enforce canonical handoff validation checks for phase-1 billing ingest fixture baselines.

## Artifacts

- `docs/billing-direct-integration-contract.md`
- `scripts/validate-billing-canonical-handoff.py`
- `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/`
- `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/`
- `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/`
- `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- Canonical handoff checks are executable and deterministic for all phase-1 billing tools.
- Validation asserts adapter identity alignment, request/response scope consistency, canonical metric types, and provenance constraints.
- Validation is wired into root `npm run validate` chain.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
