#!/usr/bin/env python3
"""Validate billing canonical handoff fixture checks for phase-1 adapters.

Checks:
- required billing tool fixture packs exist
- request.valid and response.expected fixtures parse as JSON objects
- providerAdapterId aligns with tool namespace adapter mapping
- integrationRunId and scope fields align between request and response
- canonical and provenance fields satisfy type and value constraints
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
MCP_FIXTURE_ROOT = REPO_ROOT / "tests" / "contracts" / "fixtures" / "mcp"

PHASE1_BILLING_TOOLS = {
    "billing.openops.ingest": "openops-billing",
    "billing.aws.ingest": "aws-billing",
    "billing.azure.ingest": "azure-billing",
    "billing.gcp.ingest": "gcp-billing",
}


def fail(message: str) -> None:
    print(f"[billing-canonical-handoff] ERROR: {message}")
    sys.exit(1)


def load_json(path: Path, context: str) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"{context} invalid JSON: {exc}")


def load_json_object(path: Path, context: str) -> dict[str, Any]:
    payload = load_json(path, context)
    if not isinstance(payload, dict):
        fail(f"{context} must be a JSON object")
    return payload


def require_non_empty_string(container: dict[str, Any], key: str, context: str) -> str:
    value = container.get(key)
    if not isinstance(value, str) or not value:
        fail(f"{context}.{key} must be a non-empty string")
    return value


def require_number(container: dict[str, Any], key: str, context: str) -> float:
    value = container.get(key)
    if not isinstance(value, (int, float)):
        fail(f"{context}.{key} must be a number")
    return float(value)


def validate_phase1_tool(tool_name: str, expected_adapter_id: str) -> None:
    fixture_version_root = MCP_FIXTURE_ROOT / tool_name / "1.0"
    if not fixture_version_root.exists():
        fail(f"Missing fixture pack directory: {fixture_version_root.relative_to(REPO_ROOT)}")

    request_path = fixture_version_root / "request.valid.json"
    response_path = fixture_version_root / "response.expected.json"

    if not request_path.exists():
        fail(f"Missing request fixture: {request_path.relative_to(REPO_ROOT)}")
    if not response_path.exists():
        fail(f"Missing response fixture: {response_path.relative_to(REPO_ROOT)}")

    request_payload = load_json_object(request_path, f"{tool_name}/request.valid.json")
    response_payload = load_json_object(response_path, f"{tool_name}/response.expected.json")

    request_run_id = require_non_empty_string(request_payload, "integrationRunId", f"{tool_name}.request")
    response_run_id = require_non_empty_string(
        response_payload, "integrationRunId", f"{tool_name}.response"
    )
    if response_run_id != request_run_id:
        fail(f"{tool_name}.response.integrationRunId must match request.integrationRunId")

    provider_adapter_id = require_non_empty_string(
        response_payload, "providerAdapterId", f"{tool_name}.response"
    )
    if provider_adapter_id != expected_adapter_id:
        fail(
            f"{tool_name}.response.providerAdapterId expected '{expected_adapter_id}', "
            f"got '{provider_adapter_id}'"
        )

    response_scope = response_payload.get("scope")
    if not isinstance(response_scope, dict):
        fail(f"{tool_name}.response.scope must be an object")

    request_start = require_non_empty_string(request_payload, "startDate", f"{tool_name}.request")
    request_end = require_non_empty_string(request_payload, "endDate", f"{tool_name}.request")
    request_currency = require_non_empty_string(request_payload, "currency", f"{tool_name}.request")

    auth_mode = request_payload.get("authMode")
    if auth_mode is not None and auth_mode != "read-only":
        fail(f"{tool_name}.request.authMode must be 'read-only' when provided")

    credential_ref = request_payload.get("credentialRef")
    if credential_ref is not None and not isinstance(credential_ref, str):
        fail(f"{tool_name}.request.credentialRef must be a string when provided")

    scope_start = require_non_empty_string(response_scope, "startDate", f"{tool_name}.response.scope")
    scope_end = require_non_empty_string(response_scope, "endDate", f"{tool_name}.response.scope")
    scope_currency = require_non_empty_string(response_scope, "currency", f"{tool_name}.response.scope")

    if scope_start != request_start:
        fail(f"{tool_name}.response.scope.startDate must match request.startDate")
    if scope_end != request_end:
        fail(f"{tool_name}.response.scope.endDate must match request.endDate")
    if scope_currency != request_currency:
        fail(f"{tool_name}.response.scope.currency must match request.currency")

    canonical = response_payload.get("canonical")
    if not isinstance(canonical, dict):
        fail(f"{tool_name}.response.canonical must be an object")

    for key in ("infraTotal", "cudPct", "budgetCap", "nRef"):
        require_number(canonical, key, f"{tool_name}.response.canonical")

    provenance = response_payload.get("provenance")
    if not isinstance(provenance, dict):
        fail(f"{tool_name}.response.provenance must be an object")

    require_non_empty_string(provenance, "sourceVersion", f"{tool_name}.response.provenance")
    require_number(provenance, "coveragePct", f"{tool_name}.response.provenance")

    mapping_confidence = provenance.get("mappingConfidence")
    if mapping_confidence not in {"low", "medium", "high"}:
        fail(
            f"{tool_name}.response.provenance.mappingConfidence must be one of: "
            "low, medium, high"
        )

    warnings = provenance.get("warnings")
    if not isinstance(warnings, list) or not all(isinstance(item, str) for item in warnings):
        fail(f"{tool_name}.response.provenance.warnings must be an array of strings")

    if tool_name == "billing.openops.ingest":
        source_version = require_non_empty_string(
            provenance, "sourceVersion", f"{tool_name}.response.provenance"
        )
        if not source_version.startswith("openops-readonly-"):
            fail(
                f"{tool_name}.response.provenance.sourceVersion must start with "
                "'openops-readonly-' for P07 baseline"
            )

        infra_total = require_number(canonical, "infraTotal", f"{tool_name}.response.canonical")
        if infra_total <= 0:
            fail(f"{tool_name}.response.canonical.infraTotal must be > 0 for OpenOps real ingest baseline")

    if tool_name == "billing.aws.ingest":
        source_version = require_non_empty_string(
            provenance, "sourceVersion", f"{tool_name}.response.provenance"
        )
        if not source_version.startswith("aws-readonly-"):
            fail(
                f"{tool_name}.response.provenance.sourceVersion must start with "
                "'aws-readonly-' for P07 baseline"
            )

        infra_total = require_number(canonical, "infraTotal", f"{tool_name}.response.canonical")
        if infra_total <= 0:
            fail(f"{tool_name}.response.canonical.infraTotal must be > 0 for AWS real ingest baseline")

        retry_warning_prefix = "Retry policy configured: maxAttempts="
        if not any(isinstance(item, str) and item.startswith(retry_warning_prefix) for item in warnings):
            fail(
                f"{tool_name}.response.provenance.warnings must include retry policy baseline entry"
            )

    if tool_name == "billing.azure.ingest":
        source_version = require_non_empty_string(
            provenance, "sourceVersion", f"{tool_name}.response.provenance"
        )
        if not source_version.startswith("azure-readonly-"):
            fail(
                f"{tool_name}.response.provenance.sourceVersion must start with "
                "'azure-readonly-' for P07 baseline"
            )

        infra_total = require_number(canonical, "infraTotal", f"{tool_name}.response.canonical")
        if infra_total <= 0:
            fail(f"{tool_name}.response.canonical.infraTotal must be > 0 for Azure real ingest baseline")

        pagination_warning_prefix = "Pagination policy: pageSize="
        if not any(isinstance(item, str) and item.startswith(pagination_warning_prefix) for item in warnings):
            fail(
                f"{tool_name}.response.provenance.warnings must include pagination policy baseline entry"
            )

        incremental_warning = "Incremental sync baseline anchored to requested billing window."
        if incremental_warning not in warnings:
            fail(
                f"{tool_name}.response.provenance.warnings must include incremental sync baseline entry"
            )

    if tool_name == "billing.gcp.ingest":
        source_version = require_non_empty_string(
            provenance, "sourceVersion", f"{tool_name}.response.provenance"
        )
        if not source_version.startswith("gcp-readonly-"):
            fail(
                f"{tool_name}.response.provenance.sourceVersion must start with "
                "'gcp-readonly-' for P07 baseline"
            )

        infra_total = require_number(canonical, "infraTotal", f"{tool_name}.response.canonical")
        if infra_total <= 0:
            fail(f"{tool_name}.response.canonical.infraTotal must be > 0 for GCP real ingest baseline")

        telemetry_warning = "Telemetry baseline: billing.run and billing.mapping.summary emitted."
        if telemetry_warning not in warnings:
            fail(
                f"{tool_name}.response.provenance.warnings must include telemetry baseline entry"
            )

        recommender_warning = "Recommender-ready provenance baseline enabled."
        if recommender_warning not in warnings:
            fail(
                f"{tool_name}.response.provenance.warnings must include recommender-ready baseline entry"
            )


def validate() -> None:
    for tool_name, expected_adapter_id in PHASE1_BILLING_TOOLS.items():
        validate_phase1_tool(tool_name, expected_adapter_id)

    print(
        "[billing-canonical-handoff] OK: validated "
        f"{len(PHASE1_BILLING_TOOLS)} billing tool fixture packs"
    )


def main() -> None:
    validate()


if __name__ == "__main__":
    main()
