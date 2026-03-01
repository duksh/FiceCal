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
- `F2-STORY-072` Implement AWS real ingestion
- `F2-STORY-073` Implement Azure real ingestion
- `F2-STORY-074` Implement GCP real ingestion
- `F2-TASK-075` Define credentials contract for tier-1 providers
- `F2-TASK-076` Implement retry and rate-limit strategy
- `F2-TASK-077` Implement pagination and incremental sync
- `F2-TASK-078` Add integration telemetry for ingest runs
- `F2-TASK-079` Expand provider-specific fixture coverage
- `F2-TASK-081` Document provider-specific mapping profiles
- `F2-TASK-082` Add ingest error normalization
- `F2-TASK-083` Create tier-1 cutover checklist
- `F2-TASK-084` Harden adapter registry for plugin onboarding
- `F2-TASK-085` Introduce generic provider scope envelope
- `F2-TASK-086` Document provider onboarding plug-in playbook

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

## 8. AWS real-ingest baseline (`F2-STORY-072`, `F2-TASK-076`)

Baseline implementation requirements:

1. AWS adapter emits deterministic non-zero canonical snapshot fields.
2. Provenance source version uses `aws-readonly-*` namespace.
3. Retry/rate-limit policy baseline is declared in provenance warnings.
4. Fixture baseline for `billing.aws.ingest` reflects read-only credential and retry controls.

## 9. Mapping profile governance (`F2-TASK-081`)

1. Provider profile namespaces are versioned and immutable once released.
2. Profile changes require fixture deltas and evidence in the same PR.
3. AWS profile baseline is documented in `docs/billing-adapter-aws-contract.md`.

## 10. Azure real-ingest baseline (`F2-STORY-073`, `F2-TASK-077`)

Baseline implementation requirements:

1. Azure adapter emits deterministic non-zero canonical snapshot fields.
2. Provenance source version uses `azure-readonly-*` namespace.
3. Pagination and incremental-sync baseline is declared in provenance warnings.
4. Fixture baseline for `billing.azure.ingest` reflects read-only credential and pagination controls.

## 11. Error normalization baseline (`F2-TASK-082`)

1. Billing ingest validation and runtime failures map to normalized error codes.
2. Normalized error payload includes adapter identity context.
3. `BillingIngestError` surface is exported for MCP/UI consumers.

## 12. Provider plug-in registry baseline (`F2-TASK-084`)

1. Adapter IDs follow `*-billing` format and are validated at registration time.
2. Registry supports runtime `registerBillingAdapter`/`registerBillingAdapters` without editing core map literals.
3. Unknown adapter resolution supports strict mode via `BILLING_ADAPTER_RESOLUTION_MODE=strict`.
4. Production default resolution mode is strict unless explicitly overridden.

## 13. Generic provider scope envelope (`F2-TASK-085`)

1. Shared request contract includes optional `providerScope: Record<string, unknown>`.
2. Provider-specific scoping metadata can be passed without adding new top-level request keys.
3. Ingest payload handoff includes `providerScope` for adapter-local validation.

## 14. Provider onboarding playbook baseline (`F2-TASK-086`)

1. Onboarding checklist defines adapter registration, fixture pack, validator, and evidence requirements.
2. New providers can be integrated without mutating shared union type lists.
3. Strict-mode rollout guidance is documented for stage/prod promotion.

## 15. GCP real-ingest baseline (`F2-STORY-074`)

1. GCP adapter emits deterministic non-zero canonical snapshot fields.
2. Provenance source version uses `gcp-readonly-*` namespace.
3. Provenance warnings include telemetry baseline and recommender-ready baseline entries.
4. Fixture baseline for `billing.gcp.ingest` reflects read-only credential and providerScope envelope controls.

## 16. Ingest telemetry baseline (`F2-TASK-078`)

1. Ingest flow emits `billing.run` telemetry for success/failure.
2. Ingest flow emits `billing.mapping.summary` telemetry with canonical rollup context.
3. Telemetry includes request/trace/workspace context and fallback metadata.

## 17. Provider fixture expansion baseline (`F2-TASK-079`)

1. Tier-1 fixture packs include provider-specific edge-case requests.
2. Edge-case fixture additions preserve existing `1.0` request/response contract anchors.
3. Fixture notes document each added edge-case scenario.

## 18. Tier-1 cutover checklist baseline (`F2-TASK-083`)

1. Checklist captures pre-cutover validation, security, telemetry, and rollback checkpoints.
2. Checklist includes stage strict-mode resolver guard (`BILLING_ADAPTER_RESOLUTION_MODE=strict`).
3. Checklist must be completed before replacing remaining tier-1 stubs.

## 19. Validation command anchors

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## 20. Exit criteria for P06-P07 foundation slice

P06-P07 foundation slice is ready when:

1. Registry routing behavior is deterministic with safe defaults.
2. Shared adapter interface contract remains provider-neutral.
3. Canonical handoff checks are executable against fixture baselines.
4. Tier-1 credential policy is documented and enforceable via adapter validation.
5. Tier-1 real-ingest baselines (OpenOps + AWS + Azure) are contract-validated with deterministic fixtures.
6. Ingest error normalization is available for adapter validation and runtime failures.
7. Provider onboarding path is plug-in capable with strict unknown-provider guardrails.
8. Tier-1 real-ingest baselines include GCP with telemetry and recommender-ready provenance.
9. Tier-1 provider fixture packs include documented edge-case scenarios.
10. Tier-1 cutover checklist is published and ready for stage/prod rollout governance.
