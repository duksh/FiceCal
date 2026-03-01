# F2-TASK-075 QA Evidence: Tier-1 Credentials Contract

## Scope

Define and operationalize the credential and secret-handling contract for tier-1 billing adapters with read-only enforcement.

## Artifacts

- `docs/environment-secret-management-contract.md`
- `docs/billing-direct-integration-contract.md`
- `.env.example`
- `services/mcp/src/billing/types.ts`
- `scripts/validate-billing-canonical-handoff.py`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- Credential policy documented around `credentialRef` indirection and no raw secret payloads.
- `authMode` contract explicitly constrained to `read-only` baseline.
- Fixture and validator checks enforce allowed auth mode and OpenOps baseline source version.
- Environment example includes secret-resolution key placeholders without exposing secrets.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
