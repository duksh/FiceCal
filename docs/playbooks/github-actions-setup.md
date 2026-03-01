# GitHub Actions Setup Playbook (F2-TASK-014)

## Purpose

Configure repository-level GitHub Actions controls required by FiceCal v2 governance gates.

## Scope

- Task: `F2-TASK-014` Document GitHub settings playbook
- Acceptance target: Actions permissions, Pages setup, and required checks are documented
- Applies to repository: `duksh/FiceCal`

## 1) Actions permissions baseline

In repository settings (`Settings -> Actions -> General`):

1. Set **Actions permissions** to allow required actions and reusable workflows.
2. Set **Workflow permissions** to **Read and write permissions**.
3. Enable **Allow GitHub Actions to create and approve pull requests** only if your automation policy allows it.
4. Keep approvals and governance under branch protection rules.

Reference workflows:

- `.github/workflows/ci-guardrails.yml`
- `.github/workflows/contract-drift.yml`
- `.github/workflows/security-sbom.yml`
- `.github/workflows/pages-deploy.yml`
- `.github/workflows/render-health-smoke.yml`
- `.github/workflows/release.yml`

## 2) Branch protection and required checks

Apply `.github/branch-protection-checklist.md` on `main`.

Minimum required checks:

- `validate` (CI Guardrails)
- `contract-drift`

Recommended additional checks:

- `security-sbom`
- `deploy` (from Pages workflow, when enabled)

## 3) GitHub Pages setup

In `Settings -> Pages`:

1. Set **Source** to `GitHub Actions`.
2. Keep Pages environment protected under repository governance.
3. Ensure repository variable `ENABLE_PAGES_DEPLOY=true` if scheduled/automatic deploys are expected.

Workflow reference:

- `.github/workflows/pages-deploy.yml`

Notes:

- Manual dispatch can still run deploy without variable gating.
- If no frontend build output exists, workflow publishes fallback static page.

## 4) Runtime smoke (Render) setup

Define repository variables (`Settings -> Secrets and variables -> Actions -> Variables`):

- `ENABLE_RENDER_HEALTH_SMOKE` = `true|false`
- `RENDER_AGENT_HEALTH_URL` = runtime health endpoint URL

Optional secret fallback:

- `RENDER_AGENT_HEALTH_URL` in `Secrets`

Workflow reference:

- `.github/workflows/render-health-smoke.yml`

## 5) Security and hygiene controls

Enable repository security controls:

- Secret scanning (including push protection)
- Dependabot / dependency graph alerts
- Code scanning (if available in plan)

CI guardrail references:

- gitleaks scan in `.github/workflows/ci-guardrails.yml`
- absolute path hygiene check in `.github/workflows/ci-guardrails.yml`

## 6) Verification checklist

After configuration, verify:

1. Required workflows run successfully on `main`.
2. Branch protection prevents merge when required checks are red.
3. Pages deploy workflow can publish from Actions.
4. Render smoke runs manually and (if enabled) on schedule.
5. No secrets are committed; sensitive values stay in repo variables/secrets.
