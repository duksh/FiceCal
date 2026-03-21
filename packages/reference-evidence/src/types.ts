// ─── Evidence source ──────────────────────────────────────────────────────────

/**
 * The authoritative source type for an evidence entry.
 * Drives display treatment and link handling.
 */
export type EvidenceSourceType =
  | "framework"     // Industry framework (FOCUS, FinOps, ITIL, etc.)
  | "standard"      // Published standard (ISO, NIST, CNCF, etc.)
  | "methodology"   // Internal or vendor methodology
  | "benchmark"     // Published benchmark or survey data
  | "regulation"    // Regulatory / compliance requirement
  | "best-practice"; // Community or vendor best-practice guide

/**
 * A citable evidence entry explaining the rationale behind a calculation,
 * recommendation, or threshold used in FiceCal v2.
 */
export interface EvidenceEntry {
  /** Stable unique identifier, e.g. "focus-1.3-cost-allocation". */
  id: string;

  /** Short display title. */
  title: string;

  /** Source type for categorization and display treatment. */
  sourceType: EvidenceSourceType;

  /**
   * Name of the authoritative body or framework.
   * e.g. "FinOps Foundation", "NIST", "Google SRE"
   */
  source: string;

  /**
   * Specific version or edition of the source, if applicable.
   * e.g. "1.3", "2026", "4th Edition"
   */
  version?: string;

  /**
   * URL to the primary reference document.
   * May be undefined for internal methodologies.
   */
  url?: string;

  /**
   * One-paragraph explanation of what this evidence supports and why it was
   * chosen for FiceCal v2.
   */
  rationale: string;

  /**
   * Which calculation or recommendation formula keys this evidence supports.
   * Mirrors the `formulasApplied` keys from engine results.
   * e.g. ["slo.errorBudget.allowableDowntime", "slo.reliability.roi"]
   */
  appliesTo: string[];

  /**
   * Free-text tags for filtering in UI.
   * e.g. ["SLO", "reliability", "FinOps"]
   */
  tags: string[];
}

// ─── Evidence query ───────────────────────────────────────────────────────────

export interface EvidenceQuery {
  /** Filter by source type. */
  sourceType?: EvidenceSourceType;

  /** Return only entries whose appliesTo intersects this set. */
  formulaKeys?: string[];

  /** Return only entries containing all of these tags. */
  tags?: string[];

  /** Free-text search across title, rationale, source. Case-insensitive. */
  search?: string;
}

export interface EvidenceQueryResult {
  entries: EvidenceEntry[];
  totalMatched: number;
  query: EvidenceQuery;
}
