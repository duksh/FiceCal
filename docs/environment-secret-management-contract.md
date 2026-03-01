# Environment and Secret Management Contract

## 1. Purpose

Define mandatory secret-handling and credential reference rules for provider billing ingestion and runtime operations.

## 2. Scope

This contract applies to:

- `F2-TASK-075` Define credentials contract for tier-1 providers
- `F2-TASK-122` Operationalize secret hygiene and rotation
- `F2-TASK-125` Validate no-secret-in-artifacts workflow
- `F2-TASK-128` Validate environment key completeness

## 3. Credential model

Rules:

1. Runtime requests must never embed raw provider secrets.
2. Provider authentication is referenced by `credentialRef` only.
3. For tier-1 ingest baseline, `authMode` is constrained to `read-only`.
4. `credentialRef` values must be opaque and non-secret identifiers, for example:
   - `cred://openops/workspace-alpha/readonly`
   - `cred://aws/production/readonly`

## 4. Environment variable policy

Required baseline keys:

- `NODE_ENV`
- `FICECAL_API_BASE`
- `FICECAL_MCP_BASE`

Optional secret-indirection keys (examples):

- `FICECAL_CREDENTIALS_BACKEND`
- `FICECAL_SECRET_RESOLVER_ENDPOINT`
- `BILLING_ADAPTER_RESOLUTION_MODE` (`fallback` or `strict`)
- `BILLING_INGEST_MODE` (`deterministic` or `live`)
- `FICECAL_OPENOPS_CREDENTIAL_REF`
- `FICECAL_AWS_CREDENTIAL_REF`
- `FICECAL_AZURE_CREDENTIAL_REF`
- `FICECAL_GCP_CREDENTIAL_REF`
- `FICECAL_OPENOPS_LIVE_SMOKE_CMD`
- `FICECAL_AWS_LIVE_SMOKE_CMD`
- `FICECAL_AZURE_LIVE_SMOKE_CMD`
- `FICECAL_GCP_LIVE_SMOKE_CMD`

Policy:

- `.env.example` may include key names and safe placeholder values only.
- `.env.live.example` may include live-mode key names and safe placeholder values only.
- Real secrets must be injected via runtime environment or secret manager.
- No secrets in git history, fixtures, screenshots, logs, or evidence artifacts.
- Stage/prod should set `BILLING_ADAPTER_RESOLUTION_MODE=strict`.
- Stage/prod live smoke should set `BILLING_INGEST_MODE=live`.

## 5. Rotation and hygiene requirements

1. Rotation windows and ownership must be documented before production cutover.
2. Any leaked credential reference context or secret material triggers incident response.
3. Secret scans are release-blocking for Critical/High findings.

## 6. Billing ingest-specific controls (P07)

For billing adapter requests:

- `credentialRef` is optional in local development but required for stage/prod.
- `authMode` defaults to `read-only` when omitted.
- Adapter validation must reject unsupported auth modes.
- In `live` ingest mode, missing credential resolver wiring is treated as an auth failure.
- Live smoke command outputs must be sanitized and must never print secrets.

## 7. Validation anchors

- `python3 scripts/validate-billing-canonical-handoff.py`
- `python3 scripts/validate-billing-live-readiness.py`
- `python3 scripts/run-billing-live-smoke.py --mode dry-run`
- `python3 scripts/validate-billing-live-reconciliation.py --allow-skipped`
- `npm run validate`

## 8. Related documents

- `docs/billing-direct-integration-contract.md`
- `docs/playbooks/billing-live-integration-readiness.md`
- `docs/playbooks/billing-phase1-stubs.md`
- `docs/roadmap/ficecal-v2-execution-plan-updated.md`
- `docs/roadmap/ficecal-v2-task-issue-registry.csv`
