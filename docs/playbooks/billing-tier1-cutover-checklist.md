# Tier-1 Billing Adapter Cutover Checklist (P07)

Use this checklist before declaring tier-1 ingest cutover ready.

## 1. Scope

Applies to OpenOps, AWS, Azure, and GCP billing ingest adapters.

## 2. Pre-cutover controls

- [ ] Canonical fixture validation passes (`python3 scripts/validate-billing-canonical-handoff.py`)
- [ ] Full validation chain passes (`npm run validate`)
- [ ] Provider contracts updated and cross-linked
- [ ] Evidence artifacts exist for fail/fix/retest for all tier-1 stories/tasks

## 3. Security and credential controls

- [ ] `credentialRef` used for all stage/prod runs
- [ ] `authMode` constrained to `read-only`
- [ ] `.env` policy reviewed against `docs/environment-secret-management-contract.md`
- [ ] `BILLING_ADAPTER_RESOLUTION_MODE=strict` in stage/prod

## 4. Telemetry and observability controls

- [ ] `billing.run` events emitted for ingest success/failure
- [ ] `billing.mapping.summary` events emitted with mapping rollup
- [ ] Fallback resolution usage reviewed and approved (if any)

## 5. Data quality and mapping controls

- [ ] Non-zero canonical baselines verified for all tier-1 adapters
- [ ] Mapping confidence/coverage meets acceptance baseline
- [ ] Edge-case fixtures present for each tier-1 provider

## 6. Rollback readiness

- [ ] Cutover owner + rollback owner assigned
- [ ] Fallback strategy documented and tested
- [ ] Incident escalation path confirmed

## 7. Sign-off

- [ ] Integration lead sign-off
- [ ] QA lead sign-off
- [ ] Security lead sign-off
- [ ] Governance sign-off
