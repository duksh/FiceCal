# Provider SDK Integration Strategy (P02/P07)

## Purpose

Define how provider SDK/API integrations are isolated from core runtime contracts so provider-specific types never leak into canonical FiceCal interfaces.

## Scope

- `F2-STORY-022` Enforce adapter isolation pattern
- `F2-TASK-025` Document API boundary do-not-cross rules
- Downstream implementation phases: `P06` and `P07`

## Design principle

Provider SDKs are implementation details. Canonical contracts are the product interface.

All ingress/egress between provider adapters and core runtime must flow through explicit mapping boundaries.

## Layer model

1. **Provider adapter layer**
   - Talks to external SDKs/APIs.
   - Converts raw provider payloads into internal adapter DTOs.
2. **Canonical mapping layer**
   - Maps adapter DTOs to canonical contract shapes.
   - Applies normalization (currency, timestamps, identifiers, enums).
3. **Core runtime layer**
   - Consumes canonical contracts only.
   - Must be provider-agnostic.

## API boundary do-not-cross rules (F2-TASK-025)

Do not allow any of the following beyond adapter/mapping boundaries:

- provider SDK classes or SDK-specific response objects
- provider-specific enum/value namespaces in canonical outputs
- provider auth token structures in runtime or UI-facing payloads
- provider pagination artifacts (raw continuation tokens, page objects) without canonical normalization
- provider error object shapes without normalized error mapping

## Required canonical mapping fields

Each mapped provider payload must include canonical metadata:

- `providerId`
- `sourceVersion`
- `evidenceRef`
- `collectedAt`
- `mappingProfileVersion`

## P07 mapping profile baseline (`F2-TASK-081`)

Initial tier-1 profile namespaces:

- OpenOps: `default-openops-billing-v1`
- AWS: `default-aws-billing-v1`
- Azure: `default-azure-billing-v1`
- GCP: `default-gcp-billing-v1`

Versioning rules:

1. Profile names are immutable once referenced by released fixtures.
2. Behavioral mapping changes require a new profile version suffix (`v2`, `v3`, ...).
3. Contract + fixture + evidence deltas must land in the same PR.

## P07.5 provider plug-in hardening baseline

Registration controls:

1. New providers register via `registerBillingAdapter` / `registerBillingAdapters`.
2. Adapter IDs must follow `*-billing` format.
3. Built-in provider map literals are no longer required for every future provider.

Resolution controls:

1. Resolver supports `fallback` and `strict` unknown-provider modes.
2. `BILLING_ADAPTER_RESOLUTION_MODE=strict` is recommended for stage/prod.
3. Production defaults to strict mode unless explicitly overridden.

Scope controls:

1. Provider-specific scope values can be supplied using `providerScope` envelope.
2. Avoid adding new top-level request keys for every new provider unless contract-wide reuse is justified.

## Error normalization contract

Provider failures must be normalized into shared categories before crossing boundaries:

- `auth_error`
- `permission_error`
- `rate_limit`
- `timeout`
- `upstream_unavailable`
- `validation_error`
- `unknown_runtime_error`

## Security and privacy guardrails

- Never log raw credentials, secrets, or authorization headers.
- Store provider credentials only in approved secret stores.
- Apply least-privilege scopes for all read paths.
- Ensure artifacts/screenshots do not expose sensitive provider identifiers.

## Verification checklist

For each adapter PR:

1. Confirm no SDK types appear in canonical contract files.
2. Confirm canonical fixtures include mapped outputs only.
3. Confirm provider-specific errors are normalized.
4. Confirm retry/pagination behavior is encapsulated in adapter layer.
5. Confirm contract drift checks pass.

## Release gating implications

- Any contract-affecting mapping change requires fixture updates in the same PR.
- Any boundary violation is treated as contract drift and blocks merge.
- Provider integration cannot be promoted to release-ready without boundary checklist evidence.
