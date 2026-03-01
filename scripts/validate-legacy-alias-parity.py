#!/usr/bin/env python3
"""Validate MCP legacy alias parity fixture baseline.

Checks:
- parity fixture file exists and is valid JSON
- each row has required keys
- fixture file references resolve to existing files
- legacyAlias and canonicalTool values are unique
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

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

    print(
        f"[legacy-alias-parity] OK: validated {len(rows)} rows in "
        f"{PARITY_PATH.relative_to(REPO_ROOT)}"
    )


def main() -> None:
    data = load_parity()
    validate(data)


if __name__ == "__main__":
    main()
