#!/usr/bin/env python3
"""Validate MCP legacy alias parity fixture baseline.

Checks:
- parity fixture file exists and is valid JSON
- each row has required keys
- fixture file references resolve to existing files
- legacyAlias and canonicalTool values are unique
- request/response fixtures satisfy parity contract expectations
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
PARITY_PATH = (
    REPO_ROOT
    / "tests"
    / "contracts"
    / "fixtures"
    / "mcp"
    / "legacy-alias-parity"
    / "1.0"
    / "parity.rows.json"
)

CANONICAL_PROVIDER_IDS = {
    "billing.openops.ingest": "openops-billing",
    "billing.aws.ingest": "aws-billing",
    "billing.azure.ingest": "azure-billing",
    "billing.gcp.ingest": "gcp-billing",
}


def fail(message: str) -> None:
    print(f"[legacy-alias-parity] ERROR: {message}")
    sys.exit(1)


def load_parity() -> dict:
    if not PARITY_PATH.exists():
        fail(f"Fixture file not found: {PARITY_PATH.relative_to(REPO_ROOT)}")

    try:
        return json.loads(PARITY_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON: {exc}")


def load_json(path: Path, context: str) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"{context} invalid JSON: {exc}")

    if not isinstance(data, dict):
        fail(f"{context} must be a JSON object")
    return data


def validate_non_empty_string(container: dict[str, Any], key: str, context: str) -> str:
    value = container.get(key)
    if not isinstance(value, str) or not value:
        fail(f"{context}.{key} must be a non-empty string")
    return value


def validate_response_shape(
    row_context: str,
    canonical_tool: str,
    request_payload: dict[str, Any],
    response_payload: dict[str, Any],
) -> None:
    expected_provider = CANONICAL_PROVIDER_IDS.get(canonical_tool)
    if expected_provider is None:
        fail(f"{row_context}.canonicalTool unsupported for response_shape parity check: {canonical_tool}")

    integration_run_id = validate_non_empty_string(
        request_payload, "integrationRunId", f"{row_context}.request"
    )
    start_date = validate_non_empty_string(request_payload, "startDate", f"{row_context}.request")
    end_date = validate_non_empty_string(request_payload, "endDate", f"{row_context}.request")
    currency = validate_non_empty_string(request_payload, "currency", f"{row_context}.request")
    validate_non_empty_string(request_payload, "mappingProfile", f"{row_context}.request")

    response_integration_run_id = validate_non_empty_string(
        response_payload, "integrationRunId", f"{row_context}.response"
    )
    provider_adapter_id = validate_non_empty_string(
        response_payload, "providerAdapterId", f"{row_context}.response"
    )

    if response_integration_run_id != integration_run_id:
        fail(f"{row_context}.response.integrationRunId must match request.integrationRunId")
    if provider_adapter_id != expected_provider:
        fail(
            f"{row_context}.response.providerAdapterId expected '{expected_provider}' "
            f"for canonical tool '{canonical_tool}', got '{provider_adapter_id}'"
        )

    scope = response_payload.get("scope")
    if not isinstance(scope, dict):
        fail(f"{row_context}.response.scope must be an object")
    if validate_non_empty_string(scope, "startDate", f"{row_context}.response.scope") != start_date:
        fail(f"{row_context}.response.scope.startDate must match request.startDate")
    if validate_non_empty_string(scope, "endDate", f"{row_context}.response.scope") != end_date:
        fail(f"{row_context}.response.scope.endDate must match request.endDate")
    if validate_non_empty_string(scope, "currency", f"{row_context}.response.scope") != currency:
        fail(f"{row_context}.response.scope.currency must match request.currency")

    canonical = response_payload.get("canonical")
    if not isinstance(canonical, dict):
        fail(f"{row_context}.response.canonical must be an object")
    for key in ("infraTotal", "cudPct", "budgetCap", "nRef"):
        value = canonical.get(key)
        if not isinstance(value, (int, float)):
            fail(f"{row_context}.response.canonical.{key} must be a number")

    provenance = response_payload.get("provenance")
    if not isinstance(provenance, dict):
        fail(f"{row_context}.response.provenance must be an object")
    validate_non_empty_string(provenance, "sourceVersion", f"{row_context}.response.provenance")
    coverage_pct = provenance.get("coveragePct")
    if not isinstance(coverage_pct, (int, float)):
        fail(f"{row_context}.response.provenance.coveragePct must be a number")
    mapping_confidence = provenance.get("mappingConfidence")
    if mapping_confidence not in {"low", "medium", "high"}:
        fail(
            f"{row_context}.response.provenance.mappingConfidence must be one of: "
            "low, medium, high"
        )
    warnings = provenance.get("warnings")
    if not isinstance(warnings, list) or not all(isinstance(item, str) for item in warnings):
        fail(f"{row_context}.response.provenance.warnings must be an array of strings")


def validate(data: dict) -> None:
    fixture_version = data.get("fixtureVersion")
    rows = data.get("rows")

    if not isinstance(fixture_version, str) or not fixture_version:
        fail("Top-level key 'fixtureVersion' must be a non-empty string")
    if not isinstance(rows, list) or not rows:
        fail("Top-level key 'rows' must be a non-empty list")

    seen_aliases: set[str] = set()
    seen_tools: set[str] = set()

    for idx, row in enumerate(rows):
        context = f"rows[{idx}]"
        if not isinstance(row, dict):
            fail(f"{context} must be an object")

        for key in (
            "legacyAlias",
            "canonicalTool",
            "requestFixture",
            "expectedResponseFixture",
            "parityCheck",
        ):
            value = row.get(key)
            if not isinstance(value, str) or not value:
                fail(f"{context}.{key} must be a non-empty string")

        alias = row["legacyAlias"]
        tool = row["canonicalTool"]
        parity_check = row["parityCheck"]

        if not alias.startswith("finops."):
            fail(f"{context}.legacyAlias must start with 'finops.'")
        if alias.removeprefix("finops.") != tool:
            fail(f"{context}.legacyAlias must map directly to canonicalTool via finops.* prefix")
        if parity_check != "response_shape":
            fail(f"{context}.parityCheck unsupported: {parity_check}")

        if alias in seen_aliases:
            fail(f"Duplicate legacyAlias: {alias}")
        if tool in seen_tools:
            fail(f"Duplicate canonicalTool: {tool}")

        seen_aliases.add(alias)
        seen_tools.add(tool)

        request_path = (PARITY_PATH.parent / row["requestFixture"]).resolve()
        expected_path = (PARITY_PATH.parent / row["expectedResponseFixture"]).resolve()

        if not request_path.exists():
            fail(f"{context}.requestFixture does not exist: {row['requestFixture']}")
        if not expected_path.exists():
            fail(
                f"{context}.expectedResponseFixture does not exist: "
                f"{row['expectedResponseFixture']}"
            )

        request_payload = load_json(request_path, f"{context}.requestFixture")
        response_payload = load_json(expected_path, f"{context}.expectedResponseFixture")
        validate_response_shape(context, tool, request_payload, response_payload)

    print(
        f"[legacy-alias-parity] OK: validated {len(rows)} rows in "
        f"{PARITY_PATH.relative_to(REPO_ROOT)}"
    )


def main() -> None:
    data = load_parity()
    validate(data)


if __name__ == "__main__":
    main()
