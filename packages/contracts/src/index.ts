/**
 * @ficecal/contracts — canonical cross-package boundary types
 *
 * This package defines the shared contract types that cross package
 * boundaries in the FiceCal v2 monorepo. No business logic lives here —
 * only plain TypeScript interfaces and discriminated unions.
 *
 * Consuming packages import from here rather than from each other's
 * internal types, preventing circular dependencies and making
 * contract drift detectable at the boundary.
 */

// ─── FinOps context ───────────────────────────────────────────────────────────

export interface WorkspaceContext {
  /** Stable workspace identifier */
  workspaceId: string;
  /** ISO date string — start of analysis period */
  startDate: string;
  /** ISO date string — end of analysis period */
  endDate: string;
  /** ISO 4217 currency code */
  currency: string;
}

// ─── Intent / Scope / Mode ────────────────────────────────────────────────────

export type Intent = "viability" | "operations" | "architecture" | "executive";
export type Scope =
  | "baseline-unit-economics"
  | "optimization-opportunities"
  | "architecture-tradeoffs"
  | "executive-strategy";
export type Mode = "quick" | "operator" | "architect";

export interface IntentScopeSnapshot {
  intent: Intent;
  scope: Scope;
  mode: Mode;
}

// ─── Economics result boundary ────────────────────────────────────────────────

/**
 * Minimal economics result shape that crosses from compute packages → UI.
 * Full types live in their respective packages; this is the cross-boundary subset.
 */
export interface EconomicsResultSummary {
  domain: string;
  totalCost: string;
  currency: string;
  period: string;
  formulasApplied: string[];
  warnings: string[];
  computedAt: string;
}

// ─── Health signal boundary ───────────────────────────────────────────────────

export type SignalSeverity = "ok" | "warning" | "critical";

export interface HealthSignalSummary {
  id: string;
  category: string;
  label: string;
  score: number;
  severity: SignalSeverity;
  rationale: string;
}

export interface HealthScoreSummary {
  weightedScore: number;
  overallSeverity: SignalSeverity;
  signalCount: number;
  computedAt: string;
}

// ─── Recommendation boundary ──────────────────────────────────────────────────

export type RecommendationPriority = "critical" | "high" | "medium" | "low";

export interface RecommendationSummary {
  id: string;
  title: string;
  action: string;
  priority: RecommendationPriority;
  audience: string;
}

// ─── Telemetry boundary ───────────────────────────────────────────────────────

export interface TelemetryBase {
  name: string;
  ts: number;
  sessionId: string;
}
