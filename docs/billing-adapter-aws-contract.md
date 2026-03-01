# Billing Adapter AWS Contract (P07)

## 1. Purpose

Define the AWS billing adapter read-only ingest contract, retry/rate-limit strategy baseline,
and mapping profile conventions.

## 2. Scope

This contract covers:

- `F2-STORY-072` Implement AWS real ingestion
- `F2-TASK-076` Implement retry and rate-limit strategy
- `F2-TASK-081` Document provider-specific mapping profiles

## 3. Request contract

Adapter ID: `aws-billing`

Required request fields:

- `integrationRunId`
- `startDate`
- `endDate`
- `currency`
- `mappingProfile`

Optional fields:

- `credentialRef` (required in stage/prod)
- `authMode` (`read-only` only)
- `accountScope` (array of account IDs)

Validation rules:

1. `authMode` must be `read-only` when provided.
2. `credentialRef` must be a string when provided.
3. `accountScope` must be an array of non-empty strings when provided.

## 4. Canonical output contract

Canonical metrics emitted:

- `infraTotal`
- `cudPct`
- `budgetCap`
- `nRef`

Provenance requirements:

- `sourceVersion` starts with `aws-readonly-`
- `coveragePct` numeric
- `mappingConfidence` in `low|medium|high`
- `warnings` includes retry policy baseline entry

## 5. Retry and rate-limit strategy (`F2-TASK-076`)

Baseline strategy:

- max retry attempts: `3`
- exponential backoff base: `250ms`
- deterministic rate-limit simulation flag for fixture-safe repeatability

Behavior contract:

1. Retry policy metadata is always emitted in provenance warnings.
2. When rate-limit fallback is triggered, warning includes attempts and backoff schedule.
3. Adapter never escalates to write mode; read-only safety is preserved.

## 6. Mapping profile baseline (`F2-TASK-081`)

Current profile namespace:

- `default-aws-billing-v1`

Profile expectations:

1. Stable deterministic service weighting for canonical normalization.
2. Mapping profile changes require fixture updates in the same PR.
3. New profile versions use immutable naming (for example `default-aws-billing-v2`).

## 7. Validation anchors

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## 8. Related documents

- `docs/billing-direct-integration-contract.md`
- `docs/environment-secret-management-contract.md`
- `docs/provider-sdk-integration-strategy.md`
- `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/`
