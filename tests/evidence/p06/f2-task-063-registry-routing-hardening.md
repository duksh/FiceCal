# F2-TASK-063 QA Evidence: Registry and Routing Hardening

## Scope

Harden billing adapter registry resolution so adapter routing is deterministic and safe when non-canonical adapter IDs are provided.

## Artifacts

- `services/mcp/src/billing/registry.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- `services/mcp/src/billing/index.ts`
- `docs/billing-direct-integration-contract.md`

## Commands

- `npm run validate`

## Outcome

- Registry now exposes `isBillingAdapterId` and `resolveBillingAdapter` to support guarded resolution.
- Resolver metadata includes `requestedAdapterId`, `resolvedAdapterId`, and `usedFallback`.
- Unknown adapter IDs now route through deterministic fallback (`openops-billing`) instead of ambiguous behavior.
- Ingest payload routing now uses `resolvedAdapterId` to ensure canonical routing consistency.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
