# FiceCal v2 Monorepo Cutover Runbook

## Status: executed (Phase 4)

This runbook documents the Phase 4 monorepo cutover — the transition from
isolated package development to a fully structured monorepo with service,
app, package, and contract boundaries enforced.

## Cutover readiness checklist

Before executing any structural cutover step, verify all of the following:

- [ ] At least one live web app with real package consumers (`apps/web` ✅)
- [ ] At least three shared packages with actual consumers (`core-economics`, `health-score`, `ui-foundation` ✅)
- [ ] At least one service scaffold with defined contract traffic (`services/mcp` ✅)
- [ ] `packages/contracts/` extracted with cross-package types ✅
- [ ] `CODEOWNERS` defined and enforceable ✅
- [ ] `feature-catalog.json` reflects actual module status ✅
- [ ] All tests passing on `develop` ✅
- [ ] `v2.0.0-phase-3-exit` tag exists as rollback point ✅

## Directory layout after Phase 4 cutover

```
ficecal/
├── apps/
│   └── web/                  ← FiceCal v2 browser runtime (Vite + React)
├── services/
│   └── mcp/                  ← Phase 5 MCP service scaffold (Fastify + MCP SDK)
├── packages/
│   ├── contracts/            ← Shared cross-package boundary types (NEW Phase 4)
│   ├── core-economics/       ← Phase 1 economics kernel
│   ├── economics-module/     ← Phase 2 plugin registry umbrella
│   ├── ai-token-economics/   ← Phase 2 AI pricing unit dispatcher
│   ├── sla-slo-sli-economics/← Phase 2 reliability economics
│   ├── multi-tech-normalization/ ← Phase 2 multi-technology normalizer
│   ├── budgeting-forecasting/← Phase 2 budget variance + forecasting
│   ├── reference-evidence/   ← Phase 2 evidence catalog
│   ├── demo-scenarios/       ← Phase 2 canonical demo scenarios
│   ├── qa-module/            ← Phase 2 engine contract harness
│   ├── chart-presentation/   ← Phase 2 D3-first chart payload builders
│   ├── health-score/         ← Phase 2 weighted signal engine
│   ├── recommendation-module/← Phase 2 audience-aware recommendations
│   ├── feature-registry/     ← Phase 2/4 plugin registration contract
│   ├── mcp-tooling/          ← Phase 2/5 MCP tool registry
│   ├── ui-foundation/        ← Phase 3 framework-agnostic UI primitives
│   ├── schemas/              ← Phase 0 model pricing schema
│   └── integrations/         ← Phase 0 duksh-models-adapter
├── src/
│   └── features/feature-catalog.json
├── docs/
│   ├── roadmap/
│   └── playbooks/
├── CODEOWNERS
└── pnpm-workspace.yaml
```

## FiceCal Model Lens (deferred to Phase 4 completion)

`duksh/ficecal-model-lens` (formerly `duksh/models`) remains a standalone
Astro site until Phase 4 apps/web production wiring is complete. At that
point, copy source into `apps/model-lens/` and migrate its CI into this repo.

Connection point until then: `packages/integrations/models-pricing` consumes
the published `data.json` snapshot from Model Lens — no direct repo dependency.

## Package boundary rules

1. **`packages/contracts/`** — zero dependencies; consumed by all. Never import from here into contracts itself.
2. **`packages/core-economics/`** — no UI dependencies; pure compute.
3. **`packages/ui-foundation/`** — no economics dependencies; pure UI primitives.
4. **`apps/web/`** — may import any package; never imported by packages.
5. **`services/`** — may import packages; never imported by apps or packages.

## Contract drift detection

CI must run `pnpm typecheck` on all packages on every PR touching `packages/contracts/`.
Any type error after a contracts change = blocking merge gate.

## Rollback procedure

If any post-cutover step causes regressions:
1. `git tag` rollback to `v2.0.0-phase-3-exit`
2. Revert the specific feature branch via `git revert`
3. File a blocker issue with reproduction steps before re-attempting
