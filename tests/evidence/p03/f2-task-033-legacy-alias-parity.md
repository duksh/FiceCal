# F2-TASK-033 QA Evidence: Legacy Alias Parity

## Scope

Validate that `finops.*` compatibility aliases remain response-shape compatible with canonical `billing.*` tool fixtures.

## Fixture coverage

- Parity table: `tests/contracts/fixtures/mcp/legacy-alias-parity/1.0/parity.rows.json`
- Canonical request/response fixtures:
  - `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/`
  - `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/`
  - `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/`
  - `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/`

## Executable validation

- Command: `python3 scripts/validate-legacy-alias-parity.py`
- Guarantees checked per parity row:
  - `legacyAlias` starts with `finops.` and maps directly to `canonicalTool`
  - request and expected response fixtures exist and parse as JSON objects
  - response shape parity fields are present and typed (`scope`, `canonical`, `provenance`)
  - request-to-response consistency for run ID and billing scope fields
  - provider adapter identity aligns with canonical tool mapping

## Outcome

- Current parity fixture baseline validates cleanly for all 4 seeded legacy aliases.
