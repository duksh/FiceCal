#!/usr/bin/env python3
"""Validate P05 QA evidence policy baseline.

Checks:
- required P05 contract docs and smoke journeys file exist
- required P05 baseline evidence doc exists
- P05 evidence file naming follows convention
- each P05 evidence file contains required sections
- each P05 evidence file contains fail-fix-retest, retention, and privacy checklist markers
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

QA_CONVENTION_PATH = REPO_ROOT / "docs" / "qa-evidence-storage-convention.md"
UI_CONTRACT_PATH = REPO_ROOT / "docs" / "ui-foundation-hci-metrics-contract.md"
SMOKE_JOURNEYS_PATH = REPO_ROOT / "tests" / "e2e" / "smoke-journeys.md"
P05_EVIDENCE_DIR = REPO_ROOT / "tests" / "evidence" / "p05"
BASELINE_EVIDENCE_PATH = P05_EVIDENCE_DIR / "f2-task-053-smoke-journeys-baseline.md"

EVIDENCE_FILE_NAME_PATTERN = re.compile(r"^f2-task-\d{3}-[a-z0-9-]+\.md$")

REQUIRED_HEADINGS = (
    "## Scope",
    "## Commands",
    "## Outcome",
    "## Evidence Checklist",
)

REQUIRED_MARKERS = (
    "- [x] Fail evidence captured or not applicable",
    "- [x] Fix evidence captured or not applicable",
    "- [x] Retest evidence captured or not applicable",
    "- [x] Screenshot privacy review completed or no screenshots attached",
)

RETENTION_LINE_PATTERN = re.compile(
    r"^- Retention class: (routine-30d|phase-close-90d|release-critical-180d)$",
    re.MULTILINE,
)


def fail(message: str) -> None:
    print(f"[qa-evidence-policy] ERROR: {message}")
    sys.exit(1)


def assert_exists(path: Path, context: str) -> None:
    if not path.exists():
        fail(f"Missing {context}: {path.relative_to(REPO_ROOT)}")


def validate_evidence_file(path: Path) -> None:
    rel_path = path.relative_to(REPO_ROOT)

    if not EVIDENCE_FILE_NAME_PATTERN.match(path.name):
        fail(
            f"P05 evidence filename does not follow convention '{EVIDENCE_FILE_NAME_PATTERN.pattern}': "
            f"{rel_path}"
        )

    content = path.read_text(encoding="utf-8")

    for heading in REQUIRED_HEADINGS:
        if heading not in content:
            fail(f"{rel_path} missing required heading: {heading}")

    for marker in REQUIRED_MARKERS:
        if marker not in content:
            fail(f"{rel_path} missing required checklist marker: {marker}")

    if RETENTION_LINE_PATTERN.search(content) is None:
        fail(
            f"{rel_path} missing required retention line. "
            "Expected one of: routine-30d | phase-close-90d | release-critical-180d"
        )


def validate() -> None:
    assert_exists(QA_CONVENTION_PATH, "QA evidence convention doc")
    assert_exists(UI_CONTRACT_PATH, "UI foundation contract doc")
    assert_exists(SMOKE_JOURNEYS_PATH, "smoke journeys baseline")
    assert_exists(P05_EVIDENCE_DIR, "P05 evidence directory")
    assert_exists(BASELINE_EVIDENCE_PATH, "P05 baseline smoke journey evidence doc")

    evidence_files = sorted(P05_EVIDENCE_DIR.glob("*.md"))
    if not evidence_files:
        fail("No P05 evidence markdown files found")

    for evidence_file in evidence_files:
        validate_evidence_file(evidence_file)

    print(
        "[qa-evidence-policy] OK: validated "
        f"{len(evidence_files)} P05 evidence file(s) in {P05_EVIDENCE_DIR.relative_to(REPO_ROOT)}"
    )


def main() -> None:
    validate()


if __name__ == "__main__":
    main()
