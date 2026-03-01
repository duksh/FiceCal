## Summary

- What changed:
- Why:
- Scope:

## Contribution Provenance (required)

- Contribution type: `human` | `ai-assisted` | `agent-authored`
- AI/agent tool(s) used (if applicable):
- Human sponsor/reviewer accountable for merge readiness:

## Module and Contract Alignment (required)

- [ ] Module manifest updated (if applicable): `packages/features/*/feature.json`
- [ ] Contract docs updated (if applicable): `docs/contracts/*`
- [ ] Feature catalog/runtime gates updated when module lifecycle changed

## Validation

- [ ] `python3 scripts/validate-feature-catalog.py` (if present)
- [ ] `python3 scripts/validate-doc-links.py` (if present)
- [ ] MCP/tool schema checks (if applicable)
- [ ] Unit/integration tests passed

## QA Automated Testing Evidence (required for user-facing changes)

- [ ] Required Playwright tests executed
- [ ] Screenshot evidence attached (pass/fail states as applicable)
- [ ] Test run proof added (log excerpt, report, or CI link)
- [ ] If failed initially, fix -> re-test evidence included before marking done

## React/Next Performance Review (required for React/Next user-facing changes)

- [ ] `docs/playbooks/react-best-practices-checklist.md` reviewed
- [ ] Critical checks (1-4) passed or remediated
- [ ] Non-applicable checklist items documented in PR summary

## Security and Privacy

- [ ] No secrets, credentials, or local environment sensitive data committed
- [ ] No absolute local paths committed (for example `~/...` should be preferred in docs)
- [ ] Paths in docs/config/examples are repository-relative

## Release Impact

- [ ] Breaking change? If yes, migration notes added
- [ ] Release note entry added
- [ ] Rollback plan documented (feature flag or revert strategy)

## Evidence / Credibility (if applicable)

- [ ] Claims and recommendations include reference/citation updates
- [ ] Evidence coverage impact noted

## Community Module Governance (required when touching `packages/features/community/*`)

- [ ] `owner` + `sponsor` metadata present in module manifest
- [ ] Trust tier declared (`tier-0|tier-1|tier-2|tier-3`)
- [ ] AI/agent contribution policy disclosure complete
