# FiceCal v2 — Framework 2026 and FOCUS 1.3 Coverage Baseline

- Date: 2026-03-20
- Phase: Phase 0 — Baseline freeze and parity definition
- Status: **authoritative baseline** — this document is the reference for all future roadmap alignment claims
- Evidence anchor: `docs/phase-0-baseline/`

---

## Purpose

This document records the **honest baseline coverage** of FiceCal v2 against two external frameworks as of Phase 0:

1. **FinOps Framework 2026** (executive strategy, technology categories, and converging disciplines)
2. **FOCUS 1.3** (contract commitments, split cost allocation, recency and completeness dimensions)

Every future roadmap claim of framework alignment must be traceable to additions made *after* this baseline. Claims cannot be made for capabilities listed as "not covered" or "partial" below unless a subsequent PR delivers explicit evidence.

---

## 1. FinOps Framework 2026 Coverage

### 1A. Coverage rating key

| Rating | Meaning |
| --- | --- |
| `covered` | Explicitly implemented and evidence-backed in the current codebase |
| `partial` | Partially addressed — structural scaffolding or planning exists, but full implementation is incomplete |
| `planned` | Roadmap-targeted but not yet started in v2 |
| `not covered` | No implementation or planning at Phase 0; would require deliberate future work |

### 1B. Framework 2026 capability assessment

| Capability area | Rating | Evidence or notes |
| --- | --- | --- |
| **Executive strategy decision support** | partial | Mode-aware UX scaffold exists (`apps/web/`) with `architect` and `quick` intent modes; no economics output yet to support with |
| **KPI-led optimization guidance** | not covered | `core-economics` is planned but not implemented; no KPI signal computation exists |
| **Architecture / workload placement framing** | not covered | `architecture-tradeoffs` module not yet created; no workload comparison logic |
| **Explicit FinOps scopes** | partial | Scope taxonomy defined in plan doc (section 4C); not operationalized in UI or module contracts yet |
| **Broader technology-category coverage** | partial | AI model pricing covered via `duksh-models-adapter`; cloud billing covered via P06-P07 billing adapters (AWS, Azure, GCP, OpenOps); no SaaS, datacenter, or sustainability categories |
| **Governance / policy interpretation surfaces** | partial | CI quality gates (G-001 through G-008) and community contribution governance (trust tiers, disclosure rules) established; no user-facing policy surfaces |
| **Sustainability readiness** | not covered | Deliberately deferred post-Phase 7 |
| **Usage optimization guidance** | not covered | No rightsizing, spot, or RI recommendation logic implemented |
| **Business-question framing** | partial | Intent modes (`quick`, `operator`, `architect`) scaffold exists in UI; not yet tied to scope-aware question framing |

### 1C. Framework 2026 — what FiceCal v2 legitimately covers at Phase 0

FiceCal v2 at Phase 0 can honestly claim:
- **Contract-first module architecture** aligned with governance-backed, evidence-driven delivery practices
- **Billing data ingestion foundation** for AWS, Azure, GCP, and OpenOps via normalized canonical adapter interface (P06-P07)
- **AI model pricing reference integration** via `duksh-models-adapter` — enables future AI economics comparisons
- **Mode-aware UX scaffold** that supports intent-differentiated presentation (quick / operator / architect)
- **Community contribution governance** with trust tiers and disclosure rules

FiceCal v2 at Phase 0 cannot yet claim:
- Any KPI computation, optimization recommendation, or decision-support output
- FinOps scope-aware analytical surfaces
- Workload placement or architecture tradeoff analysis
- Executive strategy or governance reporting

---

## 2. FOCUS 1.3 Coverage

### 2A. FOCUS 1.3 capability assessment

| FOCUS 1.3 capability | Rating | Evidence or notes |
| --- | --- | --- |
| **Contract commitment dataset handling** | not covered | No commitment data structures implemented; planned for Phase 6 via `NormalizedCostRecord.commitmentType` and `commitmentReference` fields |
| **Split shared-cost allocation representation** | not covered | No allocation logic; planned for Phase 6 via `allocationScope` and `allocationMethod` fields in `NormalizedCostRecord` |
| **Allocation-method transparency** | not covered | Field exists in planned `NormalizedCostRecord` schema; not implemented |
| **Recency and completeness metadata** | partial | `ingestedAt` and `effectiveAt` fields defined in `ModelPricingReference` contract; `dataCompleteness` and `dataRecencyTimestamp` defined in planned `NormalizedCostRecord` schema; staleness badge implemented in Model Lens UI — not yet in v2 billing outputs |
| **Service-provider vs host-provider distinction** | not covered | `providerRole` enum field defined in planned `NormalizedCostRecord` schema; not implemented in billing adapters |
| **Normalized billing periods** | partial | `billingPeriodStart` / `billingPeriodEnd` defined in planned `NormalizedCostRecord`; billing adapter canonical handoff carries period context but is not FOCUS-structured |
| **Currency normalization** | not covered | `forex.json` exists in `ficecal-model-lens` upstream; ECB forex adapter not yet implemented in v2 — planned for Phase 1 `economics-module` (Gap 5) |
| **Charge-type disambiguation (`amountType`)** | not covered | `amountType` enum (actual / amortized / blended / list / allocated) defined in planned `NormalizedCostRecord`; no ingest pipeline implements it yet |

### 2B. FOCUS 1.3 — what FiceCal v2 legitimately covers at Phase 0

FiceCal v2 at Phase 0 cannot claim FOCUS 1.3 support. The following foundational work is in place:
- **`NormalizedCostRecord` contract schema** is drafted in the plan (section 5 / Phase 1) and will become the FOCUS-aligned ingestion surface
- **`ModelPricingReference`** carries `ingestedAt`, `effectiveAt`, `pricingSourceType`, and `sourceVersion` — aligning with FOCUS's recency and completeness metadata intent for pricing reference data specifically
- **Billing adapter canonical handoff** (`infraTotal`, `cudPct`, `budgetCap`, `nRef`) exists but is a simplified summary, not a FOCUS-structured cost record

FiceCal v2 at Phase 0 cannot yet claim:
- Any FOCUS 1.3 data-model conformance
- Commitment, allocation, or charge-type representation
- Provider-role semantics
- Recency/completeness metadata on billing outputs

---

## 3. Baseline summary

| Dimension | Phase 0 honest position |
| --- | --- |
| Framework 2026 alignment | Directionally credible in governance, architecture, and delivery practices; no user-facing economics or decision-support output yet |
| FOCUS 1.3 alignment | Not yet claimable; contract schema design is FOCUS-informed; implementation begins Phase 1 (economics-module) and Phase 6 (integration-module) |
| AI model economics | Model pricing reference pipeline fully operational end-to-end (ficecal-model-lens → duksh-models-adapter → ModelPricingReference); ai-token-economics consumer not yet implemented |
| Billing data ingestion | AWS, Azure, GCP, OpenOps canonical adapters functional and fixture-tested; live ingest in final rollout (P07) |
| UI / UX | Mode-aware UX scaffold complete and Playwright-evidenced; no economics output to display yet |

---

## 4. Governance rule

Any PR that asserts alignment with Framework 2026 or FOCUS 1.3 beyond the "partial" ratings in this document must include:
1. A reference to the specific capability row being upgraded
2. Artifact evidence (fixture, contract field, test) demonstrating the implementation
3. An update to this baseline document upgrading the rating from `partial` or `not covered`

This document is owned by the phase release process. Updating a rating to `covered` is a phase-level event, not a feature-level event.
