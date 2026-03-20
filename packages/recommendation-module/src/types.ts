import type { SignalCategory, SignalSeverity } from "@ficecal/health-score";

// ─── Audience ───────────────────────────────────────────────────────────────

/**
 * Personas that consume recommendations. Each audience receives
 * only the recommendations relevant to their remit.
 */
export type RecommendationAudience =
  | "finops-analyst"    // Cost optimization, spend governance
  | "developer"         // Model selection, API usage patterns
  | "executive"         // Budget variance, risk summary
  | "platform-engineer"; // Data freshness, integration health

// ─── Priority ───────────────────────────────────────────────────────────────

/**
 * Action urgency. Maps loosely to signal severity but allows
 * independent escalation based on business impact.
 */
export type RecommendationPriority = "critical" | "high" | "medium" | "low";

// ─── Core types ─────────────────────────────────────────────────────────────

export interface Recommendation {
  /** Stable, namespaced identifier. Format: `<category>.<audience>.<slug>` */
  id: string;

  /** The persona this recommendation is written for. */
  audience: RecommendationAudience;

  /** Urgency level driving sort order. */
  priority: RecommendationPriority;

  /** Signal domain that triggered this recommendation. */
  category: SignalCategory;

  /** Short, human-readable title (≤80 chars). */
  title: string;

  /** Why this recommendation was triggered — references the signal rationale. */
  rationale: string;

  /** Concrete, imperative action statement. */
  action: string;

  /** IDs of the HealthSignals that contributed to this recommendation. */
  relatedSignalIds: string[];

  /**
   * Optional qualitative or quantitative impact note.
   * Example: "Reduces stale-pricing risk by refreshing rates ≤1 day old."
   */
  estimatedImpact?: string;
}

export interface RecommendationResult {
  /** Ordered recommendations (critical → high → medium → low). */
  recommendations: Recommendation[];

  /** ISO timestamp of when this result was generated. */
  generatedAt: string;

  /** Audiences for which recommendations were requested. */
  requestedAudiences: RecommendationAudience[];

  /** How many input signals were evaluated. */
  signalCount: number;

  /** Warnings produced during generation (e.g., no non-ok signals). */
  warnings: string[];
}

// ─── Rule definition ─────────────────────────────────────────────────────────

/**
 * A declarative rule that maps a (category × minSeverity) pair to
 * a recommendation for a specific audience.
 */
export interface RecommendationRule {
  id: string;
  category: SignalCategory;
  /** Trigger when the signal's severity is at least this level. */
  minSeverity: SignalSeverity;
  audience: RecommendationAudience;
  priority: RecommendationPriority;
  title: string;
  rationale: (signalRationale: string) => string;
  action: string;
  estimatedImpact?: string;
}
