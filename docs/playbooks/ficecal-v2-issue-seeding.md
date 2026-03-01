# FiceCal v2 Issue Seeding Playbook

Use this playbook to seed and maintain the complete FiceCal v2 implementation backlog from local files.

## Source files

- Machine import: `docs/roadmap/ficecal-v2-task-issue-registry.csv`
- Human reference: `docs/roadmap/ficecal-v2-task-issue-registry.md`
- Execution order: `docs/roadmap/ficecal-v2-execution-plan-updated.md`
- Recovery protocol: `docs/roadmap/ficecal-v2-recovery-index.md`

## Recommended GitHub Project fields

Create these fields in `duksh/FiceCal/projects`:

- `IssueId` (text)
- `Phase` (single-select: P00..P13)
- `Type` (single-select: EPIC/STORY/TASK)
- `OwnerTeam` (single-select)
- `Priority` (single-select: P0..P3)
- `Status` (single-select: Todo/In Progress/Blocked/Done)
- `DependsOn` (text)
- `QualityGates` (text)
- `ArtifactPaths` (text)
- `AcceptanceCriteria` (text)

## Seeding steps

1. Open project table view.
2. Import `docs/roadmap/ficecal-v2-task-issue-registry.csv`.
3. Map columns 1:1 to project fields listed above.
4. Verify no row is dropped during import.
5. Save initial filtered views.

## Required project views

1. **Critical Path**
   - filter: `Priority in (P0, P1)` and `Status != Done`
2. **Current Phase**
   - filter: `Phase == <active>`
3. **Blocked**
   - filter: `Status == Blocked`
4. **Security Gate**
   - filter: `QualityGates contains security-sbom`
5. **QA Evidence Gate**
   - filter: `QualityGates contains qa-playwright-evidence`
6. **Contract Drift Gate**
   - filter: `QualityGates contains contract-drift`

## Operational discipline

- Do not create ad-hoc implementation issues outside the registry ID sequence.
- Any net-new issue must first be appended to CSV and MD registry.
- Any dependency update must be reflected in both issue tracker and CSV.
- Do not mark `Done` without acceptance criteria and artifact paths complete.

## Weekly maintenance routine

1. Reconcile project status back into CSV/MD registry.
2. Verify duplicate `IssueId` does not exist.
3. Verify every in-progress issue has owner and artifact path.
4. Verify each active phase still has one open EPIC until closure.
5. Run docs link validation after any backlog document edit.

## Recovery mode usage

If context is lost:

1. Start with `docs/roadmap/ficecal-v2-recovery-index.md`.
2. Re-seed/refresh project from CSV if drift is high.
3. Resume from highest-priority open issue in lowest open phase.
