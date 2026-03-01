# Billing Adapter GCP Contract (P07)

## 1. Purpose

Define the GCP billing adapter read-only ingest contract, telemetry baseline,
and recommender-ready provenance expectations.

## 2. Scope

This contract covers:

- `F2-STORY-074` Implement GCP real ingestion
- `F2-TASK-078` Add integration telemetry for ingest runs
- `F2-TASK-079` Expand provider-specific fixture coverage

## 3. Request contract

Adapter ID: `gcp-billing`

Required request fields:

- `integrationRunId`
- `startDate`
- `endDate`
- `currency`
- `mappingProfile`

Optional fields:

- `credentialRef` (required in stage/prod)
- `authMode` (`read-only` only)
- `billingAccountScope` (array of billing account IDs)
- `providerScope` (object for provider-specific values)

Validation rules:

1. `authMode` must be `read-only` when provided.
2. `credentialRef` must be a string when provided.
3. `billingAccountScope` must be an array of non-empty strings when provided.
4. `providerScope` must be an object when provided.

## 4. Canonical output contract

Canonical metrics emitted:

- `infraTotal`
- `cudPct`
- `budgetCap`
- `nRef`

Provenance requirements:

- `sourceVersion` starts with `gcp-readonly-`
- `coveragePct` numeric
- `mappingConfidence` in `low|medium|high`
- `warnings` include telemetry and recommender-ready baseline entries

## 5. Telemetry baseline (`F2-TASK-078`)

Required events:

1. `billing.run` for success/failure with duration and normalized error code (when failed)
2. `billing.mapping.summary` with canonical rollup and confidence metadata

Telemetry context fields:

- `adapterId`
- `integrationRunId`
- `requestId`
- `traceId`
- `workspaceId`
- `mode`

## 6. Fixture expansion baseline (`F2-TASK-079`)

- Add provider-specific edge-case requests in same fixture version pack.
- Document each edge-case file in fixture notes.
- Keep canonical request/response baseline files intact for deterministic validation.

## 7. Validation anchors

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## 8. Related documents

- `docs/billing-direct-integration-contract.md`
- `docs/provider-sdk-integration-strategy.md`
- `docs/playbooks/billing-provider-onboarding-plugin.md`
- `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/`
