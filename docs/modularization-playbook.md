# Modularization Playbook (P02)

## Purpose

Define FiceCal v2 core runtime boundaries and fallback behavior so optional module failures never break the core user experience.

## Scope

- `F2-EPIC-020` Core runtime boundaries and module baseline
- `F2-STORY-021` Define domain-owned interfaces
- `F2-TASK-024` Define module failure fallback policy

## Module classes

1. **Core modules (required)**
   - Provide canonical contracts and execution orchestration.
   - Failure is blocking and must fail fast with explicit error classification.
2. **Optional modules (non-blocking)**
   - Add enrichment, recommendations, provider-specific enhancements, or community extensions.
   - Failure must degrade gracefully to a stable fallback response.

## Domain ownership boundaries

- **Core economics** owns canonical cost model and base calculations.
- **Schemas** owns canonical request/response shapes and compatibility expectations.
- **Feature registry** owns module discoverability and activation metadata.
- **MCP tooling** owns tool orchestration and external-facing execution envelope.
- **Integrations / community modules** must map into canonical contracts and cannot redefine them.

## Optional-module fallback policy (F2-TASK-024)

When an optional module fails, follow this deterministic sequence:

1. Capture failure with normalized category:
   - `auth_error`
   - `timeout_or_rate_limit`
   - `validation_error`
   - `runtime_error`
2. Preserve core flow and continue execution without optional output.
3. Return fallback output shape with:
   - `status: degraded`
   - `fallbackApplied: true`
   - `failedModuleIds: []`
   - `reasonCodes: []`
4. Emit traceable telemetry for each degraded branch.
5. Record evidence for QA in the related issue/PR.

## Fallback matrix

| Module type | Failure impact | User-facing behavior | Release impact |
|---|---|---|---|
| Core required module | Blocking | Explicit error state, no silent fallback | Blocks phase closure until fixed |
| Optional internal module | Non-blocking | Continue with degraded but valid response | Allowed if fallback evidence exists |
| Optional provider/community module | Non-blocking | Continue with core-only response and warning metadata | Allowed if boundary rules remain intact |

## Implementation guardrails

- Optional modules must be invoked behind feature flags or registry checks.
- Optional module outputs must be treated as additive; never required for canonical response validity.
- Fallback responses must remain schema-compliant with canonical contracts.
- No direct SDK/provider types may escape optional module boundaries.

## QA evidence expectations

For changes touching optional-module fallback behavior:

1. Provide at least one failing-path test run with fallback applied.
2. Provide one retest proving stable degraded behavior.
3. Link evidence artifacts in PR summary and issue fields.

## Exit criteria anchors

- Core and optional module boundaries are explicit and documented.
- Optional module failure does not break core user journeys.
- Fallback responses remain contract-compliant and test-evidenced.
