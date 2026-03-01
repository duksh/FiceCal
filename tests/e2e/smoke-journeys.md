# P05 Smoke Journeys Baseline (`F2-TASK-053`)

## Purpose

Define critical user-facing smoke journeys for the UI foundation phase.

## Journey matrix

| Journey ID | Mode | Goal | Minimum assertion set |
|---|---|---|---|
| SJ-001 | quick | User can load app and see first actionable insight | app renders, key summary visible, no blocking error |
| SJ-002 | operator | User can access operational controls and diagnostics | controls visible, diagnostics panel reachable, expected status labels visible |
| SJ-003 | architect | User can access deeper analysis and traceability view | advanced context visible, traceability/evidence panel reachable |
| SJ-004 | mode-switch | User can switch between modes without context loss | selected context persists across mode switches |
| SJ-005 | degraded-path | User sees clear degraded-state fallback and recovery hint | degraded state message visible, next action guidance shown |

## Execution contract

For each smoke journey run:

1. Record environment, build/version reference, and timestamp.
2. Capture pass/fail result with test output snippet or CI run link.
3. Capture screenshot evidence for key state transitions.
4. If failure occurs, include fail-fix-retest chain per:
   - `docs/qa-evidence-storage-convention.md`

## Evidence anchors

- `tests/evidence/p05/` for run artifacts
- `docs/ui-foundation-hci-metrics-contract.md`
- `docs/qa-evidence-storage-convention.md`
