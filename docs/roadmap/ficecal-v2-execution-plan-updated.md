# FiceCal v2 Updated Execution Plan (Foundation-First, Recoverable)

## 1) Objective

Deliver FiceCal v2 as a solid, flexible, and extensible practitioner platform with:

- contract-first module architecture
- GitHub-native GitOps operations
- strict QA, security, privacy, and path hygiene
- provider-direct and aggregator billing integrations
- governed community and AI-assisted contribution lanes

This plan is memory-loss safe: sequencing, dependencies, and acceptance gates are recoverable from repository docs.

## 2) Scope and ownership baseline

- Program epic: `F2-EPIC-000`
- Current focus: `F2-EPIC-030` (MCP v2 baseline and compatibility)
- Sequencing source: phase order in this file
- Recovery anchor: `docs/roadmap/ficecal-v2-recovery-index.md`

## 3) Global delivery rules (always-on)

1. No phase is complete without evidence artifacts.
2. No user-facing completion without Playwright evidence.
3. No release if security/SBOM gates are red.
4. No secrets or absolute local paths in repo artifacts.
5. Contract changes must ship with fixture deltas in the same PR.
6. Every issue must map to at least one concrete artifact path.

## 4) Quality gate catalog (canonical references)

| Gate ID | Gate name | Reference |
|---|---|---|
| `G-001` | Branch protection checklist | `.github/branch-protection-checklist.md` |
| `G-002` | CI guardrails | `.github/workflows/ci-guardrails.yml` |
| `G-003` | Contract drift | `.github/workflows/contract-drift.yml` |
| `G-004` | Playwright evidence | `.github/workflows/qa-playwright-evidence.yml` |
| `G-005` | Security and SBOM | `.github/workflows/security-sbom.yml` |
| `G-006` | Pages deployment health | `.github/workflows/pages-deploy.yml` |
| `G-007` | Runtime smoke health | `.github/workflows/render-health-smoke.yml` |
| `G-008` | Release checks | `.github/workflows/release.yml` |

### 4.1) Quality gate phase matrix (F2-TASK-005)

| Gate ID | Primary phase coverage | Release blocking behavior |
|---|---|---|
| `G-001` | P00, P01 | Blocks governance/foundation closure until branch controls are validated |
| `G-002` | P01-P13 | Blocks active phase closure when CI guardrails are red |
| `G-003` | P00-P13 (contract-touching changes) | Blocks contract-affecting merges and phase closure until drift is resolved |
| `G-004` | P05, P08, P11, P12 (user-facing evidence phases) | Blocks user-facing completion claims and go/no-go when evidence is missing |
| `G-005` | P00, P01, P07, P10-P12 | Any Critical/High unresolved security finding blocks release |
| `G-006` | P05, P11, P12 | Blocks release readiness when deployment health is red |
| `G-007` | P07, P11, P12 | Treated as High blocker for active phase and release readiness |
| `G-008` | P11, P12 | Final release blocker; release cannot proceed unless all checks are green |

Enforcement policy: any required gate in red state for the active phase is treated as an open blocker and must be tracked to closure with evidence.

## 5) Phase execution with explicit entry/exit criteria

### Phase P00 - Program lock and governance baseline

- **Primary range:** `F2-EPIC-000` to `F2-TASK-006`
- **Entry criteria:** repository bootstrap exists, governance owners assigned, baseline docs linked.
- **Definition of Done (DoD):**
  - authoritative contract index is frozen and cross-linked
  - phase ordering and dependency policy are documented
  - quality gate references are explicit and reviewable
- **Gate references:** `G-001`, `G-003`, `G-005`

### Phase P01 - Monorepo hard foundation

- **Primary range:** `F2-EPIC-010` to `F2-TASK-016`
- **Entry criteria:** P00 complete.
- **Definition of Done (DoD):**
  - target monorepo layout is stable and documented
  - branch protection rules are applied and verified
  - workflow baseline runs clean on default branch
- **Gate references:** `G-001`, `G-002`, `G-005`

### Phase P02 - Core runtime boundaries and module extraction baseline

- **Primary range:** `F2-EPIC-020` to `F2-TASK-026`
- **Entry criteria:** P01 complete.
- **Definition of Done (DoD):**
  - core domain boundaries are defined and isolated
  - module dependency boundaries are documented
  - contract surfaces for economics and recommendation are frozen
- **Gate references:** `G-002`, `G-003`

### Phase P03 - MCP v2 contract baseline and compatibility layer

- **Primary range:** `F2-EPIC-030` to `F2-TASK-036`
- **Entry criteria:** P02 complete.
- **Definition of Done (DoD):**
  - module-aware MCP contract is in place
  - backward compatibility aliases are documented and tested
  - telemetry envelope contract is versioned
- **Gate references:** `G-002`, `G-003`

### Phase P04 - Contract fixture parity infrastructure

- **Primary range:** `F2-EPIC-040` to `F2-TASK-046`
- **Entry criteria:** P03 complete.
- **Definition of Done (DoD):**
  - fixture skeletons exist for all active contracts
  - deterministic contract checks run in CI
  - fixture parity failures are blocking
- **Gate references:** `G-002`, `G-003`

### Phase P05 - UI foundation and quality evidence pipeline

- **Primary range:** `F2-EPIC-050` to `F2-TASK-056`
- **Entry criteria:** P03 complete.
- **Definition of Done (DoD):**
  - UI foundation and mode-awareness are stable
  - critical user flows have test coverage
  - evidence paths are published and repeatable
- **Gate references:** `G-002`, `G-004`

### Phase P06 - Billing adapter framework foundation

- **Primary range:** `F2-EPIC-060` to `F2-TASK-066`
- **Entry criteria:** P04 complete.
- **Definition of Done (DoD):**
  - canonical billing adapter interfaces are frozen
  - phase-1 adapters (OpenOps/AWS/Azure/GCP) have stub parity
  - billing fixture scaffolding exists for adapter contracts
- **Gate references:** `G-002`, `G-003`

### Phase P07 - Tier-1 real SDK/API ingest (OpenOps + AWS + Azure + GCP)

- **Primary range:** `F2-EPIC-070` to `F2-TASK-089`
- **Entry criteria:** P06 complete.
- **Definition of Done (DoD):**
  - read-first production-safe ingest is implemented
  - auth, retry, and rate-limit controls are validated
  - provider-to-canonical mapping thresholds meet acceptance targets
- **Gate references:** `G-002`, `G-003`, `G-005`

### Phase P08 - Provider optimization intelligence and next-move engine

- **Primary range:** `F2-EPIC-090` to `F2-TASK-099`
- **Entry criteria:** P07 complete.
- **Definition of Done (DoD):**
  - canonical action model supports cross-provider recommendations
  - ranking and confidence logic are documented and testable
  - recommendation evidence references are traceable
- **Gate references:** `G-002`, `G-003`, `G-004`

### Phase P09 - Community and AI contribution operations

- **Primary range:** `F2-EPIC-105` to `F2-TASK-114`
- **Entry criteria:** P01 complete.
- **Definition of Done (DoD):**
  - trust-tier and provenance workflow is operational
  - sponsor and disclosure rules are enforceable
  - first non-core contribution merges under full governance controls
- **Gate references:** `G-001`, `G-002`, `G-003`

### Phase P10 - Security/compliance and release reliability hardening

- **Primary range:** `F2-EPIC-120` to `F2-TASK-129`
- **Entry criteria:** P01 complete.
- **Definition of Done (DoD):**
  - vulnerability and SBOM operating policy is active
  - rotation and incident drill evidence is present
  - blocking thresholds and SLA ownership are confirmed
- **Gate references:** `G-002`, `G-005`

### Phase P11 - Cutover rehearsal and go/no-go

- **Primary range:** `F2-EPIC-135` to `F2-TASK-142`
- **Entry criteria:** P05, P08, and P10 complete.
- **Definition of Done (DoD):**
  - full cutover dry-run report is published
  - rollback drills succeed for web and runtime surfaces
  - go/no-go checklist is signed with no unresolved critical blockers
- **Gate references:** `G-006`, `G-007`, `G-008`

### Phase P12 - Production cutover and hypercare

- **Primary range:** `F2-EPIC-145` to `F2-TASK-152`
- **Entry criteria:** P11 complete.
- **Definition of Done (DoD):**
  - release execution records are complete
  - hypercare health metrics are stable through the window
  - handoff to steady-state owners is signed
- **Gate references:** `G-005`, `G-006`, `G-007`, `G-008`

### Phase P13 - Tier-2 expansion and long-horizon roadmap

- **Primary range:** `F2-EPIC-155` to `F2-TASK-162`
- **Entry criteria:** P12 complete.
- **Definition of Done (DoD):**
  - tier-2 provider integration plan is active in backlog
  - parity and governance model is preserved for expansion work
  - next strategic roadmap update is published
- **Gate references:** `G-002`, `G-003`, `G-005`

## 6) Critical path and dependency rules

Critical path:

1. `P00 -> P01 -> P02 -> P03 -> P04`
2. `P04 -> P06 -> P07 -> P08`
3. `P01 + P03 + P05 -> P11 -> P12`
4. `P09` and `P10` run in parallel but must be complete before `P12` closure

Dependency rules:

- no live SDK ingest before adapter framework closure (`P06`)
- no release activity without fixture and quality gating (`P04+`)
- no hypercare closure without security hardening complete (`P10`)

## 7) Program-level completion definition

FiceCal v2 implementation is complete when all are true:

- phases `P00` through `P12` are closed in the execution backlog
- no unresolved `Critical` or `High` blocker remains
- release gates are green in CI
- recovery protocol can be executed from repository docs only
- hypercare closure report is approved
