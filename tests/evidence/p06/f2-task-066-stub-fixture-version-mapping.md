# F2-TASK-066 QA Evidence: Stub Fixture Version Mapping

## Scope

Define and validate fixture-to-contract version mapping for phase-1 billing ingest tools.

## Artifacts

- `docs/playbooks/billing-phase1-stubs.md`
- `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/`
- `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/`
- `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/`
- `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `python3 scripts/validate-fixture-coverage.py`
- `npm run validate`

## Outcome

- Fixture mapping matrix for all phase-1 billing tools is documented with adapter IDs, version paths, and notes anchors.
- Versioning policy for immutable fixture folders and change-triggered version bumps is published.
- Contract + fixture + evidence coupling requirement is explicit for future updates.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
