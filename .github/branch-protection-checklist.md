# Branch Protection Checklist (`main`)

Apply these settings in GitHub repository settings for `main`.

## Required protections

- [ ] Require a pull request before merging
- [ ] Require approvals: minimum `1` (recommended `2` for governance/security changes)
- [ ] Dismiss stale approvals when new commits are pushed
- [ ] Require review from Code Owners
- [ ] Require status checks to pass before merging
- [ ] Require branches to be up to date before merging
- [ ] Require conversation resolution before merging
- [ ] Do not allow bypassing the above settings
- [ ] Restrict who can push to matching branches (no direct pushes for humans)

## Recommended required checks

- `validate` (from `.github/workflows/ci-guardrails.yml`)
- `contract-drift` (from `.github/workflows/contract-drift.yml`)

## Security options

- [ ] Enable secret scanning (including push protection)
- [ ] Enable dependency graph and Dependabot alerts
- [ ] Enable code scanning (CodeQL or equivalent)

## Release discipline

- [ ] Create releases from tags only (`vX.Y.Z`)
- [ ] Use manual release workflow for tagged cuts

## Path and privacy hygiene

- [ ] Enforce policy: no secrets in repository
- [ ] Enforce policy: no absolute local paths in tracked files
- [ ] Keep all docs/config paths relative to repository root
