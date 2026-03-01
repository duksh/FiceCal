# FiceCal Monorepo Copy Checklist (F2-TASK-016)

Use this checklist when validating a fresh bootstrap copy of the FiceCal monorepo.

## Scope

- Task: `F2-TASK-016` Add bootstrap verification checkpoints
- Acceptance target: copy checklist includes service, fixtures, and governance files

## 1) Repository scaffold

- [ ] Root workspace files exist:
  - [ ] `package.json`
  - [ ] `pnpm-workspace.yaml`
- [ ] Core directories exist:
  - [ ] `apps/`
  - [ ] `services/`
  - [ ] `packages/`
  - [ ] `docs/`
  - [ ] `.github/`

## 2) Governance and GitOps baseline

- [ ] Branch protection checklist exists: `.github/branch-protection-checklist.md`
- [ ] PR template exists: `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] CODEOWNERS exists: `.github/CODEOWNERS`
- [ ] Required workflows exist under `.github/workflows/`:
  - [ ] `ci-guardrails.yml`
  - [ ] `contract-drift.yml`
  - [ ] `qa-playwright-evidence.yml`
  - [ ] `security-sbom.yml`
  - [ ] `pages-deploy.yml`
  - [ ] `render-health-smoke.yml`
  - [ ] `release.yml`

## 3) Roadmap and recovery artifacts

- [ ] `docs/roadmap/ficecal-v2-recovery-index.md`
- [ ] `docs/roadmap/ficecal-v2-execution-plan-updated.md`
- [ ] `docs/roadmap/ficecal-v2-task-issue-registry.csv`
- [ ] `docs/roadmap/ficecal-v2-task-issue-registry.md`
- [ ] `docs/roadmap/ficecal-v2-github-issue-map.csv`

## 4) Playbooks and contribution contracts

- [ ] `CONTRIBUTING.md`
- [ ] `docs/playbooks/ficecal-v2-issue-seeding.md`
- [ ] `docs/playbooks/ficecal-v2-workflow-inventory.md`
- [ ] `docs/playbooks/github-actions-setup.md`
- [ ] `docs/contracts/community-module-contribution-contract.md`
- [ ] `docs/contracts/ai-agent-contribution-policy.md`

## 5) Service and adapter baseline

- [ ] MCP service entry exists: `services/mcp/src/index.ts`
- [ ] Billing module index exists: `services/mcp/src/billing/index.ts`
- [ ] Billing adapters exist:
  - [ ] `services/mcp/src/billing/adapters/openops.ts`
  - [ ] `services/mcp/src/billing/adapters/aws.ts`
  - [ ] `services/mcp/src/billing/adapters/azure.ts`
  - [ ] `services/mcp/src/billing/adapters/gcp.ts`
- [ ] Billing ingest tools exist: `services/mcp/src/billing/tools/billing-ingest-tools.ts`

## 6) Contract fixtures baseline

- [ ] Contract fixture root exists: `tests/contracts/fixtures/`
- [ ] MCP fixture root exists: `tests/contracts/fixtures/mcp/`
- [ ] Billing fixture skeletons exist:
  - [ ] `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/`
  - [ ] `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/`
  - [ ] `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/`
  - [ ] `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/`

## 7) Final validation

- [ ] Run `CI Guardrails` and confirm green.
- [ ] Confirm no absolute local paths are committed.
- [ ] Confirm no secrets are committed.
- [ ] Record copy validation date and operator in your handoff notes.
