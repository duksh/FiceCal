# F2-TASK-065 QA Evidence: Phase-1 Stub Playbook Operationalization

## Scope

Operationalize the phase-1 billing stub playbook so implementation updates, validation steps, and evidence requirements are explicit and repeatable.

## Artifacts

- `docs/playbooks/billing-phase1-stubs.md`
- `docs/billing-direct-integration-contract.md`
- `services/mcp/src/billing/registry.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `python3 scripts/validate-fixture-coverage.py`
- `npm run validate`

## Outcome

- Playbook now includes an operational checklist for adapter routing hardening, canonical handoff integrity, and fixture update discipline.
- Validation anchors are explicit and reproducible for ongoing P06/P07 billing work.
- Evidence anchors for P06 tasks are published in the playbook.

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
