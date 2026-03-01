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
9. `docs/playbooks/ficecal-v2-workflow-inventory.md`
10. `.github/branch-protection-checklist.md`
11. `.github/PULL_REQUEST_TEMPLATE.md`
12. `.github/CODEOWNERS`

## Cold-start restart protocol (no chat memory)

Use this when implementation context must be reconstructed only from repository artifacts.

1. Read the full **Read-first sequence** above in order.
2. Reconstruct P00 completion state using the **P00 anchor map** below.
3. Record a restart note with:
   - current active phase and issue ID
   - unresolved blockers with severity and owner
   - gate status (`G-001` to `G-008`) for the active phase
   - next 1-2 tasks to execute
4. Before phase close or release decisions, re-check that no unresolved Critical/High blockers remain and required gates are green.

## P00 anchor map (memory-loss-safe)

| P00 item | Recovery anchor |
|---|---|
| `F2-STORY-001` Freeze authoritative contract index | `docs/roadmap/ficecal-v2-recovery-index.md` |
| `F2-STORY-002` Define phase entry/exit criteria | `docs/roadmap/ficecal-v2-execution-plan-updated.md` |
| `F2-TASK-003` Define RACI by domain | `docs/roadmap/ficecal-v2-task-issue-registry.md` (`Domain and operations RACI`) |
| `F2-TASK-004` Define blocker severity policy | `docs/roadmap/ficecal-v2-task-issue-registry.md` (`Blocker severity policy`) |
| `F2-TASK-005` Define quality gate matrix | `docs/roadmap/ficecal-v2-task-issue-registry.md` (`Quality gate matrix`) |
| `F2-TASK-006` Seed memory-loss-safe docs index | `docs/roadmap/ficecal-v2-recovery-index.md` (this protocol + anchor map) |

## Authoritative governance and contract set

### Program sequencing and quality gates

- `docs/roadmap/ficecal-v2-execution-plan-updated.md`

### Architecture decisions and traceability

- `docs/architecture-decision-traceability-map.md`
- `docs/adr-0001-d3-first-chart-policy.md`
- `docs/adr-0002-fastify-mcp-sdk-stack.md`
- `docs/adr-0003-monorepo-structure-choice.md`

### MCP evolution baseline

- `docs/mcp-evolution-contract.md`
- `tests/contracts/fixtures/mcp/legacy-alias-parity/1.0/`
- `scripts/validate-legacy-alias-parity.py`
- `tests/evidence/p03/f2-task-033-legacy-alias-parity.md`

### Contract fixture parity baseline

- `docs/contract-test-fixture-pack.md`
- `scripts/validate-fixture-coverage.py`
- `docs/operational-incident-playbooks.md`
- `tests/evidence/p04/f2-task-044-mcp-fixture-coverage.md`

### UI foundation and QA evidence baseline

- `docs/ui-foundation-hci-metrics-contract.md`
- `docs/qa-evidence-storage-convention.md`
- `tests/e2e/smoke-journeys.md`
- `apps/web/src/index.html`
- `apps/web/src/mode-aware-ux.js`
- `apps/web/src/mode-aware-ux.css`
- `tests/evidence/p05/f2-task-051-mode-aware-ux-skeleton.md`
- `tests/evidence/p05/f2-task-053-smoke-journeys-baseline.md`
- `scripts/validate-qa-evidence-policy.py`

### Billing adapter framework baseline

- `docs/billing-direct-integration-contract.md`
- `docs/playbooks/billing-phase1-stubs.md`
- `services/mcp/src/billing/types.ts`
- `services/mcp/src/billing/registry.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- `scripts/validate-billing-canonical-handoff.py`
- `tests/evidence/p06/f2-task-063-registry-routing-hardening.md`
- `tests/evidence/p06/f2-task-064-canonical-handoff-validation.md`
- `tests/evidence/p06/f2-task-065-phase1-stub-playbook.md`
- `tests/evidence/p06/f2-task-066-stub-fixture-version-mapping.md`

### Tier-1 ingest rollout baseline (OpenOps + credentials)

- `services/mcp/src/billing/adapters/openops.ts`
- `services/mcp/src/billing/adapters/aws.ts`
- `services/mcp/src/billing/adapters/azure.ts`
- `services/mcp/src/billing/tools/billing-ingest-tools.ts`
- `services/mcp/src/billing/registry.ts`
- `services/mcp/src/billing/types.ts`
- `docs/environment-secret-management-contract.md`
- `docs/billing-adapter-aws-contract.md`
- `docs/billing-adapter-azure-contract.md`
- `docs/playbooks/billing-provider-onboarding-plugin.md`
- `tests/contracts/fixtures/mcp/billing.openops.ingest/1.0/`
- `tests/contracts/fixtures/mcp/billing.aws.ingest/1.0/`
- `tests/contracts/fixtures/mcp/billing.azure.ingest/1.0/`
- `tests/evidence/p07/f2-story-071-openops-real-ingest.md`
- `tests/evidence/p07/f2-task-075-credentials-contract.md`
- `tests/evidence/p07/f2-story-072-aws-real-ingest.md`
- `tests/evidence/p07/f2-task-076-retry-rate-limit-strategy.md`
- `tests/evidence/p07/f2-task-081-aws-mapping-profiles.md`
- `tests/evidence/p07/f2-story-073-azure-real-ingest.md`
- `tests/evidence/p07/f2-task-077-pagination-incremental-sync.md`
- `tests/evidence/p07/f2-task-082-error-normalization.md`
- `tests/evidence/p07/f2-task-084-plugin-registry-hardening.md`
- `tests/evidence/p07/f2-task-085-provider-scope-envelope.md`
- `tests/evidence/p07/f2-task-086-provider-onboarding-playbook.md`

### Backlog and project traceability

- `docs/roadmap/ficecal-v2-task-issue-registry.csv`
- `docs/roadmap/ficecal-v2-task-issue-registry.md`
- `docs/roadmap/ficecal-v2-github-issue-map.csv`
- `docs/playbooks/ficecal-v2-issue-seeding.md`
- `docs/playbooks/github-actions-setup.md`
- `docs/ficecal-monorepo-copy-checklist.md`

### Contribution governance contracts

- `docs/contracts/community-module-contribution-contract.md`
- `docs/contracts/ai-agent-contribution-policy.md`

### Contribution and project playbooks

- `docs/playbooks/community-contribution-guide.md`
- `docs/playbooks/community-first-pr-bundle.md`
- `docs/playbooks/react-best-practices-checklist.md`
- `docs/playbooks/github-project-community-seed.md`
- `docs/playbooks/ficecal-v2-workflow-inventory.md`

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
