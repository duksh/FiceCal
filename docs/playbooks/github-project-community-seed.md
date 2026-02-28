# GitHub Project Seed Playbook (Community Contributions)

Use this to seed `https://github.com/duksh/FiceCal/projects` for community and AI/agent module rollout.

## 1) Import seed rows

1. Open your project table view.
2. Choose **Add item** -> **Import CSV** (or paste rows manually if CSV import is not enabled).
3. Use file:

- `docs/references/github-project-community-seed.csv`

## 2) Map fields

Map CSV columns to project fields:

- `Title` -> Title
- `Type` -> Type
- `Workstream` -> Workstream
- `Status` -> Status
- `Priority` -> Priority
- `Target Wave` -> Target Wave
- `QA Evidence` -> QA Evidence
- `Risk` -> Risk
- `Owner Team` -> Owner Team
- `Labels` -> Labels
- `Acceptance Criteria` -> body/notes

## 3) Recommended views

1. **Community Intake**: filter `labels contains community-module`
2. **AI/Agent Governance**: filter `labels contains ai-generated`
3. **QA Gate**: filter `QA Evidence != Attached-Pass`
4. **Security Gate**: filter `labels contains security`

## 4) Initial triage order

1. `Story: Enable community module CODEOWNERS path`
2. `Story: Seed first module community.sample-finops-adapter`
3. `Task: Launch first contributor-ready PR bundle`
4. `Task: Verify Playwright evidence path for community UI changes`
5. `Task: Run security SBOM workflow for sample module PR`

## 5) Definition of done for seed rollout

- all Wave 1 community tasks closed
- sample community module merged
- AI/agent provenance disclosures visible in merged PRs
- QA and security workflows green for sample PR
