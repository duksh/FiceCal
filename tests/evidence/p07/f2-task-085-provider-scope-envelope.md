# F2-TASK-085 QA Evidence: Generic Provider Scope Envelope

## Scope

Introduce provider-agnostic scope envelope support to reduce shared contract churn for future provider onboarding.

## Artifacts

- `services/mcp/src/billing/types.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- `docs/billing-direct-integration-contract.md`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- `BillingIngestRequest` now supports optional `providerScope` envelope.
- Ingest payload handoff includes `providerScope` for adapter-local parsing.
- Contract guidance documents envelope usage and guardrails.

## Proof Artifacts

- log: `[billing-canonical-handoff] OK: validated 4 billing tool fixture packs`
- log: `[validate] OK: root validation chain passed`

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
