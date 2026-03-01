#!/usr/bin/env python3
"""Run billing live smoke across tier-1 providers.

Modes:
- dry-run: uses fixture baselines only (no cloud login required)
- live: executes provider smoke commands configured via environment variables

Provider smoke command contract (live mode):
The command must print one JSON line with:
{
  "providerTotal": number,
  "canonicalTotal": number,
  "currency": "USD"
}
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG_PATH = REPO_ROOT / "tests" / "contracts" / "live-smoke" / "billing-live-smoke.config.json"
DEFAULT_ARTIFACTS_DIR = REPO_ROOT / "tests" / "evidence" / "artifacts"
FIXTURE_ROOT = REPO_ROOT / "tests" / "contracts" / "fixtures" / "mcp"


@dataclass
class ProviderResult:
    provider_id: str
    adapter_id: str
    smoke_command_env: str
    credential_ref_env: str
    credential_ref_present: bool
    currency: str | None
    provider_total: float | None
    canonical_total: float | None
    variance_pct: float | None
    status: str
    reason: str | None

    def to_dict(self) -> dict[str, Any]:
        return {
            "providerId": self.provider_id,
            "adapterId": self.adapter_id,
            "smokeCommandEnv": self.smoke_command_env,
            "credentialRefEnv": self.credential_ref_env,
            "credentialRefPresent": self.credential_ref_present,
            "currency": self.currency,
            "providerTotal": self.provider_total,
            "canonicalTotal": self.canonical_total,
            "variancePct": self.variance_pct,
            "status": self.status,
            "reason": self.reason,
        }


def fail(message: str) -> None:
    print(f"[billing-live-smoke] ERROR: {message}")
    sys.exit(1)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run billing live smoke checks")
    parser.add_argument(
        "--mode",
        choices=("dry-run", "live"),
        default=os.getenv("BILLING_LIVE_SMOKE_MODE", "dry-run"),
        help="Smoke mode. dry-run uses fixture baselines; live runs provider commands.",
    )
    parser.add_argument(
        "--config",
        default=str(DEFAULT_CONFIG_PATH),
        help="Path to live smoke config JSON",
    )
    parser.add_argument(
        "--artifacts-dir",
        default=str(DEFAULT_ARTIFACTS_DIR),
        help="Directory for smoke report artifacts",
    )
    parser.add_argument(
        "--require-provider-commands",
        action="store_true",
        help="Require smoke command env vars in live mode",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=240,
        help="Provider smoke command timeout in seconds",
    )
    return parser.parse_args()


def load_json_object(path: Path, context: str) -> dict[str, Any]:
    try:
        parsed = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"{context} invalid JSON: {exc}")

    if not isinstance(parsed, dict):
        fail(f"{context} must be a JSON object")

    return parsed


def require_number(payload: dict[str, Any], key: str, context: str) -> float:
    value = payload.get(key)
    if not isinstance(value, (int, float)):
        fail(f"{context}.{key} must be numeric")
    return float(value)


def require_string(payload: dict[str, Any], key: str, context: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value:
        fail(f"{context}.{key} must be a non-empty string")
    return value


def parse_provider_command_output(stdout: str, provider_id: str) -> tuple[float, float, str]:
    non_empty_lines = [line.strip() for line in stdout.splitlines() if line.strip()]
    if not non_empty_lines:
        fail(f"{provider_id} smoke command did not return JSON output")

    try:
        parsed = json.loads(non_empty_lines[-1])
    except json.JSONDecodeError as exc:
        fail(f"{provider_id} smoke command output must end with JSON: {exc}")

    if not isinstance(parsed, dict):
        fail(f"{provider_id} smoke command JSON must be an object")

    provider_total = require_number(parsed, "providerTotal", provider_id)
    canonical_total = require_number(parsed, "canonicalTotal", provider_id)
    currency = require_string(parsed, "currency", provider_id)

    return provider_total, canonical_total, currency


def compute_variance_pct(provider_total: float, canonical_total: float) -> float:
    if provider_total == 0:
        return 0.0 if canonical_total == 0 else 100.0
    return round(abs(provider_total - canonical_total) / provider_total * 100.0, 4)


def load_fixture_baseline(tool_name: str) -> tuple[float, str]:
    response_path = FIXTURE_ROOT / tool_name / "1.0" / "response.expected.json"
    if not response_path.exists():
        fail(f"Missing fixture response for dry-run baseline: {response_path.relative_to(REPO_ROOT)}")

    response_payload = load_json_object(response_path, f"{tool_name}/response.expected.json")
    canonical = response_payload.get("canonical")
    if not isinstance(canonical, dict):
        fail(f"{tool_name}.response.canonical must be an object")

    scope = response_payload.get("scope")
    if not isinstance(scope, dict):
        fail(f"{tool_name}.response.scope must be an object")

    return require_number(canonical, "infraTotal", tool_name), require_string(scope, "currency", tool_name)


def run_live_provider_smoke(
    provider: dict[str, Any],
    timeout_seconds: int,
    require_provider_commands: bool,
) -> ProviderResult:
    provider_id = provider["providerId"]
    adapter_id = provider["adapterId"]
    credential_ref_env = provider["credentialRefEnv"]
    smoke_command_env = provider["smokeCommandEnv"]

    credential_ref = os.getenv(credential_ref_env)
    smoke_command = os.getenv(smoke_command_env)

    if not credential_ref:
        return ProviderResult(
            provider_id,
            adapter_id,
            smoke_command_env,
            credential_ref_env,
            False,
            None,
            None,
            None,
            None,
            "failed",
            f"Missing required credential reference environment key: {credential_ref_env}",
        )

    if require_provider_commands and not smoke_command:
        return ProviderResult(
            provider_id,
            adapter_id,
            smoke_command_env,
            credential_ref_env,
            True,
            None,
            None,
            None,
            None,
            "failed",
            f"Missing required smoke command environment key: {smoke_command_env}",
        )

    if not smoke_command:
        return ProviderResult(
            provider_id,
            adapter_id,
            smoke_command_env,
            credential_ref_env,
            True,
            None,
            None,
            None,
            None,
            "skipped",
            f"No smoke command configured in {smoke_command_env}",
        )

    completed = subprocess.run(
        smoke_command,
        shell=True,
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
    )

    if completed.returncode != 0:
        return ProviderResult(
            provider_id,
            adapter_id,
            smoke_command_env,
            credential_ref_env,
            True,
            None,
            None,
            None,
            None,
            "failed",
            f"Smoke command failed with exit code {completed.returncode}",
        )

    provider_total, canonical_total, currency = parse_provider_command_output(completed.stdout, provider_id)
    variance_pct = compute_variance_pct(provider_total, canonical_total)

    threshold = provider.get("varianceThresholdPct")
    if not isinstance(threshold, (int, float)):
        threshold = None

    if threshold is not None and variance_pct > float(threshold):
        return ProviderResult(
            provider_id,
            adapter_id,
            smoke_command_env,
            credential_ref_env,
            True,
            currency,
            provider_total,
            canonical_total,
            variance_pct,
            "failed",
            f"Variance {variance_pct}% exceeded threshold {float(threshold)}%",
        )

    return ProviderResult(
        provider_id,
        adapter_id,
        smoke_command_env,
        credential_ref_env,
        True,
        currency,
        provider_total,
        canonical_total,
        variance_pct,
        "passed",
        None,
    )


def run_dry_provider_smoke(provider: dict[str, Any]) -> ProviderResult:
    provider_id = provider["providerId"]
    adapter_id = provider["adapterId"]
    credential_ref_env = provider["credentialRefEnv"]
    smoke_command_env = provider["smokeCommandEnv"]
    fixture_tool_name = provider["fixtureToolName"]

    canonical_total, currency = load_fixture_baseline(fixture_tool_name)
    variance_pct = compute_variance_pct(canonical_total, canonical_total)

    return ProviderResult(
        provider_id,
        adapter_id,
        smoke_command_env,
        credential_ref_env,
        True,
        currency,
        canonical_total,
        canonical_total,
        variance_pct,
        "passed",
        "dry-run fixture baseline",
    )


def write_artifacts(
    artifacts_dir: Path,
    timestamp_token: str,
    report: dict[str, Any],
) -> tuple[Path, Path, Path]:
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    report_path = artifacts_dir / f"{timestamp_token}-billing-live-smoke-report.json"
    log_path = artifacts_dir / f"{timestamp_token}-billing-live-smoke.log"
    latest_path = artifacts_dir / "latest-billing-live-smoke-report.json"

    report_json = json.dumps(report, indent=2, sort_keys=True)
    report_path.write_text(f"{report_json}\n", encoding="utf-8")

    lines = [
        f"[billing-live-smoke] mode={report['mode']} run_id={report['runId']}",
        f"[billing-live-smoke] providers={report['summary']['total']} passed={report['summary']['passed']} failed={report['summary']['failed']} skipped={report['summary']['skipped']}",
    ]
    for item in report["providers"]:
        lines.append(
            "[billing-live-smoke] "
            f"provider={item['providerId']} status={item['status']} variancePct={item['variancePct']} reason={item['reason']}"
        )
    log_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    shutil.copyfile(report_path, latest_path)

    return report_path, log_path, latest_path


def validate_provider_config(provider: dict[str, Any], index: int) -> None:
    context = f"providers[{index}]"
    for key in (
        "providerId",
        "adapterId",
        "fixtureToolName",
        "credentialRefEnv",
        "smokeCommandEnv",
    ):
        value = provider.get(key)
        if not isinstance(value, str) or not value:
            fail(f"{context}.{key} must be a non-empty string")



def main() -> None:
    args = parse_args()
    config_path = Path(args.config)
    artifacts_dir = Path(args.artifacts_dir)

    if not config_path.exists():
        fail(f"Live smoke config not found: {config_path}")

    config = load_json_object(config_path, "live smoke config")
    providers = config.get("providers")
    if not isinstance(providers, list) or not providers:
        fail("Live smoke config must include non-empty providers list")

    for index, provider in enumerate(providers):
        if not isinstance(provider, dict):
            fail(f"providers[{index}] must be an object")
        validate_provider_config(provider, index)

    timestamp = datetime.now(tz=timezone.utc)
    timestamp_token = timestamp.strftime("%Y%m%dT%H%M%SZ")

    provider_results: list[ProviderResult] = []
    for provider in providers:
        if args.mode == "live":
            provider_results.append(
                run_live_provider_smoke(
                    provider=provider,
                    timeout_seconds=args.timeout_seconds,
                    require_provider_commands=args.require_provider_commands,
                )
            )
        else:
            provider_results.append(run_dry_provider_smoke(provider))

    totals = {
        "total": len(provider_results),
        "passed": sum(1 for item in provider_results if item.status == "passed"),
        "failed": sum(1 for item in provider_results if item.status == "failed"),
        "skipped": sum(1 for item in provider_results if item.status == "skipped"),
    }

    report = {
        "runId": f"billing-live-smoke-{timestamp_token}",
        "generatedAt": timestamp.isoformat(),
        "mode": args.mode,
        "configPath": str(config_path.relative_to(REPO_ROOT) if config_path.is_absolute() else config_path),
        "providers": [item.to_dict() for item in provider_results],
        "summary": totals,
    }

    report_path, log_path, latest_path = write_artifacts(artifacts_dir, timestamp_token, report)

    print(
        "[billing-live-smoke] OK: "
        f"mode={args.mode}, providers={totals['total']}, passed={totals['passed']}, "
        f"failed={totals['failed']}, skipped={totals['skipped']}"
    )
    print(f"[billing-live-smoke] report: {report_path.relative_to(REPO_ROOT)}")
    print(f"[billing-live-smoke] log: {log_path.relative_to(REPO_ROOT)}")
    print(f"[billing-live-smoke] latest report: {latest_path.relative_to(REPO_ROOT)}")

    if totals["failed"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
