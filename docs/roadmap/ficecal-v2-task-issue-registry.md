# FiceCal v2 Task and Issue Registry (Human-Readable)

## Purpose

Human-readable companion to `docs/roadmap/ficecal-v2-task-issue-registry.csv`.

Use this file to:

- understand phase sequencing quickly
- track dependencies across epics/stories/tasks
- recover implementation context if chat memory is unavailable

## Source of truth

- Machine source of truth: `docs/roadmap/ficecal-v2-task-issue-registry.csv`
- Execution sequence: `docs/roadmap/ficecal-v2-execution-plan-updated.md`
- Recovery protocol: `docs/roadmap/ficecal-v2-recovery-index.md`

## Summary by phase

| Phase | Theme | Issue ID Range | Status expectation |
|---|---|---|---|
| P00 | Program lock and governance | `F2-EPIC-000` to `F2-TASK-006` | close first |
| P01 | Monorepo hard foundation | `F2-EPIC-010` to `F2-TASK-016` | close before core extraction |
| P02 | Core runtime boundaries | `F2-EPIC-020` to `F2-TASK-026` | close before MCP/tool rollout |
| P03 | MCP baseline and compatibility | `F2-EPIC-030` to `F2-TASK-036` | close before fixture expansion |
| P04 | Fixture parity infrastructure | `F2-EPIC-040` to `F2-TASK-046` | close before release-critical integrations |
| P05 | UI foundation and QA evidence | `F2-EPIC-050` to `F2-TASK-056` | close before cutover rehearsal |
| P06 | Billing adapter framework | `F2-EPIC-060` to `F2-TASK-066` | close before real SDK ingest |
| P07 | Tier-1 real ingest (OpenOps/AWS/Azure/GCP) | `F2-EPIC-070` to `F2-TASK-083` | close before optimization engine |
| P08 | Next-move recommendation engine | `F2-EPIC-090` to `F2-TASK-099` | close before broad rollout |
| P09 | Community/AI governance operations | `F2-EPIC-105` to `F2-TASK-114` | close before scale-out contributions |
| P10 | Security/compliance hardening | `F2-EPIC-120` to `F2-TASK-129` | close before production cutover |
| P11 | Cutover rehearsal and go/no-go | `F2-EPIC-135` to `F2-TASK-142` | close before production release |
| P12 | Production cutover and hypercare | `F2-EPIC-145` to `F2-TASK-152` | close before stable-state handover |
| P13 | Tier-2 provider expansion | `F2-EPIC-155` to `F2-TASK-162` | post-stabilization growth |

## Domain and operations RACI (F2-TASK-003)

RACI legend: **R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed.

### Current operating mode (now)

FiceCal v2 is currently operating in a single-operator execution mode:

- **Accountable owner (A):** `duksh`
- **Responsible execution (R):** `duksh` with AI pairing support from Cascade
- **Consulted/Informed (C/I):** self-review and asynchronous project artifacts

Team labels below are kept intentionally as target operating model placeholders.

### Future scale-out model (target)

When contributors are onboarded, ownership transitions from single-operator mode to the mapped team model.

| Placeholder label | Current mode owner | Future intended owner |
|---|---|---|
| `governance-office` | `duksh` | governance and release management lead(s) |
| `platform-core` | `duksh` | platform engineering team |
| `agent-platform` | `duksh` | MCP/agent runtime maintainers |
| `integration-team` | `duksh` | provider integration engineers |
| `recommendation-team` | `duksh` | optimization/recommendation specialists |
| `ui-foundation-team` | `duksh` | frontend UX/platform team |
| `qa-team` | `duksh` | QA and test automation team |
| `security-team` | `duksh` | security/compliance engineering |
| `docs-team` | `duksh` | documentation/program ops support |

| Domain / operation | R | A | C | I | Primary artifact anchors |
|---|---|---|---|---|---|
| Program governance and phase control | `governance-office` | `governance-office` | `platform-core`, `security-team` | all teams | `docs/roadmap/ficecal-v2-execution-plan-updated.md` |
| Monorepo platform baseline and GitOps controls | `platform-core` | `platform-core` | `governance-office`, `qa-team` | `security-team` | `.github/`; `README.md` |
| Core runtime boundaries and module contracts | `platform-core` | `platform-core` | `agent-platform`, `integration-team`, `recommendation-team` | `qa-team` | `docs/modularization-playbook.md` |
| MCP v2 contract and tool lifecycle | `agent-platform` | `agent-platform` | `platform-core`, `qa-team` | `governance-office` | `docs/mcp-evolution-contract.md` |
| Billing adapters and provider ingest mapping | `integration-team` | `integration-team` | `security-team`, `agent-platform`, `qa-team` | `platform-core` | `services/mcp/src/billing/`; `docs/provider-sdk-integration-strategy.md` |
| Recommendation intelligence and next-move ranking | `recommendation-team` | `recommendation-team` | `integration-team`, `agent-platform` | `platform-core` | `docs/recommendation-module-contract.md` |
| UI foundation and user journey quality | `ui-foundation-team` | `ui-foundation-team` | `qa-team`, `platform-core` | `governance-office` | `docs/ui-foundation-hci-metrics-contract.md` |
| QA evidence and fixture parity operations | `qa-team` | `qa-team` | `platform-core`, `agent-platform`, `integration-team` | `governance-office` | `tests/contracts/fixtures/`; `docs/qa-evidence-storage-convention.md` |
| Security, SBOM, and secret hygiene operations | `security-team` | `security-team` | `platform-core`, `qa-team` | `governance-office` | `docs/security-compliance-ops-runbook.md`; `docs/environment-secret-management-contract.md` |
| Community/AI policy enforcement and onboarding | `governance-office`, `docs-team` | `governance-office` | `platform-core`, `security-team` | `qa-team` | `docs/community-module-contribution-contract.md`; `docs/ai-agent-contribution-policy.md` |
| Cutover rehearsal and hypercare coordination | `platform-core` | `platform-core` | `qa-team`, `security-team`, `governance-office` | all teams | `docs/monorepo-cutover-runbook.md` |

## Blocker severity policy (F2-TASK-004)

### Current operating mode (now)

Single-operator assignment for blocker management:

- **Severity decision owner:** `duksh`
- **Tracking owner:** `duksh`
- **Follow-up and closure owner:** `duksh`
- **AI support:** Cascade supports triage notes, impact analysis, and action checklists

### Future scale-out model (target)

When teams are onboarded, blocker ownership follows this model:

- **Severity decision (R):** `security-team`
- **Program escalation (A):** `governance-office`
- **Domain remediation (R):** owning team for impacted area (`platform-core`, `agent-platform`, `integration-team`, `qa-team`, etc.)
- **Release gate confirmation (R):** `qa-team` + `security-team`

### Severity levels and SLA targets

| Severity | Definition | First response SLA | Update cadence | Target closure SLA | Phase/release impact |
|---|---|---|---|---|---|
| Critical | Active security exposure, data risk, or hard release blocker with no workaround | 1 hour | every 4 hours | 24 hours | Blocks active phase closure and release |
| High | Material correctness/reliability risk or gate failure with limited workaround | 4 hours | daily | 3 business days | Blocks phase closure; may block release |
| Medium | Important issue with workaround and contained scope | 1 business day | twice weekly | 10 business days | Does not block release unless aggregated risk increases |
| Low | Minor defect, documentation/process gap, or optimization item | 2 business days | weekly | next planned cycle | No direct release block |

### Escalation and closure rules

1. Any unresolved **Critical** or **High** blocker prevents phase completion.
2. Critical blockers require same-day mitigation or explicit rollback plan.
3. High blockers require named owner, due date, and daily follow-up until closure.
4. Medium/Low blockers can be deferred only with documented rationale and target milestone.
5. A blocker is closed only when fix evidence and retest evidence are linked in artifacts.

### Tracking discipline

- Maintain blocker status in the issue tracker with fields: severity, owner, due date, last update, evidence links.
- Add blocker references in weekly governance review notes.
- Re-check open Critical/High blockers before any release go/no-go decision.

## Complete catalog (grouped by phase)

## P00 - Program lock

- `F2-EPIC-000` Program lock and governance baseline
- `F2-STORY-001` Freeze authoritative contract index
- `F2-STORY-002` Define phase entry and exit criteria
- `F2-TASK-003` Define RACI by domain
- `F2-TASK-004` Define blocker severity policy
- `F2-TASK-005` Define quality gate matrix
- `F2-TASK-006` Seed memory-loss-safe docs index

## P01 - Monorepo foundation

- `F2-EPIC-010` Monorepo hard foundation
- `F2-STORY-011` Harden repository structure and indexing
- `F2-STORY-012` Activate branch and PR governance
- `F2-TASK-013` Validate workflow inventory
- `F2-TASK-014` Document GitHub settings playbook
- `F2-TASK-015` Create issue seeding playbook
- `F2-TASK-016` Add bootstrap verification checkpoints

## P02 - Core boundaries

- `F2-EPIC-020` Core runtime boundaries and module baseline
- `F2-STORY-021` Define domain-owned interfaces
- `F2-STORY-022` Enforce adapter isolation pattern
- `F2-TASK-023` Map module dependency graph
- `F2-TASK-024` Define module failure fallback policy
- `F2-TASK-025` Document API boundary do-not-cross rules
- `F2-TASK-026` Create architecture decision traceability map

## P03 - MCP baseline

- `F2-EPIC-030` MCP v2 baseline and compatibility
- `F2-STORY-031` Implement capabilities handshake
- `F2-STORY-032` Implement common context envelope
- `F2-TASK-033` Define legacy alias parity tests
- `F2-TASK-034` Define MCP telemetry event contracts
- `F2-TASK-035` Create MCP tool ownership matrix
- `F2-TASK-036` Add MCP release gate checklist

## P04 - Fixture parity

- `F2-EPIC-040` Contract fixture parity infrastructure
- `F2-STORY-041` Enforce fixture-delta-with-contract policy
- `F2-STORY-042` Enable deterministic fixture validation
- `F2-TASK-043` Seed module fixture coverage baseline
- `F2-TASK-044` Seed MCP fixture coverage baseline
- `F2-TASK-045` Define fixture review checklist
- `F2-TASK-046` Add drift triage process for fixture failures

## P05 - UI and QA evidence

- `F2-EPIC-050` UI foundation and evidence pipeline
- `F2-STORY-051` Implement mode-aware UX skeleton
- `F2-STORY-052` Operationalize QA evidence conventions
- `F2-TASK-053` Define user-facing smoke journeys
- `F2-TASK-054` Enforce fail-fix-retest evidence rule
- `F2-TASK-055` Add evidence retention policy checks
- `F2-TASK-056` Validate no-sensitive-data screenshots

## P06 - Billing framework

- `F2-EPIC-060` Billing adapter framework foundation
- `F2-STORY-061` Finalize shared billing adapter interfaces
- `F2-STORY-062` Operationalize phase-1 stubs with fixtures
- `F2-TASK-063` Harden registry and adapter routing
- `F2-TASK-064` Define canonical handoff validation checks
- `F2-TASK-065` Document phase-1 stub playbook
- `F2-TASK-066` Map stub fixtures to contract versions

## P07 - Tier-1 real ingest

- `F2-EPIC-070` Tier-1 real SDK ingest rollout
- `F2-STORY-071` Implement OpenOps real ingestion
- `F2-STORY-072` Implement AWS real ingestion
- `F2-STORY-073` Implement Azure real ingestion
- `F2-STORY-074` Implement GCP real ingestion
- `F2-TASK-075` Define credentials contract for tier-1 providers
- `F2-TASK-076` Implement retry and rate-limit strategy
- `F2-TASK-077` Implement pagination and incremental sync
- `F2-TASK-078` Add integration telemetry for ingest runs
- `F2-TASK-079` Expand provider-specific fixture coverage
- `F2-TASK-080` Validate ingest quality metrics in stage
- `F2-TASK-081` Document provider-specific mapping profiles
- `F2-TASK-082` Add ingest error normalization
- `F2-TASK-083` Create tier-1 cutover checklist

## P08 - Optimization intelligence

- `F2-EPIC-090` Optimization intelligence and next-move engine
- `F2-STORY-091` Define canonical recommendation action model
- `F2-STORY-092` Integrate provider recommendation feeds
- `F2-TASK-093` Implement cross-provider ranking logic
- `F2-TASK-094` Attach provider evidence references
- `F2-TASK-095` Map recommendations to health-score context
- `F2-TASK-096` Add recommendation parity fixtures
- `F2-TASK-097` Expose next-move summary in MCP response
- `F2-TASK-098` Add explainability annotations
- `F2-TASK-099` Validate recommendation quality against scenarios

## P09 - Community and AI governance

- `F2-EPIC-105` Community and AI contribution operations
- `F2-STORY-106` Operationalize trust-tier lifecycle
- `F2-STORY-107` Operationalize AI provenance enforcement
- `F2-TASK-108` Seed community project backlog
- `F2-TASK-109` Run first contributor-ready PR bundle
- `F2-TASK-110` Validate sponsor review enforcement
- `F2-TASK-111` Add community module promotion checklist
- `F2-TASK-112` Audit community path CODEOWNERS coverage
- `F2-TASK-113` Publish contribution onboarding walkthrough
- `F2-TASK-114` Track policy violation handling workflow

## P10 - Security hardening

- `F2-EPIC-120` Security compliance and release reliability
- `F2-STORY-121` Operationalize SBOM and dependency scanning
- `F2-STORY-122` Operationalize secret hygiene and rotation
- `F2-TASK-123` Define security exception register
- `F2-TASK-124` Define CVE triage operating cadence
- `F2-TASK-125` Validate no-secret-in-artifacts workflow
- `F2-TASK-126` Run secret exposure incident drill
- `F2-TASK-127` Attach security summary to release template
- `F2-TASK-128` Validate environment key completeness
- `F2-TASK-129` Audit external exposure components

## P11 - Cutover rehearsal

- `F2-EPIC-135` Cutover rehearsal and go-no-go
- `F2-STORY-136` Run full deployment rehearsal
- `F2-STORY-137` Validate rollback and incident flows
- `F2-TASK-138` Run Pages deployment smoke checks
- `F2-TASK-139` Run Render health smoke checks
- `F2-TASK-140` Verify cross-env config alignment
- `F2-TASK-141` Execute rollback simulation
- `F2-TASK-142` Publish go-no-go decision record

## P12 - Production and hypercare

- `F2-EPIC-145` Production cutover and hypercare
- `F2-STORY-146` Execute production cutover
- `F2-STORY-147` Run hypercare operations
- `F2-TASK-148` Capture release artifacts and evidence
- `F2-TASK-149` Track post-release incidents
- `F2-TASK-150` Run daily contract drift checks
- `F2-TASK-151` Close hypercare with KPI report
- `F2-TASK-152` Hand over to steady-state cadence

## P13 - Tier-2 expansion

- `F2-EPIC-155` Tier-2 provider expansion and roadmap continuation
- `F2-STORY-156` Implement OCI and IBM direct ingest
- `F2-STORY-157` Implement Alibaba and Huawei direct ingest
- `F2-TASK-158` Create tier-2 auth and permission playbooks
- `F2-TASK-159` Add tier-2 fixture packs
- `F2-TASK-160` Add tier-2 stage performance baselines
- `F2-TASK-161` Evaluate guided remediation guardrails
- `F2-TASK-162` Seed GreenOps and ITAM discovery backlog

## Registry maintenance rules

1. New issue IDs must be sequential and unique.
2. Do not delete completed issue rows from CSV; mark status instead.
3. Every issue must include at least one artifact path.
4. Every issue must declare one or more quality gates.
5. Changes to this registry must update CSV in the same commit.
