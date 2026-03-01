# ADR-0001: D3-First Chart Policy

- Status: Accepted
- Date: 2026-03-01
- Decision owners: platform-core (`duksh` in current single-operator mode)

## Context

FiceCal v2 needs chart rendering that is precise, auditable, and adaptable to multiple UX surfaces without coupling core contracts to a UI library API. The team needs deterministic control over scales, axes, and interaction behavior for FinOps evidence views.

## Decision

1. Use a D3-first approach for chart primitives that are part of core product evidence and analytics surfaces.
2. Keep any higher-level chart wrapper usage behind a local adapter boundary.
3. Treat chart input/output as canonical internal DTOs; provider- or SDK-specific objects cannot cross into chart contracts.
4. Keep rendering concerns in UI layer modules; no chart library types in core economics or schema contracts.

## Consequences

### Positive

- Maximum control for deterministic rendering and evidence reproducibility.
- Lower lock-in risk versus fully proprietary chart abstractions.
- Clear separation between data contracts and rendering mechanics.

### Trade-offs

- Higher upfront implementation complexity than fully prebuilt chart libraries.
- Requires stronger internal conventions for reusable chart components.

## Guardrails

- All chart components must consume canonical mapped data only.
- Optional visualization modules must degrade gracefully per fallback policy.
- Accessibility checks (labels/contrast/keyboard focus) are mandatory for user-facing chart views.

## Traceability

- Backlog links: `F2-EPIC-020`, `F2-STORY-021`, `F2-TASK-026`
- Related contracts/playbooks:
  - `docs/modularization-playbook.md`
  - `docs/provider-sdk-integration-strategy.md`
  - `docs/architecture-decision-traceability-map.md`
- Expected implementation anchors:
  - `apps/web/`
  - `packages/schemas/`
  - `packages/core-economics/`
