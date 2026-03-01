# FiceCal v2 Recovery Index (Program Lock Baseline)

## Scope

This file is the authoritative contract index for Phase `P00` Issue `F2-STORY-001`.

- Epic: `F2-EPIC-000` Program lock and governance baseline
- Story: `F2-STORY-001` Freeze authoritative contract index

Use this index to recover baseline governance context directly from the repository.

## Read-first sequence (cold start)

1. `README.md`
2. `CONTRIBUTING.md`
3. `docs/roadmap/ficecal-v2-recovery-index.md`
4. `docs/roadmap/ficecal-v2-execution-plan-updated.md`
5. `docs/roadmap/ficecal-v2-task-issue-registry.csv`
6. `docs/roadmap/ficecal-v2-task-issue-registry.md`
7. `docs/roadmap/ficecal-v2-github-issue-map.csv`
8. `docs/playbooks/ficecal-v2-issue-seeding.md`
9. `.github/branch-protection-checklist.md`
10. `.github/PULL_REQUEST_TEMPLATE.md`
11. `.github/CODEOWNERS`

## Authoritative governance and contract set

### Program sequencing and quality gates

- `docs/roadmap/ficecal-v2-execution-plan-updated.md`

### Backlog and project traceability

- `docs/roadmap/ficecal-v2-task-issue-registry.csv`
- `docs/roadmap/ficecal-v2-task-issue-registry.md`
- `docs/roadmap/ficecal-v2-github-issue-map.csv`
- `docs/playbooks/ficecal-v2-issue-seeding.md`

### Contribution governance contracts

- `docs/contracts/community-module-contribution-contract.md`
- `docs/contracts/ai-agent-contribution-policy.md`

### Contribution and project playbooks

- `docs/playbooks/community-contribution-guide.md`
- `docs/playbooks/community-first-pr-bundle.md`
- `docs/playbooks/github-project-community-seed.md`

### Billing integration starter (Phase 1)

- `docs/playbooks/billing-phase1-stubs.md`
- `services/mcp/src/billing/`
- `tests/contracts/fixtures/mcp/`

### GitOps controls

- `.github/branch-protection-checklist.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS`
- `.github/workflows/ci-guardrails.yml`
- `.github/workflows/contract-drift.yml`
- `.github/workflows/qa-playwright-evidence.yml`
- `.github/workflows/security-sbom.yml`
- `.github/workflows/pages-deploy.yml`
- `.github/workflows/render-health-smoke.yml`
- `.github/workflows/release.yml`

## Update rule

If a new contract becomes release-authoritative, it must be added here in the same PR that introduces it.
