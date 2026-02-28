# Community Module Contribution Contract

## Purpose

Define how external contributors can propose, maintain, and promote FiceCal modules safely.

## Applies to

- `packages/features/community/*`
- optional community adapters and module extensions

## Mandatory metadata (manifest)

```json
{
  "id": "community.<module-name>",
  "version": "0.x",
  "owner": "github-handle-or-team",
  "sponsor": "trusted-maintainer",
  "contributionType": "human|ai-assisted|agent-authored",
  "trustTier": "tier-0|tier-1|tier-2|tier-3",
  "contracts": [
    "docs/contracts/community-module-contribution-contract.md",
    "docs/contracts/ai-agent-contribution-policy.md"
  ]
}
```

## Trust tiers

- `tier-0`: docs/tests only
- `tier-1`: optional module behind flag
- `tier-2`: verified module with stability history
- `tier-3`: candidate for first-party adoption

## Release gates

Block merge unless all are true:

1. Manifest + contract docs updated in same PR
2. Fixture parity checks exist and pass
3. Required Playwright evidence provided for user-facing changes
4. Security and license checks pass
5. Sponsor + CODEOWNER approvals are present

## Security boundaries

- No secrets committed
- No absolute local paths committed
- External calls must be declared and justified
