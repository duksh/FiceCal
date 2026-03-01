# QA Evidence Storage Convention (P05)

## 1. Purpose

Define a deterministic evidence storage and review convention for QA artifacts across smoke tests, contract checks, and retest cycles.

## 2. Scope

This convention covers:

- `F2-STORY-052` Operationalize QA evidence conventions
- `F2-TASK-054` Enforce fail-fix-retest evidence rule
- `F2-TASK-055` Add evidence retention policy checks
- `F2-TASK-056` Validate no-sensitive-data screenshots

## 3. Evidence path conventions

Primary evidence root:

- `tests/evidence/`

Phase and task naming pattern:

- `tests/evidence/pXX/f2-task-YYY-<slug>.md`

Examples:

- `tests/evidence/p03/f2-task-033-legacy-alias-parity.md`
- `tests/evidence/p04/f2-task-044-mcp-fixture-coverage.md`

## 4. Minimum evidence bundle per task

Each evidence document must include:

1. Scope summary.
2. Artifact/fixture references used.
3. Commands executed.
4. Outcome and pass/fail state.
5. If failed initially, linked fix + retest proof.

Optional attachments:

- screenshots
- CI run links
- log snippets

## 5. Fail-fix-retest rule (`F2-TASK-054`)

If a check fails at any point, the task is not complete until all three are present:

1. **Fail evidence**: failing command output, screenshot, or CI failure link.
2. **Fix evidence**: code/doc change reference that addresses the root cause.
3. **Retest evidence**: successful rerun of the same check(s).

No task may be marked `Done` without explicit retest proof when initial failure occurred.

## 6. Retention policy (`F2-TASK-055`)

Retention windows:

- Release-critical evidence: retain for at least 180 days.
- Phase-close evidence: retain for at least 90 days.
- Routine non-release evidence: retain for at least 30 days.

Retention checklist:

- Evidence references remain valid and repository-relative.
- Evidence documents are immutable records once a phase is marked `Done`.
- Superseded evidence should point to the replacement artifact rather than deletion-only changes.

## 7. Screenshot privacy rule (`F2-TASK-056`)

All screenshots and attached artifacts must be scrubbed for sensitive content before commit:

- credentials and secret values
- personal data not needed for verification
- environment-specific identifiers that are confidential
- local machine absolute paths where avoidable

Required screenshot review checklist:

1. Sensitive fields masked/redacted.
2. No secret/token values visible.
3. No local-only confidential context leaked.
4. Artifact still contains enough information for QA verification.

## 8. Reviewer checklist

Before approving QA evidence updates, reviewers confirm:

- naming/path follows convention
- fail-fix-retest chain is complete when needed
- retention and privacy requirements are satisfied
- linked commands or CI checks are reproducible

## 9. Validation command anchor

- `python3 scripts/validate-qa-evidence-policy.py`

## 10. Related documents

- `docs/ui-foundation-hci-metrics-contract.md`
- `docs/contract-test-fixture-pack.md`
- `docs/operational-incident-playbooks.md`
