#!/usr/bin/env python3
"""Validate contract fixture coverage baseline.

Checks:
- fixture root directories exist
- required module fixture packs exist and include baseline files
- required MCP fixture packs exist and include baseline files
- MCP billing tool fixture packs align with capabilities response fixture
- JSON fixtures parse successfully
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_ROOT = REPO_ROOT / "tests" / "contracts" / "fixtures"
MODULE_ROOT = FIXTURE_ROOT
MCP_ROOT = FIXTURE_ROOT / "mcp"
PARITY_ROOT = MCP_ROOT / "legacy-alias-parity"

REQUIRED_MODULE_PACKS = {
    "community.sample-finops-adapter",
    "modules.optional-fallback",
}

ALWAYS_REQUIRED_MCP_PACKS = {
    "legacy-alias-parity",
    "mcp.capabilities.get",
    "mcp.context.envelope",
}


def fail(message: str) -> None:
    print(f"[fixture-coverage] ERROR: {message}")
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


def list_version_dirs(pack_path: Path, context: str) -> list[Path]:
    versions = sorted(child for child in pack_path.iterdir() if child.is_dir())
    if not versions:
        fail(f"{context} has no version directories")
    return versions


def required_mcp_files_for_pack(pack_name: str) -> set[str]:
    if pack_name == "mcp.capabilities.get":
        return {"response.expected.json"}
    if pack_name == "mcp.context.envelope":
        return {"request.valid.json", "request.invalid.json"}
    if pack_name == "legacy-alias-parity":
        return {"parity.rows.json"}
    return {"request.valid.json", "request.invalid.json", "response.expected.json"}


def validate_module_pack(pack_name: str, pack_path: Path) -> None:
    versions = list_version_dirs(pack_path, f"module pack '{pack_name}'")

    for version in versions:
        notes_path = version / "notes.md"
        if not notes_path.exists():
            fail(f"module pack '{pack_name}' version '{version.name}' missing notes.md")

        json_files = sorted(version.glob("*.json"))
        if not json_files:
            fail(f"module pack '{pack_name}' version '{version.name}' has no JSON fixtures")

        has_input = any(path.name.startswith("input") for path in json_files)
        has_expected_output = any(path.name.startswith("output.expected") for path in json_files)

        if not has_input:
            fail(
                f"module pack '{pack_name}' version '{version.name}' must include at least one input*.json"
            )
        if not has_expected_output:
            fail(
                f"module pack '{pack_name}' version '{version.name}' must include at least one "
                "output.expected*.json"
            )

        for json_path in json_files:
            load_json(json_path, f"module pack '{pack_name}'/{version.name}/{json_path.name}")


def capabilities_billing_tools() -> tuple[set[str], str]:
    capabilities_pack = MCP_ROOT / "mcp.capabilities.get"
    versions = list_version_dirs(capabilities_pack, "MCP pack 'mcp.capabilities.get'")

    latest = versions[-1]
    response_path = latest / "response.expected.json"
    if not response_path.exists():
        fail(
            "MCP pack 'mcp.capabilities.get' latest version "
            f"'{latest.name}' missing response.expected.json"
        )

    payload = load_json_object(response_path, "mcp.capabilities.get response.expected")

    namespaces = payload.get("toolNamespaces")
    if not isinstance(namespaces, list):
        fail("mcp.capabilities.get response.expected.toolNamespaces must be an array")

    tools: set[str] = set()
    for idx, namespace in enumerate(namespaces):
        if not isinstance(namespace, dict):
            fail(f"toolNamespaces[{idx}] must be an object")
        ns_tools = namespace.get("tools")
        if not isinstance(ns_tools, list) or not all(isinstance(tool, str) for tool in ns_tools):
            fail(f"toolNamespaces[{idx}].tools must be an array of strings")
        tools.update(ns_tools)

    if not tools:
        fail("No MCP tools found in mcp.capabilities.get fixture")

    compatibility = payload.get("compatibility")
    if not isinstance(compatibility, dict):
        fail("mcp.capabilities.get response.expected.compatibility must be an object")

    parity_fixture_version = require_non_empty_string(
        compatibility,
        "parityFixtureVersion",
        "mcp.capabilities.get response.expected.compatibility",
    )

    return tools, parity_fixture_version


def validate_legacy_alias_parity_contract(tools: set[str], expected_parity_version: str) -> None:
    parity_pack = PARITY_ROOT / expected_parity_version
    if not parity_pack.exists() or not parity_pack.is_dir():
        fail(
            "legacy alias parity fixture version from capabilities does not exist: "
            f"legacy-alias-parity/{expected_parity_version}"
        )

    parity_rows_path = parity_pack / "parity.rows.json"
    if not parity_rows_path.exists():
        fail(
            "legacy alias parity pack missing parity.rows.json at "
            f"legacy-alias-parity/{expected_parity_version}"
        )

    payload = load_json_object(
        parity_rows_path,
        f"legacy-alias-parity/{expected_parity_version}/parity.rows.json",
    )

    fixture_version = require_non_empty_string(payload, "fixtureVersion", "parity.rows")
    if fixture_version != expected_parity_version:
        fail(
            "legacy alias parity fixtureVersion must match capabilities parityFixtureVersion "
            f"('{expected_parity_version}'), got '{fixture_version}'"
        )

    rows = payload.get("rows")
    if not isinstance(rows, list) or not rows:
        fail("parity.rows.rows must be a non-empty array")

    for idx, row in enumerate(rows):
        context = f"parity.rows.rows[{idx}]"
        if not isinstance(row, dict):
            fail(f"{context} must be an object")
        canonical_tool = require_non_empty_string(row, "canonicalTool", context)
        if canonical_tool not in tools:
            fail(
                f"{context}.canonicalTool '{canonical_tool}' not found in "
                "mcp.capabilities.get toolNamespaces"
            )


def validate_mcp_pack(pack_name: str, pack_path: Path) -> None:
    versions = list_version_dirs(pack_path, f"MCP pack '{pack_name}'")
    required_files = required_mcp_files_for_pack(pack_name)

    for version in versions:
        notes_path = version / "notes.md"
        if not notes_path.exists():
            fail(f"MCP pack '{pack_name}' version '{version.name}' missing notes.md")

        for file_name in required_files:
            target = version / file_name
            if not target.exists():
                fail(
                    f"MCP pack '{pack_name}' version '{version.name}' missing required file: {file_name}"
                )
            load_json_object(target, f"MCP pack '{pack_name}'/{version.name}/{file_name}")


def validate() -> None:
    if not FIXTURE_ROOT.exists():
        fail(f"Fixture root not found: {FIXTURE_ROOT.relative_to(REPO_ROOT)}")
    if not MCP_ROOT.exists():
        fail(f"MCP fixture root not found: {MCP_ROOT.relative_to(REPO_ROOT)}")

    module_pack_names = sorted(
        child.name for child in MODULE_ROOT.iterdir() if child.is_dir() and child.name != "mcp"
    )

    missing_module_packs = REQUIRED_MODULE_PACKS - set(module_pack_names)
    if missing_module_packs:
        fail(f"Missing required module fixture packs: {sorted(missing_module_packs)}")

    for module_pack in module_pack_names:
        validate_module_pack(module_pack, MODULE_ROOT / module_pack)

    mcp_pack_names = sorted(child.name for child in MCP_ROOT.iterdir() if child.is_dir())
    capability_tools, parity_fixture_version = capabilities_billing_tools()
    required_mcp_packs = ALWAYS_REQUIRED_MCP_PACKS | capability_tools

    missing_mcp_packs = required_mcp_packs - set(mcp_pack_names)
    if missing_mcp_packs:
        fail(f"Missing required MCP fixture packs: {sorted(missing_mcp_packs)}")

    unexpected_mcp_packs = set(mcp_pack_names) - required_mcp_packs
    if unexpected_mcp_packs:
        fail(
            "Unexpected MCP fixture packs not declared in capabilities baseline: "
            f"{sorted(unexpected_mcp_packs)}"
        )

    for mcp_pack in sorted(required_mcp_packs):
        validate_mcp_pack(mcp_pack, MCP_ROOT / mcp_pack)

    validate_legacy_alias_parity_contract(capability_tools, parity_fixture_version)

    print(
        "[fixture-coverage] OK: validated "
        f"{len(module_pack_names)} module packs and {len(required_mcp_packs)} required MCP packs "
        f"(parity fixture version {parity_fixture_version})"
    )


def main() -> None:
    validate()


if __name__ == "__main__":
    main()
