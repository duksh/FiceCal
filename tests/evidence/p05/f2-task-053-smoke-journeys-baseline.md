# F2-TASK-053 QA Evidence: Smoke Journeys Baseline

## Scope

Publish and validate the baseline smoke journeys for P05 mode-aware UI coverage.

## Artifacts

- `tests/e2e/smoke-journeys.md`
- `docs/ui-foundation-hci-metrics-contract.md`
- `docs/qa-evidence-storage-convention.md`

## Commands

- `python3 scripts/validate-qa-evidence-policy.py`
- `npm run validate`

## Outcome

- P05 smoke journey baseline is documented with mode-specific coverage (`quick`, `operator`, `architect`, mode-switch, degraded-path).
- QA evidence policy validator confirms the baseline evidence file structure and checklist markers.
- Root validation chain remains green after adding P05 evidence baseline.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
