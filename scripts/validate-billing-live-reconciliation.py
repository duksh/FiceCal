#!/usr/bin/env python3
"""Validate billing live smoke reconciliation report.

Checks:
- report exists and is recent enough
- all required providers are present
- no provider has failed status
- provider variance stays within configured threshold
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG_PATH = REPO_ROOT / "tests" / "contracts" / "live-smoke" / "billing-live-smoke.config.json"
DEFAULT_REPORT_PATH = REPO_ROOT / "tests" / "evidence" / "artifacts" / "latest-billing-live-smoke-report.json"


def fail(message: str) -> None:
    print(f"[billing-live-reconciliation] ERROR: {message}")
    sys.exit(1)


def load_json_object(path: Path, context: str) -> dict[str, Any]:
    if not path.exists():
        fail(f"Missing {context}: {path.relative_to(REPO_ROOT)}")

    try:
        parsed = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON in {context}: {exc}")

    if not isinstance(parsed, dict):
        fail(f"Expected JSON object in {context}")

    return parsed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate billing live reconciliation report")
    parser.add_argument(
        "--config",
        default=str(DEFAULT_CONFIG_PATH),
        help="Path to billing live smoke config JSON",
    )
    parser.add_argument(
        "--report",
        default=str(DEFAULT_REPORT_PATH),
        help="Path to latest billing live smoke report JSON",
    )
    parser.add_argument(
        "--max-age-hours",
        type=float,
        default=None,
        help="Optional override for maximum report age in hours",
    )
    parser.add_argument(
        "--allow-skipped",
        action="store_true",
        help="Allow provider status=skipped in validation",
    )
    return parser.parse_args()


def parse_iso_datetime(value: str, context: str) -> datetime:
    normalized = value
    if normalized.endswith("Z"):
        normalized = normalized[:-1] + "+00:00"

    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError as exc:
        fail(f"{context} must be ISO timestamp: {exc}")

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    return parsed.astimezone(timezone.utc)


def to_provider_thresholds(config: dict[str, Any]) -> tuple[dict[str, float], float, float]:
    providers = config.get("providers")
    if not isinstance(providers, list) or not providers:
        fail("Live smoke config providers must be a non-empty list")

    default_threshold = config.get("defaultVarianceThresholdPct")
    if not isinstance(default_threshold, (int, float)):
        fail("defaultVarianceThresholdPct must be numeric in live smoke config")

    max_report_age_hours = config.get("maxReportAgeHours")
    if not isinstance(max_report_age_hours, (int, float)):
        fail("maxReportAgeHours must be numeric in live smoke config")

    thresholds: dict[str, float] = {}
    for idx, provider in enumerate(providers):
        context = f"providers[{idx}]"
        if not isinstance(provider, dict):
            fail(f"{context} must be an object")

        provider_id = provider.get("providerId")
        if not isinstance(provider_id, str) or not provider_id:
            fail(f"{context}.providerId must be non-empty string")

        threshold = provider.get("varianceThresholdPct", default_threshold)
        if not isinstance(threshold, (int, float)):
            fail(f"{context}.varianceThresholdPct must be numeric")

        thresholds[provider_id] = float(threshold)

    return thresholds, float(default_threshold), float(max_report_age_hours)


def validate_report_age(report: dict[str, Any], max_age_hours: float) -> None:
    generated_at = report.get("generatedAt")
    if not isinstance(generated_at, str) or not generated_at:
        fail("report.generatedAt must be a non-empty string")

    generated_at_dt = parse_iso_datetime(generated_at, "report.generatedAt")
    now = datetime.now(tz=timezone.utc)
    if now - generated_at_dt > timedelta(hours=max_age_hours):
        fail(
            "report is stale: generatedAt="
            f"{generated_at_dt.isoformat()} exceeds max age {max_age_hours} hours"
        )


def validate_provider_entries(
    report: dict[str, Any],
    thresholds: dict[str, float],
    allow_skipped: bool,
) -> tuple[int, int, int]:
    providers = report.get("providers")
    if not isinstance(providers, list) or not providers:
        fail("report.providers must be a non-empty list")

    seen_provider_ids: set[str] = set()
    passed = 0
    failed = 0
    skipped = 0

    for idx, provider in enumerate(providers):
        context = f"report.providers[{idx}]"
        if not isinstance(provider, dict):
            fail(f"{context} must be an object")

        provider_id = provider.get("providerId")
        if not isinstance(provider_id, str) or not provider_id:
            fail(f"{context}.providerId must be non-empty string")

        if provider_id not in thresholds:
            fail(f"{context}.providerId '{provider_id}' not found in config")

        seen_provider_ids.add(provider_id)

        status = provider.get("status")
        if status not in {"passed", "failed", "skipped"}:
            fail(f"{context}.status must be one of passed|failed|skipped")

        if status == "failed":
            failed += 1
            reason = provider.get("reason")
            fail(f"{provider_id} failed reconciliation: {reason}")

        if status == "skipped":
            skipped += 1
            if not allow_skipped:
                fail(f"{provider_id} was skipped; pass --allow-skipped only when explicitly intended")
            continue

        variance_pct = provider.get("variancePct")
        if not isinstance(variance_pct, (int, float)):
            fail(f"{context}.variancePct must be numeric for passed providers")

        threshold = thresholds[provider_id]
        if math.isfinite(float(variance_pct)) is False:
            fail(f"{context}.variancePct must be finite")

        if float(variance_pct) > threshold:
            fail(
                f"{provider_id} variance {float(variance_pct)}% exceeds threshold {threshold}%"
            )

        passed += 1

    missing_provider_ids = sorted(set(thresholds.keys()) - seen_provider_ids)
    if missing_provider_ids:
        fail(f"Report missing providers: {', '.join(missing_provider_ids)}")

    return passed, failed, skipped


def main() -> None:
    args = parse_args()

    config = load_json_object(Path(args.config), "live smoke config")
    report = load_json_object(Path(args.report), "live smoke report")

    thresholds, default_threshold, max_report_age_hours = to_provider_thresholds(config)

    if args.max_age_hours is not None:
        max_report_age_hours = args.max_age_hours

    validate_report_age(report, max_report_age_hours)

    passed, failed, skipped = validate_provider_entries(
        report=report,
        thresholds=thresholds,
        allow_skipped=args.allow_skipped,
    )

    print(
        "[billing-live-reconciliation] OK: "
        f"providers={len(thresholds)}, passed={passed}, failed={failed}, skipped={skipped}, "
        f"defaultThreshold={default_threshold}%"
    )


if __name__ == "__main__":
    main()
