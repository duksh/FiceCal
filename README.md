# FiceCal Monorepo Bootstrap (Public)

This blueprint is a ready-to-use starter for the public `duksh/FiceCal` repository.

It provides:

- monorepo layout for web + MCP + shared packages
- workspace config (`pnpm-workspace.yaml`, root `package.json`)
- `.github` GitOps pack (PR template, CODEOWNERS, workflows, branch protection checklist)
- contribution governance starter (`CONTRIBUTING.md`, community/AI policy contracts)
- placeholder folders for apps, services, packages, docs, scripts, and tests

## Bootstrap steps

1. Create `duksh/FiceCal` GitHub repository.
2. Copy this blueprint content into the repository root.
3. Enable branch protection on `main` using `.github/branch-protection-checklist.md`.
4. Configure repository secrets required by release/deploy workflows (if any).
5. Replace placeholder `.gitkeep` files with real module/app code.
6. Validate bootstrap integrity with `docs/ficecal-monorepo-copy-checklist.md`.

## Target structure

```text
apps/
  web/
  docs/
services/
  mcp/
packages/
  core-economics/
  feature-registry/
  features/
    community/
  integrations/
  mcp-tooling/
  schemas/
docs/
  contracts/
  architecture/
  playbooks/
  references/
.github/
  workflows/
```

## Community and AI contribution policy

- Community module path: `packages/features/community/`
- Community registry seed: `packages/features/community/registry.json`
- Contributor rules: `CONTRIBUTING.md`
- Governance contracts:
  - `docs/contracts/community-module-contribution-contract.md`
  - `docs/contracts/ai-agent-contribution-policy.md`
  - `docs/playbooks/community-contribution-guide.md`
  - `docs/playbooks/react-best-practices-checklist.md`
  - `docs/playbooks/github-project-community-seed.md`
  - `docs/playbooks/community-first-pr-bundle.md`
- Starter sample module:
  - `packages/features/community/community.sample-finops-adapter/`
  - `docs/references/github-project-community-seed.csv`

## Billing integration stubs (Phase 1)

- MCP billing stubs:
  - `services/mcp/src/billing/adapters/openops.ts`
  - `services/mcp/src/billing/adapters/aws.ts`
  - `services/mcp/src/billing/adapters/azure.ts`
  - `services/mcp/src/billing/adapters/gcp.ts`
  - `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- Fixture skeletons:
  - `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/`
  - `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/`
  - `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/`
  - `tests/contracts/fixtures/mcp/billing.gcp.ingest/1.0/`
- Playbook:
  - `docs/playbooks/billing-phase1-stubs.md`

## Program lock roadmap (Phase P00)

- Recovery and authoritative contract index:
  - `docs/roadmap/ficecal-v2-recovery-index.md`
- Phase sequencing, entry criteria, exit criteria, and gate references:
  - `docs/roadmap/ficecal-v2-execution-plan-updated.md`
- Backlog registry (machine + human):
  - `docs/roadmap/ficecal-v2-task-issue-registry.csv`
  - `docs/roadmap/ficecal-v2-task-issue-registry.md`
- GitHub issue/project mapping snapshot:
  - `docs/roadmap/ficecal-v2-github-issue-map.csv`
- Issue seeding and maintenance playbook:
  - `docs/playbooks/ficecal-v2-issue-seeding.md`
- Workflow inventory validation snapshot:
  - `docs/playbooks/ficecal-v2-workflow-inventory.md`
- GitHub Actions and Pages/Render configuration playbook:
  - `docs/playbooks/github-actions-setup.md`
- Bootstrap verification checklist:
  - `docs/ficecal-monorepo-copy-checklist.md`

## GitOps expectations

- `main` is protected; no direct pushes.
- Every module change updates contracts + manifests + validations.
- No secrets committed.
- No absolute local paths committed; use repository-relative paths only.

## Notes

- This is a public bootstrap. Keep private planning artifacts in private workspaces.
- All paths in docs/config should stay relative to repository root.
