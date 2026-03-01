#!/usr/bin/env python3
"""Validate src/features/feature-catalog.json.

Checks:
- required top-level keys and types
- unique module IDs
- module dependency references exist
- module paths exist in repository
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = REPO_ROOT / "src" / "features" / "feature-catalog.json"


def fail(message: str) -> None:
    print(f"[feature-catalog] ERROR: {message}")
    sys.exit(1)


def load_catalog() -> dict:
    if not CATALOG_PATH.exists():
        fail(f"Catalog file not found: {CATALOG_PATH.relative_to(REPO_ROOT)}")

    try:
        return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Invalid JSON: {exc}")


def validate(catalog: dict) -> None:
    required_top_level = {
        "version": str,
        "updatedAt": str,
        "modules": list,
    }

    for key, expected_type in required_top_level.items():
        if key not in catalog:
            fail(f"Missing top-level key: {key}")
        if not isinstance(catalog[key], expected_type):
            fail(f"Top-level key '{key}' must be of type {expected_type.__name__}")

    modules = catalog["modules"]
    seen_ids: set[str] = set()

    for idx, module in enumerate(modules):
        context = f"modules[{idx}]"
        if not isinstance(module, dict):
            fail(f"{context} must be an object")

        for key, expected_type in (
            ("id", str),
            ("path", str),
            ("dependsOn", list),
            ("optional", bool),
            ("status", str),
        ):
            if key not in module:
                fail(f"{context} missing required key: {key}")
            if not isinstance(module[key], expected_type):
                fail(f"{context}.{key} must be of type {expected_type.__name__}")

        module_id = module["id"]
        if module_id in seen_ids:
            fail(f"Duplicate module id: {module_id}")
        seen_ids.add(module_id)

        module_path = REPO_ROOT / module["path"]
        if not module_path.exists():
            fail(
                f"{context}.path does not exist in repository: {module['path']}"
            )

    for idx, module in enumerate(modules):
        context = f"modules[{idx}]"
        module_id = module["id"]
        for dep in module["dependsOn"]:
            if not isinstance(dep, str):
                fail(f"{context}.dependsOn values must be strings")
            if dep not in seen_ids:
                fail(f"{module_id} depends on unknown module id: {dep}")

    print(
        f"[feature-catalog] OK: validated {len(modules)} modules in "
        f"{CATALOG_PATH.relative_to(REPO_ROOT)}"
    )


def main() -> None:
    catalog = load_catalog()
    validate(catalog)


if __name__ == "__main__":
    main()
