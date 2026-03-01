# F2-TASK-086 QA Evidence: Provider Onboarding Plug-in Playbook

## Scope

Document repeatable plug-in onboarding workflow for adding future cloud billing providers.

## Artifacts

- `docs/playbooks/billing-provider-onboarding-plugin.md`
- `docs/provider-sdk-integration-strategy.md`
- `docs/billing-direct-integration-contract.md`

## Commands

- `npm run validate`

## Outcome

- Onboarding playbook now defines adapter registration, fixture, validator, and evidence requirements.
- Strict/fallback resolver mode policy is documented for local vs stage/prod.
- Playbook reduces future provider integration overhead and shared contract churn.

## Proof Artifacts

- log: `tests/evidence/artifacts/20260301T171055Z-qa-evidence-policy.log` (sha256: `3d7b93a09cc4ff373afefab28a0ee4c14afaeaadd9abf1340f1d97b537ab0941`)
- log: `tests/evidence/artifacts/20260301T171055Z-npm-validate.log` (sha256: `8f31139696a7b785be0150cab2a42ad110c0c4c6304f95629e36d85348cda407`)

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
