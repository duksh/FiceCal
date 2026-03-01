# Contract Test Fixture Pack (Modules + MCP)

## 1. Purpose

Define deterministic golden fixtures that enforce parity between contract definitions and runtime behavior.

This document is the baseline contract for:

- `F2-EPIC-040` Contract fixture parity infrastructure
- `F2-STORY-041` Enforce fixture-delta-with-contract policy
- `F2-STORY-042` Enable deterministic fixture validation
- `F2-TASK-043` to `F2-TASK-046`

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

Naming and versioning rules:

- `<module-id>` matches canonical module IDs in `src/features/feature-catalog.json`.
- `<tool-name>` matches canonical MCP tool names and namespaces.
- `<contract-version>` and `<schema-version>` are immutable once published.

## 3. Fixture-delta-with-contract policy (`F2-STORY-041`)

Any PR that changes contract shape or validation behavior MUST include fixture deltas in the same PR.

Required update set:

1. Contract document/schema change.
2. Corresponding fixture updates (`valid`, `invalid`, `expected`, and/or `notes`).
3. Validation evidence (local command output or CI reference).

Contract-only changes without fixture updates are blocking unless the contract update is strictly non-behavioral (e.g., typo-only). In that case, `notes.md` for the affected fixture set must explain why no fixture delta was required.

## 4. Deterministic validation rules (`F2-STORY-042`)

Fixtures must be stable across reruns.

Determinism requirements:

- No runtime-generated timestamps, random IDs, or environment-specific values in expected outputs.
- If temporal or dynamic fields are contract-required, normalize to fixed fixture values.
- Arrays in expected outputs should use stable ordering.
- Numeric precision should be fixed to contract expectations.
- `notes.md` must describe assumptions and normalization decisions.

## 5. Coverage baseline (`F2-TASK-043`, `F2-TASK-044`)

Minimum baseline for active phase modules/tools:

- Module fixtures: one valid input, one invalid input, one deterministic expected output.
- MCP fixtures: one valid request, one invalid request, one expected response per active tool.
- Legacy alias parity fixtures (`finops.*`) remain mandatory until compatibility deprecation closes.

Coverage targets are release-blocking for contract-touching work in active phases.

## 6. Fixture review checklist (`F2-TASK-045`)

Every contract-affecting PR must confirm:

1. Contract delta and fixture delta are present together.
2. Fixture version folder choice is correct (existing immutable vs new version).
3. `notes.md` is updated for rationale, assumptions, and known limits.
4. Determinism constraints are satisfied.
5. Relevant validators pass.

## 7. Drift triage process (`F2-TASK-046`)

When contract-drift checks fail, classify into one of three buckets:

1. **Schema drift**: contract changed but fixture/schema baseline not updated.
2. **Fixture stale**: runtime behavior intentionally changed but expected fixture not refreshed.
3. **Runtime regression**: fixture and contract are correct; implementation is broken.

Triage handling:

- Schema drift and stale fixtures route to contract/fixture owners.
- Runtime regressions route to implementation owners.
- Resolution PRs must include updated evidence and validator pass proof.

## 8. Ownership

- Module owner: fixture correctness for module contracts.
- MCP owner: fixture correctness for MCP tool contracts.
- QA owner: fixture evidence integrity and retest discipline.

## 9. Validation command anchors

- `python3 scripts/validate-feature-catalog.py`
- `python3 scripts/validate-fixture-coverage.py`
- `python3 scripts/validate-legacy-alias-parity.py`

Additional validators can be added as fixture coverage expands.

## 10. Related documents

- `docs/mcp-evolution-contract.md`
- `docs/modularization-playbook.md`
- `docs/roadmap/ficecal-v2-execution-plan-updated.md`
- `docs/roadmap/ficecal-v2-task-issue-registry.csv`
