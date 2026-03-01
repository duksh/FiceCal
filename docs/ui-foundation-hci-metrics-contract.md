# UI Foundation + HCI Metrics Contract (P05)

## 1. Purpose

Define the Phase P05 baseline contract for mode-aware UX behavior, critical smoke journeys, and measurable evidence quality.

## 2. Scope

This contract covers:

- `F2-EPIC-050` UI foundation and evidence pipeline
- `F2-STORY-051` Implement mode-aware UX skeleton
- `F2-TASK-053` Define user-facing smoke journeys

## 3. Mode-aware UX skeleton contract (`F2-STORY-051`)

All user-facing flows must support deterministic mode gating for:

- `quick`
- `operator`
- `architect`

Implementation anchors:

- `apps/web/src/index.html`
- `apps/web/src/mode-aware-ux.js`
- `apps/web/src/mode-aware-ux.css`

### 3.1 Required behavior

1. Current mode must be visible in UI state (badge/label/header context).
2. Mode changes must preserve core user context and avoid data loss.
3. Mode gating must be additive:
   - `quick`: concise summary + immediate next action
   - `operator`: operational controls and issue diagnostics
   - `architect`: deeper analysis, tradeoffs, and traceability context
4. Unsupported actions for current mode must be explicitly disabled or hidden.
5. Error states must remain understandable across all modes.

### 3.2 Responsive baseline

- Desktop and mobile layouts must preserve mode affordances.
- Critical controls must remain accessible without horizontal scrolling.
- Interaction order must remain predictable across breakpoints.

## 4. HCI quality metrics baseline (`F2-EPIC-050`)

Track these baseline metrics for user-facing smoke coverage:

1. **Time-to-first-insight**: time to display first actionable result.
2. **Mode-switch continuity**: no context loss when switching modes.
3. **Task completion reliability**: smoke journey completion pass rate.
4. **Error recovery clarity**: failed states provide a clear next action.
5. **Evidence completeness**: every smoke run links logs/screenshots/results.

## 5. Evidence linkage requirements

Evidence for P05 runs must conform to:

- `docs/qa-evidence-storage-convention.md`
- `tests/e2e/smoke-journeys.md`

For each smoke journey run:

- include run timestamp and environment
- include pass/fail status
- include screenshot/log references
- if failed initially, include fix + retest evidence

## 6. Exit anchors for P05 UI foundation

P05 UI foundation is considered ready when:

1. Mode-aware behavior contract is implemented and testable.
2. Smoke journey definitions are published and executable.
3. Evidence format and retention policies are enforced per convention.
