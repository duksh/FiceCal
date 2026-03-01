# Billing Direct Integration Contract (P06-P07)

## 1. Purpose

Define the shared billing adapter interfaces, routing behavior, canonical handoff validation checks,
and tier-1 read-only ingest credential policy for P06-P07 baseline delivery.

## 2. Scope

This contract covers:

- `F2-EPIC-060` Billing adapter framework foundation
- `F2-STORY-061` Finalize shared billing adapter interfaces
- `F2-TASK-063` Harden registry and adapter routing
- `F2-TASK-064` Define canonical handoff validation checks
- `F2-STORY-071` Implement OpenOps real ingestion
- `F2-TASK-075` Define credentials contract for tier-1 providers

## 3. Shared adapter interface contract

Implementation anchors:

- `services/mcp/src/billing/types.ts`
- `services/mcp/src/billing/registry.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`

Required interface invariants:

1. Every adapter declares a stable `adapterId` from `BillingAdapterId`.
2. Every adapter supports the same lifecycle methods:
   - `discoverAccounts`
   - `fetchBillingPeriod`
   - `validateBillingPayload`
   - `mapToCanonical`
   - `emitProvenance`
3. Canonical handoff output shape is stable across providers.

## 4. Adapter registry routing contract (`F2-TASK-063`)

Routing requirements:

1. Adapter resolution supports `BillingAdapterId | string` inputs.
2. Unknown adapter identifiers must resolve to deterministic fallback adapter:
   - default: `openops-billing`
3. Resolver returns metadata for observability:
   - `requestedAdapterId`
   - `resolvedAdapterId`
   - `usedFallback`
4. Ingest payloads must use `resolvedAdapterId` to avoid route ambiguity.

## 5. Canonical handoff validation checks (`F2-TASK-064`)

Canonical handoff checks for phase-1 fixture baselines:

1. Required top-level keys exist:
   - `integrationRunId`, `providerAdapterId`, `scope`, `canonical`, `provenance`
2. Scope keys exist and are non-empty strings:
   - `startDate`, `endDate`, `currency`
3. Canonical metric keys are numbers:
   - `infraTotal`, `cudPct`, `budgetCap`, `nRef`
4. Provenance keys are valid:
   - `sourceVersion` non-empty string
   - `coveragePct` number
   - `mappingConfidence` one of `low|medium|high`
   - `warnings` array of strings
5. `providerAdapterId` must align with tool fixture namespace.

## 6. Tier-1 credential policy baseline (`F2-TASK-075`)

Credential rules for tier-1 adapters:

1. `credentialRef` is an opaque identifier only (no raw secrets in request payloads).
2. `authMode` is constrained to `read-only` for P07 ingest baseline.
3. Adapter payload validation must reject unsupported auth modes.
4. OpenOps baseline accepts missing `credentialRef` in local/dev but emits provenance warning.
5. Stage/prod runs require non-empty `credentialRef` backed by secret manager indirection.

## 7. OpenOps real-ingest baseline (`F2-STORY-071`)

Baseline implementation requirements:

1. OpenOps adapter emits deterministic non-zero canonical snapshot fields.
2. Provenance source version uses `openops-readonly-*` namespace.
3. Fixture baseline for `billing.openops.ingest` reflects read-only credential contract.
4. Canonical handoff validation script enforces OpenOps real-ingest invariants.

## 8. Validation command anchors

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## 9. Exit criteria for P06-P07 foundation slice

P06-P07 foundation slice is ready when:

1. Registry routing behavior is deterministic with safe defaults.
2. Shared adapter interface contract remains provider-neutral.
3. Canonical handoff checks are executable against fixture baselines.
4. Tier-1 credential policy is documented and enforceable via adapter validation.
