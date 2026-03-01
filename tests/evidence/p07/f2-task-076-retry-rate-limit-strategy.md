# F2-TASK-076 QA Evidence: Retry and Rate-Limit Strategy

## Scope

Implement and validate AWS adapter retry/rate-limit control baseline for P07.

## Artifacts

- `services/mcp/src/billing/adapters/aws.ts`
- `docs/billing-adapter-aws-contract.md`
- `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/response.expected.json`

## Commands

- `python3 scripts/validate-billing-canonical-handoff.py`
- `npm run validate`

## Outcome

- Retry baseline configured with max attempts and exponential backoff metadata.
- Provenance warnings include retry policy declaration for all ingest runs.
- Rate-limit fallback path emits deterministic warning details when activated.

## Proof Artifacts

- log: `[billing-canonical-handoff] OK: validated 4 billing tool fixture packs`
- log: `[validate] OK: root validation chain passed`

## Evidence Checklist

- [x] Fail evidence captured or not applicable
- [x] Fix evidence captured or not applicable
- [x] Retest evidence captured or not applicable
- [x] Screenshot privacy review completed or no screenshots attached
- Retention class: phase-close-90d
