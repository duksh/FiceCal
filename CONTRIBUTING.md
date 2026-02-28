# Contributing to FiceCal v2

Thanks for contributing to `duksh/FiceCal`.

## Contribution lanes

1. Human-authored PR
2. AI-assisted PR (for example: Claude, Gemini, Copilot)
3. Agent-authored PR (bot/automation with human sponsor)

All lanes must pass the same quality, security, and governance checks.

## Required for all contributions

- Follow module contract-first structure (`packages/features/*/feature.json` + `docs/contracts/*`).
- No secrets or absolute local paths in commits.
- Keep changes scoped and traceable.
- Include tests for behavior changes.

## Required for user-facing changes

- Run required Playwright tests.
- Attach screenshot/log evidence in PR.
- If tests fail, fix and re-test before completion.

## Required for AI/agent-assisted contributions

- Disclose model/tool used.
- Mark contribution type (`ai-assisted` or `agent-authored`).
- Provide human sponsor/reviewer accountable for merge readiness.

## Community module contributions

Community module path:

- `packages/features/community/`

Required bootstrap files:

- module manifest (`feature.json`)
- contract doc references
- fixture parity coverage
- owner + sponsor metadata

See:

- `docs/contracts/community-module-contribution-contract.md`
- `docs/contracts/ai-agent-contribution-policy.md`
- `docs/playbooks/community-contribution-guide.md`
