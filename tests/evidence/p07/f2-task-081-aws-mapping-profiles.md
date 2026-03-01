# F2-TASK-081 QA Evidence: AWS Mapping Profiles Contract

## Scope

Document AWS mapping profile conventions and validation expectations for provider-specific canonical normalization.

## Artifacts

- `docs/billing-adapter-aws-contract.md`
- `docs/provider-sdk-integration-strategy.md`
- `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/notes.md`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- AWS mapping profile namespace and immutable versioning guidance documented.
- Contract explicitly ties mapping profile changes to fixture update requirements.
- Validation anchors and ownership references are in place for P07 maintenance.

## Proof Artifacts

- log: `[billing-canonical-handoff] OK: validated 4 billing tool fixture packs`
- log: `[validate] OK: root validation chain passed`

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
