# F2-TASK-084 QA Evidence: Plugin Registry Hardening

## Scope

Harden billing adapter registry to support runtime provider registration and strict unknown-provider handling.

## Artifacts

- `services/mcp/src/billing/registry.ts`
- `services/mcp/src/billing/index.ts`
- `.env.example`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- Registry now supports `registerBillingAdapter` and `registerBillingAdapters` APIs.
- Adapter IDs are validated against `*-billing` format.
- Resolver supports strict mode for unknown providers with explicit resolution errors.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
