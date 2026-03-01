# ADR-0002: Fastify + MCP SDK Runtime Stack

- Status: Accepted
- Date: 2026-03-01
- Decision owners: agent-platform (`duksh` in current single-operator mode)

## Context

FiceCal v2 requires an MCP runtime that is fast, observable, and easy to evolve across multiple tool namespaces while preserving strict contract boundaries and compatibility requirements.

## Decision

1. Standardize MCP service runtime on Fastify for request lifecycle control and plugin ergonomics.
2. Build MCP tool exposure through an SDK boundary layer so transport/runtime concerns are isolated from domain modules.
3. Keep provider adapter logic outside core tool orchestration; tools call canonical services, not provider SDKs directly.
4. Enforce normalized error categories across tool responses.

## Consequences

### Positive

- Clear transport/core separation supports future MCP evolution.
- Fastify plugin model supports modular route/tool registration.
- Better observability and lifecycle hooks for telemetry and guardrails.

### Trade-offs

- Additional boundary code is required for mapping and compatibility layers.
- Team must maintain discipline to prevent transport-specific leakage.

## Guardrails

- MCP tools must return canonical schemas from `packages/schemas/`.
- Contract-affecting changes require fixture updates in same change set.
- Legacy alias and compatibility policies must remain test-backed.

## Traceability

- Backlog links: `F2-EPIC-020`, `F2-EPIC-030`, `F2-STORY-022`, `F2-TASK-025`, `F2-TASK-026`
- Related contracts/playbooks:
  - `docs/provider-sdk-integration-strategy.md`
  - `docs/modularization-playbook.md`
  - `docs/architecture-decision-traceability-map.md`
- Expected implementation anchors:
  - `services/mcp/`
  - `packages/mcp-tooling/`
  - `packages/schemas/`
