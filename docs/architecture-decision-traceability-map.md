# Architecture Decision Traceability Map (F2-TASK-026)

## Purpose

Link accepted architecture decisions (ADRs) to implementation modules and backlog issues so design intent remains auditable across code, contracts, and governance artifacts.

## Scope

- Epic: `F2-EPIC-020`
- Story: `F2-STORY-021`
- Task: `F2-TASK-026`

## Traceability matrix

| ADR | Decision summary | Related issues | Implementation/module anchors | Contract/governance anchors | Quality gates |
|---|---|---|---|---|---|
| `docs/adr-0001-d3-first-chart-policy.md` | D3-first chart policy with strict canonical data boundary | `F2-EPIC-020`, `F2-STORY-021`, `F2-TASK-026` | `apps/web/`, `packages/schemas/`, `packages/core-economics/` | `docs/modularization-playbook.md`, `docs/provider-sdk-integration-strategy.md` | `G-002`, `G-003` |
| `docs/adr-0002-fastify-mcp-sdk-stack.md` | Fastify + MCP SDK runtime boundary model | `F2-EPIC-020`, `F2-EPIC-030`, `F2-STORY-022`, `F2-TASK-025`, `F2-TASK-026` | `services/mcp/`, `packages/mcp-tooling/`, `packages/schemas/` | `docs/provider-sdk-integration-strategy.md`, `docs/modularization-playbook.md`, `docs/mcp-evolution-contract.md` | `G-002`, `G-003` |
| `docs/adr-0003-monorepo-structure-choice.md` | Monorepo structure as canonical contract + code + governance source of truth | `F2-EPIC-010`, `F2-STORY-011`, `F2-STORY-012`, `F2-TASK-016`, `F2-TASK-026` | `apps/`, `services/`, `packages/`, `.github/` | `README.md`, `docs/ficecal-monorepo-copy-checklist.md`, `docs/roadmap/ficecal-v2-recovery-index.md` | `G-001`, `G-002`, `G-003`, `G-005` |

## Usage rule

When introducing or updating an ADR:

1. Update this map in the same change set.
2. Ensure each ADR row links to at least one backlog issue and one implementation/module anchor.
3. If a decision changes contract surfaces, include fixture or contract-drift evidence updates in the same PR.

## Maintenance owner

Current operating mode owner: `duksh`.

Future target owner: `platform-core` with review from `governance-office`.
