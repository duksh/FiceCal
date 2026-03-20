import type { HealthSignal, SignalSeverity } from "@ficecal/health-score";
import { RECOMMENDATION_RULES } from "./rules.js";
import type {
  Recommendation,
  RecommendationAudience,
  RecommendationResult,
  RecommendationPriority,
} from "./types.js";

// ─── Severity ordering ───────────────────────────────────────────────────────

const SEVERITY_RANK: Record<SignalSeverity, number> = {
  ok: 0,
  warning: 1,
  critical: 2,
};

const PRIORITY_RANK: Record<RecommendationPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

// ─── Engine ──────────────────────────────────────────────────────────────────

export interface ComputeRecommendationsOptions {
  /**
   * Restrict output to specific audiences.
   * Defaults to all four audiences if omitted.
   */
  audiences?: RecommendationAudience[];

  /**
   * Skip signals with severity below this level.
   * Defaults to "warning" (skips "ok" signals).
   */
  minSeverity?: SignalSeverity;
}

/**
 * Derive a prioritised, audience-scoped recommendation list from
 * an array of health signals.
 *
 * Algorithm:
 * 1. Filter signals to those meeting minSeverity.
 * 2. For each (signal, rule) pair where rule matches signal's category
 *    and severity, emit a Recommendation.
 * 3. Filter emitted recommendations by requested audiences.
 * 4. Deduplicate: if the same (id) appears more than once, keep
 *    the one with the highest priority (multiple signals can trigger
 *    the same rule).
 * 5. Sort: critical → high → medium → low.
 */
export function computeRecommendations(
  signals: HealthSignal[],
  options: ComputeRecommendationsOptions = {},
): RecommendationResult {
  const {
    audiences = ["finops-analyst", "developer", "executive", "platform-engineer"],
    minSeverity = "warning",
  } = options;

  const warnings: string[] = [];
  const generatedAt = new Date().toISOString();

  // Step 1: filter signals by minimum severity
  const actionableSignals = signals.filter(
    (s) => SEVERITY_RANK[s.severity] >= SEVERITY_RANK[minSeverity],
  );

  if (actionableSignals.length === 0) {
    warnings.push(
      "No signals met the minimum severity threshold — no recommendations generated.",
    );
    return {
      recommendations: [],
      generatedAt,
      requestedAudiences: audiences,
      signalCount: signals.length,
      warnings,
    };
  }

  // Step 2+3: match rules to signals
  const emitted = new Map<string, Recommendation>();

  for (const signal of actionableSignals) {
    for (const rule of RECOMMENDATION_RULES) {
      // Category must match
      if (rule.category !== signal.category) continue;
      // Rule must require at most the signal's severity
      if (SEVERITY_RANK[rule.minSeverity] > SEVERITY_RANK[signal.severity]) continue;
      // Audience filter
      if (!audiences.includes(rule.audience)) continue;

      const existing = emitted.get(rule.id);

      // Keep the highest-priority instance when multiple signals match
      if (
        existing !== undefined &&
        PRIORITY_RANK[existing.priority] >= PRIORITY_RANK[rule.priority]
      ) {
        continue;
      }

      const rec: Recommendation = {
        id: rule.id,
        audience: rule.audience,
        priority: rule.priority,
        category: rule.category,
        title: rule.title,
        rationale: rule.rationale(signal.rationale),
        action: rule.action,
        relatedSignalIds: [signal.id],
        ...(rule.estimatedImpact !== undefined
          ? { estimatedImpact: rule.estimatedImpact }
          : {}),
      };

      emitted.set(rule.id, rec);
    }
  }

  // Step 5: sort critical → high → medium → low, stable
  const sorted = [...emitted.values()].sort(
    (a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority],
  );

  return {
    recommendations: sorted,
    generatedAt,
    requestedAudiences: audiences,
    signalCount: signals.length,
    warnings,
  };
}
