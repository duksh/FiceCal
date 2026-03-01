#!/usr/bin/env python3
"""Validate QA evidence policy baseline.

Checks:
- required P05 contract docs and smoke journeys file exist
- required P05 baseline evidence doc exists
- P05 and P07 evidence file naming follows convention
- each evidence file contains required sections, including proof artifacts
- each evidence file contains fail-fix-retest, retention, privacy checklist markers
- each evidence file contains at least one verifiable proof artifact entry
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
P07_EVIDENCE_DIR = REPO_ROOT / "tests" / "evidence" / "p07"
BASELINE_EVIDENCE_PATH = P05_EVIDENCE_DIR / "f2-task-053-smoke-journeys-baseline.md"

P05_EVIDENCE_FILE_NAME_PATTERN = re.compile(r"^f2-task-\d{3}-[a-z0-9-]+\.md$")
P07_EVIDENCE_FILE_NAME_PATTERN = re.compile(r"^f2-(task|story)-\d{3}-[a-z0-9-]+\.md$")

REQUIRED_HEADINGS = (
    "## Scope",
    "## Commands",
    "## Outcome",
    "## Proof Artifacts",
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

PROOF_ARTIFACT_LINE_PATTERN = re.compile(r"^- (log|ci|screenshot): .+", re.MULTILINE)


def fail(message: str) -> None:
    print(f"[qa-evidence-policy] ERROR: {message}")
    sys.exit(1)


def assert_exists(path: Path, context: str) -> None:
    if not path.exists():
        fail(f"Missing {context}: {path.relative_to(REPO_ROOT)}")


def validate_evidence_file(path: Path, filename_pattern: re.Pattern[str], phase_label: str) -> None:
    rel_path = path.relative_to(REPO_ROOT)

    if not filename_pattern.match(path.name):
        fail(
            f"{phase_label} evidence filename does not follow convention '{filename_pattern.pattern}': "
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

    if PROOF_ARTIFACT_LINE_PATTERN.search(content) is None:
        fail(
            f"{rel_path} missing proof artifacts entries. "
            "Expected at least one line in '## Proof Artifacts' section matching "
            "'- log: ...' or '- ci: ...' or '- screenshot: ...'"
        )


def validate() -> None:
    assert_exists(QA_CONVENTION_PATH, "QA evidence convention doc")
    assert_exists(UI_CONTRACT_PATH, "UI foundation contract doc")
    assert_exists(SMOKE_JOURNEYS_PATH, "smoke journeys baseline")
    assert_exists(P05_EVIDENCE_DIR, "P05 evidence directory")
    assert_exists(P07_EVIDENCE_DIR, "P07 evidence directory")
    assert_exists(BASELINE_EVIDENCE_PATH, "P05 baseline smoke journey evidence doc")

    p05_evidence_files = sorted(P05_EVIDENCE_DIR.glob("*.md"))
    p07_evidence_files = sorted(P07_EVIDENCE_DIR.glob("*.md"))

    if not p05_evidence_files:
        fail("No P05 evidence markdown files found")
    if not p07_evidence_files:
        fail("No P07 evidence markdown files found")

    for evidence_file in p05_evidence_files:
        validate_evidence_file(evidence_file, P05_EVIDENCE_FILE_NAME_PATTERN, "P05")

    for evidence_file in p07_evidence_files:
        validate_evidence_file(evidence_file, P07_EVIDENCE_FILE_NAME_PATTERN, "P07")

    print(
        "[qa-evidence-policy] OK: validated "
        f"{len(p05_evidence_files)} P05 evidence file(s) and "
        f"{len(p07_evidence_files)} P07 evidence file(s)"
    )


def main() -> None:
    validate()


if __name__ == "__main__":
    main()
