# FiceCal v2 Workflow Inventory Validation (F2-TASK-013)

## Purpose

Validate that required GitHub workflows are present and cross-referenced in governance artifacts.

## Validation scope

- Task: `F2-TASK-013` Validate workflow inventory
- Acceptance target: required workflows are present and referenced
- Workflow directory: `.github/workflows/`
- Gate source: `docs/roadmap/ficecal-v2-execution-plan-updated.md`

## Required inventory snapshot

| Gate ID | Workflow / control | Required path | Status | Referenced in |
|---|---|---|---|---|
| `G-001` | Branch protection checklist | `.github/branch-protection-checklist.md` | Present | `docs/roadmap/ficecal-v2-execution-plan-updated.md`; `docs/roadmap/ficecal-v2-task-issue-registry.md` |
| `G-002` | CI guardrails | `.github/workflows/ci-guardrails.yml` | Present | `docs/roadmap/ficecal-v2-execution-plan-updated.md`; `docs/roadmap/ficecal-v2-task-issue-registry.md` |
| `G-003` | Contract drift | `.github/workflows/contract-drift.yml` | Present | `docs/roadmap/ficecal-v2-execution-plan-updated.md`; `docs/roadmap/ficecal-v2-task-issue-registry.md` |
| `G-004` | Playwright evidence | `.github/workflows/qa-playwright-evidence.yml` | Present | `docs/roadmap/ficecal-v2-execution-plan-updated.md`; `docs/roadmap/ficecal-v2-task-issue-registry.md` |
| `G-005` | Security and SBOM | `.github/workflows/security-sbom.yml` | Present | `docs/roadmap/ficecal-v2-execution-plan-updated.md`; `docs/roadmap/ficecal-v2-task-issue-registry.md` |
| `G-006` | Pages deployment health | `.github/workflows/pages-deploy.yml` | Present | `docs/roadmap/ficecal-v2-execution-plan-updated.md`; `docs/roadmap/ficecal-v2-task-issue-registry.md` |
| `G-007` | Runtime smoke health | `.github/workflows/render-health-smoke.yml` | Present | `docs/roadmap/ficecal-v2-execution-plan-updated.md`; `docs/roadmap/ficecal-v2-task-issue-registry.md` |
| `G-008` | Release checks | `.github/workflows/release.yml` | Present | `docs/roadmap/ficecal-v2-execution-plan-updated.md`; `docs/roadmap/ficecal-v2-task-issue-registry.md` |

## Validation notes

1. `G-001` is a repository control checklist (not a workflow file) and is tracked in the same matrix as pipeline gates.
2. Branch protection minimum required checks should include `validate` and `contract-drift` per `.github/branch-protection-checklist.md`.
3. Any new required gate must be added in the same PR to:
   - `docs/roadmap/ficecal-v2-execution-plan-updated.md`
   - `docs/roadmap/ficecal-v2-task-issue-registry.md`
   - this workflow inventory file
