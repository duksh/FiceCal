# Contract Test Fixture Pack (Modules + MCP)

## 1. Purpose

Define golden fixtures that enforce deterministic parity between contracts and runtime behavior.

## 2. Fixture structure

```text
tests/
  contracts/
    fixtures/
      <module-id>/
        <contract-version>/
          input.valid.json
          input.invalid.json
          output.expected.json
          notes.md
      mcp/
        <tool-name>/
          <schema-version>/
            request.valid.json
            request.invalid.json
            response.expected.json
            notes.md
```

## 3. Module fixture rules

- Every module contract must have:
  - one valid input fixture
  - one invalid input fixture
  - one deterministic expected output fixture
- Output fixtures must use stable values (no non-deterministic timestamps unless normalized).

## 4. MCP parity fixture rules

- Every MCP tool must have request/response fixtures tied to schema version.
- Legacy alias fixtures (`finops.*`) must assert parity with replacement tools until deprecation closes.

## 5. Golden fixture lifecycle

1. Contract change proposed.
2. Fixture delta included in same PR.
3. Contract + fixture reviewers approve together.
4. CI parity checks enforce fixture coverage.

## 6. Required coverage

Minimum required fixture coverage for release:

- economics parity
- health-score parity
- recommendation parity
- localization parity
- CMS publish-policy parity
- integration adapter error handling parity

## 7. Ownership

- Module owner: owns module fixture correctness.
- MCP owner: owns tool fixture correctness.
- QA owner: owns fixture-run evidence integrity.

## 8. Related documents

- `docs/mcp-evolution-contract.md`
- `docs/qa-evidence-storage-convention.md`
- `docs/operational-incident-playbooks.md`
