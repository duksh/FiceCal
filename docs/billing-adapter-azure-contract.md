# Billing Adapter Azure Contract (P07)

## 1. Purpose

Define the Azure billing adapter read-only ingest contract, pagination/incremental sync baseline,
and ingest error normalization expectations.

## 2. Scope

This contract covers:

- `F2-STORY-073` Implement Azure real ingestion
- `F2-TASK-077` Implement pagination and incremental sync
- `F2-TASK-082` Add ingest error normalization

## 3. Request contract

Adapter ID: `azure-billing`

Required request fields:

- `integrationRunId`
- `startDate`
- `endDate`
- `currency`
- `mappingProfile`

Optional fields:

- `credentialRef` (required in stage/prod)
- `authMode` (`read-only` only)
- `subscriptionScope` (array of subscription IDs)

Validation rules:

1. `authMode` must be `read-only` when provided.
2. `credentialRef` must be a string when provided.
3. `subscriptionScope` must be an array of non-empty strings when provided.

## 4. Canonical output contract

Canonical metrics emitted:

- `infraTotal`
- `cudPct`
- `budgetCap`
- `nRef`

Provenance requirements:

- `sourceVersion` starts with `azure-readonly-`
- `coveragePct` numeric
- `mappingConfidence` in `low|medium|high`
- `warnings` include pagination and incremental sync baseline entries

## 5. Pagination + incremental sync baseline (`F2-TASK-077`)

Baseline strategy:

- deterministic page size: `5`
- pagination metadata emitted in provenance
- incremental sync anchored to requested billing window (`startDate`-`endDate`)

Behavior contract:

1. Pagination policy warning includes page size, page count, and total rows.
2. Incremental sync baseline warning is always present.
3. Canonical output remains stable for same input/profile scope.

## 6. Ingest error normalization baseline (`F2-TASK-082`)

Normalized error categories:

- `auth_error`
- `permission_error`
- `rate_limit`
- `timeout`
- `upstream_unavailable`
- `validation_error`
- `unknown_runtime_error`

Contract requirements:

1. Invalid payloads throw `BillingIngestError` with a normalized code.
2. Runtime adapter failures are mapped into normalized categories before surfacing.
3. Error payloads include adapter identity context.

## 7. Validation anchors

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## 8. Related documents

- `docs/billing-direct-integration-contract.md`
- `docs/environment-secret-management-contract.md`
- `docs/provider-sdk-integration-strategy.md`
- `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/`
