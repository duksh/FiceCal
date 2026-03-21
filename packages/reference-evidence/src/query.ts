import { EVIDENCE_CATALOG } from "./catalog.js";
import type {
  EvidenceEntry,
  EvidenceQuery,
  EvidenceQueryResult,
} from "./types.js";

// ─── Query engine ─────────────────────────────────────────────────────────────

/**
 * Query the evidence catalog with optional filters.
 *
 * All filters are applied with AND semantics:
 * - sourceType: exact match
 * - formulaKeys: entry.appliesTo must contain at least one of the given keys
 * - tags: entry.tags must contain ALL of the given tags
 * - search: case-insensitive substring across title + rationale + source
 */
export function queryEvidence(query: EvidenceQuery = {}): EvidenceQueryResult {
  let results: EvidenceEntry[] = [...EVIDENCE_CATALOG];

  if (query.sourceType !== undefined) {
    results = results.filter((e) => e.sourceType === query.sourceType);
  }

  if (query.formulaKeys !== undefined && query.formulaKeys.length > 0) {
    const keys = new Set(query.formulaKeys);
    results = results.filter((e) => e.appliesTo.some((k) => keys.has(k)));
  }

  if (query.tags !== undefined && query.tags.length > 0) {
    const requiredTags = query.tags.map((t) => t.toLowerCase());
    results = results.filter((e) => {
      const entryTags = e.tags.map((t) => t.toLowerCase());
      return requiredTags.every((rt) => entryTags.includes(rt));
    });
  }

  if (query.search !== undefined && query.search.trim().length > 0) {
    const needle = query.search.toLowerCase();
    results = results.filter(
      (e) =>
        e.title.toLowerCase().includes(needle) ||
        e.rationale.toLowerCase().includes(needle) ||
        e.source.toLowerCase().includes(needle),
    );
  }

  return {
    entries: results,
    totalMatched: results.length,
    query,
  };
}

/**
 * Look up a single evidence entry by its stable id.
 * Returns undefined if not found.
 */
export function getEvidenceById(id: string): EvidenceEntry | undefined {
  return EVIDENCE_CATALOG.find((e) => e.id === id);
}

/**
 * Return all evidence entries whose appliesTo includes the given formula key.
 * Convenience wrapper around queryEvidence.
 */
export function getEvidenceForFormula(formulaKey: string): EvidenceEntry[] {
  return queryEvidence({ formulaKeys: [formulaKey] }).entries;
}

/**
 * Return the complete catalog (no filters applied).
 */
export function getAllEvidence(): EvidenceEntry[] {
  return [...EVIDENCE_CATALOG];
}
