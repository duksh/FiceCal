# Community Contribution Guide (Modules)

## 1) Pick module scope

Create or extend only one community module per PR where possible.

Seed reference module:

- `packages/features/community/community.sample-finops-adapter/`

## 2) Add module files

Under `packages/features/community/<module-id>/` add:

- `feature.json`
- implementation files
- tests

## 3) Update contracts/docs

- Update `docs/contracts/*` references for the module
- Ensure contribution policy references are included

## 4) Add parity fixtures

Add valid/invalid and expected output fixtures as required by project fixture policy.

## 5) Open PR with required disclosure

Include:

- contribution type (`human`, `ai-assisted`, or `agent-authored`)
- model/tool disclosure if AI/agent used
- sponsor handle
- evidence links

## 6) Required checks

- CI guardrails
- contract drift guard
- QA Playwright evidence (if user-facing)
- security and SBOM

## 7) Merge policy

No direct push to `main`; maintainers merge only after required approvals and green checks.

## 8) Related playbooks

- `docs/playbooks/github-project-community-seed.md`
- `docs/playbooks/community-first-pr-bundle.md`
