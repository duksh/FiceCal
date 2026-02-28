# First Contributor-Ready PR Bundle (Community Module)

Use this bundle to open the first community module PR in `duksh/FiceCal`.

## 1) Scope (single PR)

- one module only: `community.sample-finops-adapter`
- one trust tier: `tier-1`
- one contribution type declared: `human` or `ai-assisted` or `agent-authored`

## 2) Required files in PR

- `packages/features/community/community.sample-finops-adapter/feature.json`
- `packages/features/community/community.sample-finops-adapter/src/index.ts`
- `packages/features/community/community.sample-finops-adapter/tests/community.sample-finops-adapter.test.ts`
- `tests/contracts/fixtures/community.sample-finops-adapter/0.1.0/*`
- `packages/features/community/registry.json`
- PR description using `.github/PULL_REQUEST_TEMPLATE.md`

## 3) Suggested PR title

`feat(community): add community.sample-finops-adapter tier-1 starter module`

## 4) Copy-ready PR summary block

```markdown
## Summary

- What changed: Added community.sample-finops-adapter baseline module scaffold with tests and fixtures.
- Why: Establish first governed community contribution path for FiceCal v2.
- Scope: Community module path only (`packages/features/community/*`).

## Contribution Provenance (required)

- Contribution type: ai-assisted
- AI/agent tool(s) used (if applicable): <fill>
- Human sponsor/reviewer accountable for merge readiness: @duksh
```

## 5) Must-pass checks before merge

- CI Guardrails
- Contract Drift Guard
- QA Playwright Evidence (if user-facing behavior touched)
- Security and SBOM
- Sponsor + CODEOWNER approval

## 6) Evidence checklist

- test output attached
- fixture parity evidence attached
- screenshot/log proof attached for user-facing changes
- rollback plan documented
