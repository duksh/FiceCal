# P05 Smoke Journeys Baseline (`F2-TASK-053`)

## Purpose

Define critical user-facing smoke journeys for the UI foundation phase.

## Execution target

- UI entrypoint: `apps/web/src/index.html`
- Mode contract implementation:
  - `apps/web/src/mode-aware-ux.js`
  - `apps/web/src/mode-aware-ux.css`

## Journey matrix

| Journey ID | Mode | Goal | Minimum assertion set |
|---|---|---|---|
| SJ-001 | quick | User can load app and see first actionable insight | app renders, key summary visible, no blocking error |
| SJ-002 | operator | User can access operational controls and diagnostics | controls visible, diagnostics panel reachable, expected status labels visible |
| SJ-003 | architect | User can access deeper analysis and traceability view | advanced context visible, traceability/evidence panel reachable |
| SJ-004 | mode-switch | User can switch between modes without context loss | selected context persists across mode switches |
| SJ-005 | degraded-path | User sees clear degraded-state fallback and recovery hint | degraded state message visible, next action guidance shown |

## Mode-aware baseline assertions

For every smoke run, also verify:

1. Active mode badge reflects selected mode (`quick`, `operator`, `architect`).
2. Shared context values are retained when switching modes.
3. Operator panel is hidden in `quick` and shown in `operator`/`architect`.
4. Architect traceability action remains disabled until `architect` mode.
5. Error banner remains understandable across all modes.

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
