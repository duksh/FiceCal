# ADR-0003: Monorepo Structure Choice

- Status: Accepted
- Date: 2026-03-01
- Decision owners: platform-core (`duksh` in current single-operator mode)

## Context

FiceCal v2 spans UI, MCP runtime, shared contracts, provider adapters, and governance artifacts. Development needs consistent versioning, contract drift controls, and cross-module change traceability.

## Decision

1. Use a monorepo structure with workspace-managed packages and services.
2. Keep core domain logic, schemas, integrations, and tooling in explicit top-level module boundaries.
3. Treat docs/contracts/playbooks as first-class release artifacts in the same repository.
4. Enforce relative paths and CI guardrails across all repo artifacts.

## Consequences

### Positive

- Single source of truth for contracts, code, and governance artifacts.
- Easier cross-module refactoring with consistent CI and review controls.
- Better traceability between issue registry rows and implementation paths.

### Trade-offs

- Requires strict ownership and boundary enforcement to avoid coupling.
- CI can become broader/heavier without scoped checks.

## Guardrails

- Every contract-affecting change must include fixture/evidence updates.
- No secrets and no absolute local paths in committed artifacts.
- Community and AI contribution lanes must follow governance contracts.

## Traceability

- Backlog links: `F2-EPIC-010`, `F2-STORY-011`, `F2-STORY-012`, `F2-TASK-016`, `F2-TASK-026`
- Related contracts/playbooks:
  - `README.md`
  - `docs/ficecal-monorepo-copy-checklist.md`
  - `docs/roadmap/ficecal-v2-recovery-index.md`
  - `docs/architecture-decision-traceability-map.md`
- Expected implementation anchors:
  - `apps/`
  - `services/`
  - `packages/`
  - `.github/`
