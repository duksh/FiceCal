# F2-TASK-083 QA Evidence: Tier-1 Cutover Checklist

## Scope

Publish operational checklist for tier-1 billing adapter cutover readiness.

## Artifacts

- `docs/playbooks/billing-tier1-cutover-checklist.md`
- `docs/playbooks/billing-phase1-stubs.md`
- `docs/environment-secret-management-contract.md`

## Commands

- `npm run validate`

## Outcome

- Checklist defines pre-cutover, security, telemetry, data-quality, rollback, and sign-off controls.
- Stage/prod strict resolver mode (`BILLING_ADAPTER_RESOLUTION_MODE=strict`) is explicitly required.
- Cutover governance path is documented for P07 completion and rollout approvals.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
