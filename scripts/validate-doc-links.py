#!/usr/bin/env python3
"""Validate local markdown link targets.

Checks markdown links in repository docs and fails when local file targets do not exist.
External links (http/https/mailto/tel), in-page anchors, and data URIs are ignored.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

REPO_ROOT = Path(__file__).resolve().parents[1]
LINK_PATTERN = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")

INCLUDE_GLOBS = (
    "README.md",
    "CONTRIBUTING.md",
    "docs/**/*.md",
    ".github/**/*.md",
    "tests/evidence/**/*.md",
)

EXCLUDE_PARTS = {".git", "node_modules", ".windsurf"}


def fail(message: str) -> None:
    print(f"[docs-links] ERROR: {message}")
    sys.exit(1)


def iter_markdown_files() -> list[Path]:
    files: set[Path] = set()
    for pattern in INCLUDE_GLOBS:
        files.update(REPO_ROOT.glob(pattern))

    filtered = [
        path
        for path in files
        if path.is_file() and not any(part in EXCLUDE_PARTS for part in path.parts)
    ]
    return sorted(filtered)


def normalize_target(raw_target: str) -> str:
    target = raw_target.strip()

    if target.startswith("<") and target.endswith(">"):
        target = target[1:-1].strip()

    # Allow optional markdown title syntax: (path "title")
    if " " in target and not target.startswith(("http://", "https://")):
        target = target.split(" ", 1)[0]

    return target


def is_external_or_anchor(target: str) -> bool:
    if not target:
        return True

    if target.startswith("#"):
        return True

    parsed = urlparse(target)
    if parsed.scheme in {"http", "https", "mailto", "tel", "data"}:
        return True

    return False


def resolve_local_target(doc_path: Path, target: str) -> Path:
    target_no_query = target.split("?", 1)[0]
    target_no_anchor = target_no_query.split("#", 1)[0]
    decoded = unquote(target_no_anchor)

    if decoded.startswith("/"):
        return (REPO_ROOT / decoded.lstrip("/")).resolve()
    return (doc_path.parent / decoded).resolve()


def validate() -> None:
    files = iter_markdown_files()
    if not files:
        fail("No markdown files found in configured scope")

    missing: list[str] = []
    links_checked = 0

    for doc_path in files:
        rel_doc = doc_path.relative_to(REPO_ROOT)
        content = doc_path.read_text(encoding="utf-8")

        for line_number, line in enumerate(content.splitlines(), start=1):
            for match in LINK_PATTERN.finditer(line):
                raw_target = match.group(1)
                target = normalize_target(raw_target)

                if is_external_or_anchor(target):
                    continue

                resolved = resolve_local_target(doc_path, target)
                links_checked += 1

                if not resolved.exists():
                    missing.append(
                        f"{rel_doc}:{line_number} -> '{target}' "
                        f"(resolved: {resolved.relative_to(REPO_ROOT) if resolved.is_relative_to(REPO_ROOT) else resolved})"
                    )

    if missing:
        print("[docs-links] ERROR: Broken local markdown links detected:")
        for entry in missing:
            print(f"- {entry}")
        sys.exit(1)

    print(f"[docs-links] OK: validated {len(files)} markdown files, {links_checked} local links")


def main() -> None:
    validate()


if __name__ == "__main__":
    main()
