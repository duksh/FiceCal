# FiceCal v2 — Phase 0 Parity and Intentional Change Declaration

- Date: 2026-03-20
- Phase: Phase 0 — Baseline freeze and parity definition
- Status: **authoritative baseline** — defines what must be preserved and what is intentionally changing as v2 advances
- Evidence anchor: `docs/phase-0-baseline/`

---

## Purpose

This document records:

1. **Parity-protected behaviors** — capabilities that must be preserved or replicated equivalently as v2 phases advance
2. **Intentional behavior changes** — known, deliberate differences between the current state and v2 target behavior
3. **Evidence inventory** — where Phase 0 exit criteria are already met and by what artifact

---

## 1. Parity-protected behaviors

These behaviors are established baselines that v2 must preserve through all subsequent phases. Regression against any of these requires an explicit, reviewed exception.

### 1A. UI and UX parity

| Behavior | Implementation location | Parity requirement |
| --- | --- | --- |
| Three operating modes: quick, operator, architect | `apps/web/src/mode-aware-ux.js` | All three modes must remain available and functional through Phase 3 UI foundation |
| Context continuity across mode switches | `apps/web/src/mode-aware-ux.js` | workspace ID, date range, and currency must persist when switching modes |
| Shared context form (workspace, start/end date, currency) | `apps/web/src/index.html` | Form fields and validation rules must be reproduced in v2 UI foundation |
| Input validation (date range, required fields) | `apps/web/src/mode-aware-ux.js` | Date range checks and required field enforcement must carry forward |
| Graceful error/degraded state messaging across all modes | `apps/web/src/mode-aware-ux.js` | Error recovery clarity is an explicit HCI contract metric (see `docs/ui-foundation-hci-metrics-contract.md`) |
| Currency defaulting to MUR | `apps/web/src/index.html` | Default currency must be configurable; MUR as default must be preserved until explicitly changed by user preference |

### 1B. Billing integration parity

| Behavior | Implementation location | Parity requirement |
| --- | --- | --- |
| Read-only credential policy | `services/mcp/src/billing/credentials.ts` | `authMode: "read-only"` must be enforced for all provider adapters; `credentialRef` remains opaque |
| Canonical billing handoff shape | `services/mcp/src/billing/types.ts` | `BillingCanonicalHandoff` fields (`infraTotal`, `cudPct`, `budgetCap`, `nRef`) must not be renamed or removed without a versioned contract migration |
| Adapter registry fallback to OpenOps | `services/mcp/src/billing/registry.ts` | Unknown adapter references must resolve to `openops-billing` default without crashing |
| Normalized error codes | `services/mcp/src/billing/types.ts` | `BillingIngestError` error code taxonomy must be preserved and extended, not replaced |
| Provenance in every canonical handoff | `services/mcp/src/billing/types.ts` | Source version, coverage %, mapping confidence, and warnings must appear in every handoff |

### 1C. Model pricing parity

| Behavior | Implementation location | Parity requirement |
| --- | --- | --- |
| `APPROVED_BENCHMARKS` gate | `packages/schemas/model-catalog/index.ts` | No benchmark key outside the approved list may appear in `ModelPricingReference.benchmarkScores` |
| `pricingSourceType` required | `packages/schemas/model-catalog/index.ts` | Every `ModelPricingReference` record must carry a `pricingSourceType`; silent omission is not permitted |
| `per_image` records must not carry token cost fields | `packages/integrations/models-pricing/src/transform.ts` | Image records must never carry `inputTokenCost` or `outputTokenCost` |
| Snapshot versioning format | `packages/integrations/models-pricing/src/snapshot.ts` | `sha256[0:12]@YYYY-MM-DD` format is canonical; any change requires a versioned contract amendment |
| Staleness warning at 7 days | `docs/contracts/model-catalog-adapter-contract.md` | If snapshot age exceeds 7 days, all affected outputs must be labeled `stale-reference` |

### 1D. CI and governance parity

| Behavior | Implementation location | Parity requirement |
| --- | --- | --- |
| All 8 quality gates (G-001 through G-008) | `.github/workflows/` | Must remain active and blocking for their designated phases |
| No secrets or absolute paths in repo artifacts | Enforced by G-002 (gitleaks) | Permanent — never overridden |
| Contract changes must include fixture deltas | Global delivery rule #5 | Enforced in PR review; no exceptions |
| Evidence artifacts required for every phase closure | Global delivery rule #1 | Phase 0 evidence is this document and `framework-focus-coverage-baseline.md` |

### 1E. Community governance parity

| Behavior | Implementation location | Parity requirement |
| --- | --- | --- |
| Trust tier taxonomy (tier-0 through tier-3) | `docs/contracts/community-module-contribution-contract.md` | Trust tier definitions must not be compressed or merged |
| AI contribution disclosure rule | `docs/contracts/ai-agent-contribution-policy.md` | AI-generated contributions must carry disclosure and human sponsor; not negotiable |
| Community module isolation | `packages/features/community/` | Community modules must not gain direct imports into `core-economics` or `services/mcp/billing/` without a tier-3 promotion review |

---

## 2. Intentional behavior changes in v2

These are deliberate, known differences from either the v1 live product or from earlier v2 phase scaffolding.

| Change | Rationale | Scope |
| --- | --- | --- |
| **`core-economics` module will replace any ad hoc calculation** | v1 (duksh.github.io) performs calculations inline in the page shell; v2 externalizes all computation into `packages/core-economics` with validated schemas | Phase 1 |
| **Chart rendering will use D3 primitives only (ADR-0001)** | v1 may use mixed rendering approaches; v2 enforces D3-first for auditable, deterministic chart output | Phase 2 |
| **`ModelPricingReference` replaces raw upstream data structures in all consumers** | No v2 module or UI component may import directly from `ficecal-model-lens` data shapes; the adapter contract is the only permitted boundary | Already enforced (PR #118) |
| **`NormalizedCostRecord` will replace ad hoc billing cost shapes in economics outputs** | The planned `NormalizedCostRecord` contract (Phase 1) will be the only permitted shape for passing cost data into `economics-module` | Phase 1 |
| **Currency will be injected as a named dependency, not hardcoded** | `EcbForexAdapter` / `StaticForexAdapter` injection pattern; direct import of forex data inside domain logic is not permitted | Phase 1 (Gap 5) |
| **MCP service layer is transport only** | Domain logic must live in packages, not in MCP tool handlers; MCP tools are thin wrappers | Phase 5 onwards |
| **Monorepo cutover deferred to Phase 4** | `ficecal-model-lens` remains a separate repo until real shared packages exist; premature cutover is blocked | Phase 4 |
| **`pricingSourceType === "hardcoded"` prices render a staleness badge** | v1 Model Lens site shows prices without trust indicators; v2 requires visible sourcing metadata on every pricing output | Already enforced in Model Lens UI |
| **Benchmark scores are reference signals, not ranking determinants** | `recommendation-module` must not silently rank models by benchmark scores without explicit user opt-in | Phase 2 |

---

## 3. Phase 0 exit criteria evidence inventory

This section documents where each Phase 0 exit criterion is satisfied.

### Exit criterion 1: Known-good baseline is documented and reproducible

| Deliverable | Status | Evidence artifact |
| --- | --- | --- |
| Contract fixture baselines for billing adapters | ✅ | `tests/contracts/fixtures/mcp/billing.*/1.0/` |
| Model catalog adapter fixture baseline | ✅ | `packages/integrations/models-pricing/tests/fixtures/sample-data.json` |
| UI mode-aware UX baseline | ✅ | `tests/evidence/p05/` (Playwright evidence) |
| MCP v2 context envelope baseline | ✅ | `tests/contracts/fixtures/mcp/mcp.context.envelope/2.0/` |
| Framework 2026 / FOCUS 1.3 coverage baseline | ✅ | `docs/phase-0-baseline/framework-focus-coverage-baseline.md` |
| Parity and change declaration | ✅ | This document |

### Exit criterion 2: Parity acceptance rules exist for core outputs and key flows

| Rule | Enforcement mechanism |
| --- | --- |
| Billing canonical handoff shape must not drift | G-003 (contract drift CI) — blocks contract-affecting merges |
| CI must be green before any phase closure | G-002 (ci-guardrails) — active on all branches |
| No fixture regression | `validate:fixture-coverage` script — run in CI |
| Benchmark keys must stay within approved list | `APPROVED_BENCHMARKS` typed const + adapter strip logic + test assertion |
| Snapshot versioning format must not change | Documented in `docs/contracts/model-catalog-adapter-contract.md` + test assertion |

### Exit criterion 3: Strategic-alignment baseline is documented

| Deliverable | Status | Evidence artifact |
| --- | --- | --- |
| Framework 2026 capability coverage ratings | ✅ | `docs/phase-0-baseline/framework-focus-coverage-baseline.md` section 1B |
| FOCUS 1.3 capability coverage ratings | ✅ | `docs/phase-0-baseline/framework-focus-coverage-baseline.md` section 2A |
| What v2 can and cannot claim at Phase 0 | ✅ | `docs/phase-0-baseline/framework-focus-coverage-baseline.md` sections 1C and 2B |

---

## 4. Phase 0 exit declaration

All three exit criteria are satisfied as of 2026-03-20.

**Phase 0 is complete.** The following actions finalize the phase:

1. Create `release/phase-0` branch off `develop`
2. Merge `release/phase-0` to `main` via PR
3. Tag `v2.0.0-phase-0-exit` on the merge commit — immutable snapshot
4. Advance active focus to Phase 1: `feature/economics-module`

---

## 5. Open items carried into Phase 1

These items were identified during Phase 0 but are deliberately deferred:

| Item | Reason for deferral | Planned phase |
| --- | --- | --- |
| `core-economics` module implementation | Requires Phase 0 baseline to be frozen first | Phase 1 |
| ECB forex adapter (Gap 5) | Requires `economics-module` contract shape to be stable | Phase 1 |
| `ai-token-economics` `pricingUnit` dispatch branch (Gap 1 remainder) | Requires Phase 1 `economics-module` compute kernel to exist | Phase 2 |
| Chart rendering baselines (D3 fixtures) | No charts rendered yet; defer until `chart-presentation` module | Phase 2 |
| Scope-aware business-question UX surfaces | Requires UI foundation + economics module | Phase 3 |
| Branch protection rules on `main` and `develop` | Manual GitHub repo settings step (pending) | Immediate |
