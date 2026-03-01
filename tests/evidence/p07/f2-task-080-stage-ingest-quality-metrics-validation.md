# F2-TASK-080 QA Evidence: Stage Ingest Quality Metrics Validation

## Scope

Implement and validate the live-ingest readiness baseline for tier-1 billing providers (OpenOps, AWS, Azure, GCP), including credential wiring, smoke orchestration, release gating, and reconciliation checks.

## Artifacts

- `docs/playbooks/billing-live-integration-readiness.md`
- `tests/contracts/live-smoke/billing-live-smoke.config.json`
- `scripts/validate-billing-live-readiness.py`
- `scripts/run-billing-live-smoke.py`
- `scripts/validate-billing-live-reconciliation.py`
- `.github/workflows/billing-live-smoke.yml`
- `.github/workflows/release.yml`

## Commands

- `python3 scripts/validate-billing-live-readiness.py`
- `python3 scripts/run-billing-live-smoke.py --mode dry-run`
- `python3 scripts/validate-billing-live-reconciliation.py --allow-skipped`
- `npm run validate`

## Outcome

- Live readiness contract now defines all seven controls from readiness criteria through release reconciliation gates.
- Tier-1 provider live smoke orchestration is executable in dry-run mode and ready for sandbox live command wiring.
- Release workflow now enforces a mandatory live smoke + reconciliation gate before tag/release creation.
- Local and live environment templates now include credential-reference and ingest-mode keys required for controlled rollout.

## Proof Artifacts

- log: `tests/evidence/artifacts/20260301T174514Z-billing-live-readiness.log` (sha256: `d6079a1c1982f32caa1b84f5c4ad4cc791b83e78498953221e28e7886dbbe813`)
- log: `tests/evidence/artifacts/20260301T174514Z-billing-live-smoke.log` (sha256: `f2a9c28370792449aee6e4e78ea9b716d5c4c107dc62b54660b19706341829ed`)
- log: `tests/evidence/artifacts/20260301T174514Z-billing-live-smoke-report.json` (sha256: `392c8a667a8dc7e74ee9044c5756a70cbd243dd0822cef957b951d0f9c7f3370`)
- log: `tests/evidence/artifacts/20260301T174514Z-billing-live-reconciliation.log` (sha256: `8f0a7d383098314116b8ef6035ed50cbea110de10b89bb070b2523c2ed288db1`)
- log: `tests/evidence/artifacts/20260301T174514Z-npm-validate.log` (sha256: `94db44cbd282c89f4e1974f7dd3ee4ac501509ce8f1f75d207902a7de588c8a8`)

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
