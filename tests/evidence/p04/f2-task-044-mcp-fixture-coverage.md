# F2-TASK-044 QA Evidence: MCP Fixture Coverage Baseline

## Scope

Validate that active MCP tools expose complete fixture packs with deterministic request/response baselines.

## Fixture coverage baseline

- Capabilities source of truth:
  - `tests/contracts/fixtures/mcp/mcp.capabilities.get/2.0/response.expected.json`
- Mandatory MCP fixture packs:
  - `tests/contracts/fixtures/mcp/mcp.capabilities.get/2.0/`
  - `tests/contracts/fixtures/mcp/mcp.context.envelope/2.0/`
  - `tests/contracts/fixtures/mcp/legacy-alias-parity/1.0/`
- Active tool fixture packs from capabilities:
  - `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/`
  - `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/`
  - `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/`
  - `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/`

## Executable validation

- Command:
  - `python3 scripts/validate-fixture-coverage.py`
- Guarantees checked:
  - required MCP packs exist and include required files per pack type
  - MCP tool packs align with `mcp.capabilities.get` declared tool list
  - unexpected MCP packs are rejected
  - legacy alias parity fixture version matches capabilities compatibility contract
  - parity canonical tools remain aligned with declared MCP tool surface
  - JSON fixture payloads parse as objects

## Outcome

- MCP fixture baseline validates cleanly for all active tools and mandatory support packs.
- Coverage gate is wired into root validation via `npm run validate`.
