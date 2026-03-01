#!/usr/bin/env python3
"""Validate billing live integration readiness baseline.

Checks:
- live readiness playbook exists
- live smoke config exists and contains tier-1 providers
- environment templates include required live keys
- live smoke workflow exists
- release workflow includes live smoke gate hook
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

READINESS_PLAYBOOK_PATH = REPO_ROOT / "docs" / "playbooks" / "billing-live-integration-readiness.md"
LIVE_SMOKE_CONFIG_PATH = REPO_ROOT / "tests" / "contracts" / "live-smoke" / "billing-live-smoke.config.json"
ENV_EXAMPLE_PATH = REPO_ROOT / ".env.example"
ENV_LIVE_EXAMPLE_PATH = REPO_ROOT / ".env.live.example"
LIVE_SMOKE_WORKFLOW_PATH = REPO_ROOT / ".github" / "workflows" / "billing-live-smoke.yml"
RELEASE_WORKFLOW_PATH = REPO_ROOT / ".github" / "workflows" / "release.yml"

REQUIRED_PROVIDERS = ("openops", "aws", "azure", "gcp")

REQUIRED_ENV_KEYS = (
    "BILLING_ADAPTER_RESOLUTION_MODE",
    "BILLING_INGEST_MODE",
    "FICECAL_CREDENTIALS_BACKEND",
    "FICECAL_SECRET_RESOLVER_ENDPOINT",
    "FICECAL_OPENOPS_CREDENTIAL_REF",
    "FICECAL_AWS_CREDENTIAL_REF",
    "FICECAL_AZURE_CREDENTIAL_REF",
    "FICECAL_GCP_CREDENTIAL_REF",
)


def fail(message: str) -> None:
    print(f"[billing-live-readiness] ERROR: {message}")
    sys.exit(1)


def assert_exists(path: Path, context: str) -> None:
    if not path.exists():
        fail(f"Missing {context}: {path.relative_to(REPO_ROOT)}")


def load_json_object(path: Path) -> dict:
    try:
        parsed = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {path.relative_to(REPO_ROOT)}: {exc}")

    if not isinstance(parsed, dict):
        fail(f"Expected JSON object in {path.relative_to(REPO_ROOT)}")

    return parsed


def ensure_env_keys(path: Path, key_names: tuple[str, ...]) -> None:
    content = path.read_text(encoding="utf-8")
    for key_name in key_names:
        if f"{key_name}=" not in content:
            fail(f"{path.relative_to(REPO_ROOT)} missing required key template: {key_name}")


def validate_live_smoke_config(config: dict) -> None:
    providers = config.get("providers")
    if not isinstance(providers, list) or not providers:
        fail("Live smoke config must define non-empty providers list")

    provider_ids: set[str] = set()
    for idx, provider in enumerate(providers):
        context = f"providers[{idx}]"
        if not isinstance(provider, dict):
            fail(f"{context} must be an object")

        for required_key in (
            "providerId",
            "adapterId",
            "fixtureToolName",
            "credentialRefEnv",
            "smokeCommandEnv",
        ):
            value = provider.get(required_key)
            if not isinstance(value, str) or not value:
                fail(f"{context}.{required_key} must be a non-empty string")

        adapter_id = provider["adapterId"]
        if not adapter_id.endswith("-billing"):
            fail(f"{context}.adapterId must end with '-billing'")

        threshold = provider.get("varianceThresholdPct")
        if threshold is not None and not isinstance(threshold, (int, float)):
            fail(f"{context}.varianceThresholdPct must be numeric when provided")

        provider_ids.add(provider["providerId"])

    missing = sorted(set(REQUIRED_PROVIDERS) - provider_ids)
    if missing:
        fail(f"Live smoke config missing required providers: {', '.join(missing)}")


def validate_release_gate() -> None:
    content = RELEASE_WORKFLOW_PATH.read_text(encoding="utf-8")
    if "require_live_smoke" not in content:
        fail("release workflow missing 'require_live_smoke' input")
    if "scripts/validate-billing-live-reconciliation.py" not in content:
        fail("release workflow missing billing live reconciliation gate step")


def validate() -> None:
    assert_exists(READINESS_PLAYBOOK_PATH, "billing live readiness playbook")
    assert_exists(LIVE_SMOKE_CONFIG_PATH, "billing live smoke config")
    assert_exists(ENV_EXAMPLE_PATH, "root .env.example")
    assert_exists(ENV_LIVE_EXAMPLE_PATH, "live .env example")
    assert_exists(LIVE_SMOKE_WORKFLOW_PATH, "billing live smoke workflow")
    assert_exists(RELEASE_WORKFLOW_PATH, "release workflow")

    ensure_env_keys(ENV_EXAMPLE_PATH, REQUIRED_ENV_KEYS)
    ensure_env_keys(ENV_LIVE_EXAMPLE_PATH, REQUIRED_ENV_KEYS)

    config = load_json_object(LIVE_SMOKE_CONFIG_PATH)
    validate_live_smoke_config(config)
    validate_release_gate()

    provider_count = len(config["providers"])
    print(
        "[billing-live-readiness] OK: validated live readiness playbook, env templates, "
        f"{provider_count} provider smoke entries, and release gate wiring"
    )


if __name__ == "__main__":
    validate()
