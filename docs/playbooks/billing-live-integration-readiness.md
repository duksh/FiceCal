# Billing Live Integration Readiness Playbook (P07)

## 1. Purpose

Define the required controls for proving tier-1 billing ingest works against real OpenOps/AWS/Azure/GCP sandbox environments before release promotion.

## 2. Scope

This playbook covers seven mandatory controls:

1. Live test readiness criteria
2. Read-only sandbox credential provisioning
3. Credential resolver wiring
4. Deterministic vs live ingest mode split
5. Live smoke runner and evidence artifacts
6. CI/stage release gating
7. Reconciliation thresholds against provider totals

## 3. Live test ready criteria

A provider integration is live-test ready only when all checks are green:

- Contract baseline: `python3 scripts/validate-billing-canonical-handoff.py`
- QA evidence baseline: `python3 scripts/validate-qa-evidence-policy.py`
- Live readiness baseline: `python3 scripts/validate-billing-live-readiness.py`
- Live smoke run (dry-run or live depending on environment):
  - `python3 scripts/run-billing-live-smoke.py --mode dry-run`
  - `python3 scripts/run-billing-live-smoke.py --mode live --require-provider-commands`
- Reconciliation report validation:
  - `python3 scripts/validate-billing-live-reconciliation.py`

## 4. Read-only sandbox credentials

Per provider, provision a dedicated non-human read-only identity in sandbox:

- OpenOps: `FICECAL_OPENOPS_CREDENTIAL_REF`
- AWS: `FICECAL_AWS_CREDENTIAL_REF`
- Azure: `FICECAL_AZURE_CREDENTIAL_REF`
- GCP: `FICECAL_GCP_CREDENTIAL_REF`

Rules:

- Use `credentialRef` indirection only.
- Do not commit raw credentials, tokens, keys, or account secrets.
- Keep credential references opaque (`cred://...`) and non-sensitive.

Environment templates:

- `.env.example` (local deterministic baseline)
- `.env.live.example` (stage/prod-style live baseline)

## 5. Credential resolver wiring

Live mode requires all of the following:

- `BILLING_INGEST_MODE=live`
- `FICECAL_CREDENTIALS_BACKEND` set
- `FICECAL_SECRET_RESOLVER_ENDPOINT` set
- non-empty provider `credentialRef`

Runtime behavior:

- deterministic mode: allows baseline fixture-oriented runs
- live mode: fails fast when credential resolver wiring is incomplete

Implementation anchors:

- `services/mcp/src/billing/credentials.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`

## 6. Ingest mode split

`BillingIngestRequest` supports `ingestMode`:

- `deterministic`: fixture-friendly deterministic mapping baseline
- `live`: real-provider smoke path with strict credential resolution checks

Ingest mode can come from:

1. request-level `ingestMode`
2. fallback env variable `BILLING_INGEST_MODE`
3. default `deterministic`

## 7. Live smoke execution model

Live smoke is orchestrated by:

- `scripts/run-billing-live-smoke.py`
- config: `tests/contracts/live-smoke/billing-live-smoke.config.json`

Mode behavior:

- `dry-run`: validates smoke wiring using fixture baselines (no cloud login)
- `live`: executes provider-specific smoke commands from environment variables:
  - `FICECAL_OPENOPS_LIVE_SMOKE_CMD`
  - `FICECAL_AWS_LIVE_SMOKE_CMD`
  - `FICECAL_AZURE_LIVE_SMOKE_CMD`
  - `FICECAL_GCP_LIVE_SMOKE_CMD`

Each command must emit one JSON line:

```json
{"providerTotal": 123.45, "canonicalTotal": 122.91, "currency": "USD"}
```

Artifacts generated per run under `tests/evidence/artifacts/`:

- timestamped report JSON
- timestamped summary log
- `latest-billing-live-smoke-report.json`

## 8. Reconciliation checks

Use `scripts/validate-billing-live-reconciliation.py` to enforce:

- report freshness (`maxReportAgeHours` from config)
- provider presence for all tier-1 providers
- zero failed providers
- variance thresholds per provider (`varianceThresholdPct`)

Threshold source:

- `tests/contracts/live-smoke/billing-live-smoke.config.json`

## 9. CI/stage gates

Workflows:

- `.github/workflows/billing-live-smoke.yml`
  - manual + scheduled live smoke with artifacts upload
- `.github/workflows/release.yml`
  - optional `require_live_smoke` release gate
  - blocks release when reconciliation validation fails

## 10. Evidence expectations

Every live smoke/reconciliation update must include QA evidence:

- commands executed
- report/log artifact paths
- artifact checksums when promoted to release decision evidence
- fail/fix/retest checklist markers

Recommended evidence file for this slice:

- `tests/evidence/p07/f2-task-080-stage-ingest-quality-metrics-validation.md`
