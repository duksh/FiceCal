# Operational Incident Playbooks

## 1. Purpose

Define repeatable incident handling playbooks for contract, fixture, and runtime incidents that can block release readiness.

## 2. Scope

This baseline operational playbook covers:

- Contract drift failures in CI (`contract-drift` gate)
- Local validation failures for contract and fixture checks
- Routing and ownership expectations for `F2-TASK-046`

## 3. Contract fixture drift triage playbook (`F2-TASK-046`)

### 3.1 Trigger conditions

Start this triage flow when any of the following fail:

- `python3 scripts/validate-fixture-coverage.py`
- `python3 scripts/validate-legacy-alias-parity.py`
- Contract drift CI workflow checks

### 3.2 Classification

Classify the failure into one bucket:

1. **Schema drift**
   - Contract/schema changed but fixture baseline was not updated.
2. **Fixture stale**
   - Runtime behavior intentionally changed and expected fixture has not been refreshed.
3. **Runtime regression**
   - Contract + fixture are correct; implementation behavior is now incorrect.

### 3.3 Routing matrix

| Bucket | Primary owner | Secondary owner | Required action |
|---|---|---|---|
| Schema drift | Contract owner | QA owner | Update contract + fixture pack in same PR |
| Fixture stale | Fixture owner (module/MCP) | QA owner | Refresh expected fixtures and `notes.md` |
| Runtime regression | Implementation owner | Contract owner | Fix runtime path, preserve contract baseline |

### 3.4 Severity guidance

- **High**: Drift affects release-blocking contract path in active phase.
- **Medium**: Drift isolated to non-release path or optional fixture pack.
- **Low**: Documentation-only mismatch with no runtime contract impact.

### 3.5 Resolution checklist

1. Capture failing command/log in the incident record.
2. Record bucket classification and owner assignment.
3. Submit remediation PR with:
   - contract delta (if required)
   - fixture delta (if required)
   - updated `notes.md`
   - validator pass proof
4. Re-run triage validators and attach green output.
5. Close incident with root-cause and prevention note.

## 4. Incident record template

Use this template for drift incidents:

```text
Incident ID:
Detected at:
Detected by (CI/local):
Failing command/check:
Bucket (schema drift | fixture stale | runtime regression):
Severity:
Owner:
Resolution PR:
Validation proof:
Prevention follow-up:
```
