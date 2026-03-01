# F2-TASK-051 QA Evidence: Mode-Aware UX Skeleton

## Scope

Implement and validate the P05 mode-aware UI skeleton for `quick`, `operator`, and `architect` workflows.

## Artifacts

- `apps/web/src/index.html`
- `apps/web/src/mode-aware-ux.js`
- `apps/web/src/mode-aware-ux.css`
- `docs/ui-foundation-hci-metrics-contract.md`
- `tests/e2e/smoke-journeys.md`

## Commands

- `python3 scripts/validate-qa-evidence-policy.py`
- `npm run validate`

## Outcome

- Active mode badge and switcher are implemented and synchronized.
- Shared context persists while switching between modes.
- Additive gating is enforced:
  - `quick` shows summary + next action
  - `operator` adds diagnostics and controls
  - `architect` enables deep traceability action
- Unsupported architect-only action remains disabled outside `architect` mode.
- Degraded-state banner messaging remains visible and understandable across modes.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
