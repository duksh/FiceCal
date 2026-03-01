# Billing Provider Onboarding Plug-in Playbook (P07.5)

## 1. Purpose

Define a repeatable onboarding workflow for adding new cloud providers without mutating shared billing core contracts.

## 2. Scope

Applies to provider onboarding after P07 baseline:

- `F2-TASK-084` Harden adapter registry for plugin onboarding
- `F2-TASK-085` Introduce generic provider scope envelope
- `F2-TASK-086` Document provider onboarding plug-in playbook

## 3. Onboarding checklist

1. Implement adapter module under `services/mcp/src/billing/adapters/`.
2. Ensure adapter ID follows `*-billing` format.
3. Register adapter via `registerBillingAdapter` or `registerBillingAdapters`.
4. Add provider-specific fixture pack under `tests/contracts/fixtures/mcp/billing.<provider>.ingest/1.0/`.
5. Add or extend validator expectations (`scripts/validate-billing-canonical-handoff.py`) for provider invariants.
6. Document provider contract (`docs/billing-adapter-<provider>-contract.md`).
7. Add evidence artifacts under `tests/evidence/p07/` with fail/fix/retest summary.
8. Add live smoke config entry in `tests/contracts/live-smoke/billing-live-smoke.config.json`.
9. Define provider smoke command contract (`providerTotal`, `canonicalTotal`, `currency`) for `scripts/run-billing-live-smoke.py`.
10. Ensure provider participates in reconciliation gate (`scripts/validate-billing-live-reconciliation.py`).

## 4. Scope and payload guidance

- Use shared fields where reusable (`accountScope`, `subscriptionScope`, `billingAccountScope`, etc.).
- Use `providerScope` for provider-unique metadata to avoid expanding shared top-level request shape.
- Keep provider-specific parsing and validation inside adapter layer.

## 5. Resolver mode policy

- Local/dev: `BILLING_ADAPTER_RESOLUTION_MODE=fallback` allowed.
- Stage/prod: `BILLING_ADAPTER_RESOLUTION_MODE=strict` required.
- Unknown provider IDs in strict mode are treated as validation failures.

## 6. Contract and quality gates

Required checks before merge:

1. `python3 scripts/validate-billing-canonical-handoff.py`
2. `python3 scripts/validate-billing-live-readiness.py`
3. `python3 scripts/run-billing-live-smoke.py --mode dry-run`
4. `python3 scripts/validate-billing-live-reconciliation.py --allow-skipped`
5. `npm run validate`
6. Contract + fixtures + evidence shipped together in the same PR.

## 7. Security rules

- Never include raw secrets in request payloads, fixtures, or evidence artifacts.
- Use `credentialRef` indirection only.
- Keep `authMode` as `read-only` for ingest baseline.

## 8. Related references

- `docs/billing-direct-integration-contract.md`
- `docs/playbooks/billing-live-integration-readiness.md`
- `docs/provider-sdk-integration-strategy.md`
- `docs/environment-secret-management-contract.md`
