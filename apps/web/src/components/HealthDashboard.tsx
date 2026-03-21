// ─── HealthDashboard ──────────────────────────────────────────────────────────
//
// Computes health score from a mix of economics-derived signals and baseline
// signals. When an AiCostResult is available from CostEstimator, the
// "cost-per-unit" and "model-trust" signals are derived from it dynamically.

import { useMemo } from "react";
import { computeHealthScore } from "@ficecal/health-score";
import { computeRecommendations } from "@ficecal/recommendation-module";
import type { WeightedSignal } from "@ficecal/health-score";
import type { Recommendation } from "@ficecal/recommendation-module";
import type { AiCostResult } from "@ficecal/ai-token-economics";
import type { SharedContext } from "../types.js";

interface Props {
  context: SharedContext;
  economicsResult?: AiCostResult | null;
}

const SEVERITY_COLOR: Record<string, string> = {
  ok: "var(--fc-ok, #16a34a)",
  warning: "var(--fc-warn, #d97706)",
  critical: "var(--fc-crit, #dc2626)",
};

const PRIORITY_COLOR: Record<string, string> = {
  critical: "var(--fc-crit, #dc2626)",
  high: "#ea580c",
  medium: "var(--fc-warn, #d97706)",
  low: "var(--fc-text-muted, #6b7280)",
};

function deriveSignals(
  context: SharedContext,
  economicsResult: AiCostResult | null | undefined
): WeightedSignal[] {
  const signals: WeightedSignal[] = [];

  // ── Derived from economics result ─────────────────────────────────────────

  if (economicsResult) {
    const totalCost = parseFloat(economicsResult.totalCost);
    const hasWarnings = economicsResult.warnings.length > 0;

    signals.push({
      signal: {
        id: "ai-cost-model-trust",
        category: "model-trust",
        label: "AI cost model",
        score: hasWarnings ? 65 : 95,
        severity: hasWarnings ? "warning" : "ok",
        rationale: hasWarnings
          ? `Computation warnings: ${economicsResult.warnings.join("; ")}`
          : `${economicsResult.formulasApplied.length} formula(s) applied cleanly — decimal-precise outputs.`,
      },
      weight: 2,
    });

    signals.push({
      signal: {
        id: "ai-cost-unit-economics",
        category: "pricing-freshness",
        label: "Unit economics",
        score: totalCost > 0 ? 90 : 50,
        severity: totalCost > 0 ? "ok" : "warning",
        rationale:
          totalCost > 0
            ? `Total cost ${context.currency} ${totalCost.toFixed(4)} — period: ${economicsResult.period}.`
            : "No cost computed — verify input values.",
      },
      weight: 2,
    });
  }

  // ── Baseline context signals ───────────────────────────────────────────────

  const today = new Date();
  const endDate = new Date(context.endDate);
  const daysSinceEnd = Math.floor(
    (today.getTime() - endDate.getTime()) / 86_400_000
  );

  signals.push({
    signal: {
      id: "data-period-freshness",
      category: "pricing-freshness",
      label: "Data period freshness",
      score: daysSinceEnd <= 7 ? 100 : daysSinceEnd <= 30 ? 75 : 45,
      severity: daysSinceEnd <= 7 ? "ok" : daysSinceEnd <= 30 ? "warning" : "critical",
      rationale:
        daysSinceEnd <= 0
          ? "Analysis period is current or future."
          : `Analysis period ended ${daysSinceEnd} day(s) ago.`,
    },
    weight: 1,
  });

  signals.push({
    signal: {
      id: "data-completeness-context",
      category: "data-completeness",
      label: "Context completeness",
      score: context.workspaceId && context.currency ? 100 : 60,
      severity: context.workspaceId && context.currency ? "ok" : "warning",
      rationale:
        context.workspaceId && context.currency
          ? "Workspace ID and currency are set."
          : "Missing workspace ID or currency — outputs may lack full context.",
    },
    weight: 1,
  });

  return signals;
}

export function HealthDashboard({ context, economicsResult }: Props) {
  const signals = useMemo(
    () => deriveSignals(context, economicsResult),
    [context, economicsResult]
  );

  const healthResult = computeHealthScore(signals);
  const recResult = computeRecommendations(signals.map((ws) => ws.signal));

  const scoreColor = SEVERITY_COLOR[healthResult.overallSeverity] ?? SEVERITY_COLOR["ok"]!;

  return (
    <div className="panel-stack">
      {/* ── Score summary ────────────────────────────────────────────────── */}
      <section className="panel" aria-label="Health score summary">
        <h2>Health Score</h2>
        <div className="score-display">
          <span
            className="score-number"
            style={{ color: scoreColor }}
            aria-label={`Health score: ${healthResult.weightedScore.toFixed(0)} out of 100`}
          >
            {healthResult.weightedScore.toFixed(0)}
          </span>
          <span className="score-label">/ 100</span>
          <span className="severity-badge" style={{ backgroundColor: scoreColor }}>
            {healthResult.overallSeverity.toUpperCase()}
          </span>
        </div>
        <p className="hint">
          Weighted aggregate across {signals.length} signals ·{" "}
          {economicsResult ? "live economics wired" : "baseline signals only"} ·{" "}
          computed {new Date(healthResult.computedAt).toLocaleTimeString()}
        </p>
      </section>

      {/* ── Signal breakdown ─────────────────────────────────────────────── */}
      <section className="panel" aria-label="Signal breakdown">
        <h2>Signals</h2>
        <ul className="signal-list">
          {signals.map(({ signal }) => (
            <li key={signal.id} className="signal-item">
              <div className="signal-header">
                <span className="signal-label">{signal.label}</span>
                <span
                  className="severity-pill"
                  style={{ backgroundColor: SEVERITY_COLOR[signal.severity] ?? "#6b7280" }}
                >
                  {signal.severity}
                </span>
                <strong className="signal-score">{signal.score}</strong>
              </div>
              <p className="signal-rationale">{signal.rationale}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Recommendations ──────────────────────────────────────────────── */}
      <section className="panel" aria-label="Recommendations">
        <h2>Recommendations</h2>
        {recResult.recommendations.length === 0 ? (
          <p className="hint">No actionable recommendations — all signals are healthy.</p>
        ) : (
          <ul className="rec-list">
            {recResult.recommendations.map((rec: Recommendation) => (
              <li key={rec.id} className="rec-item">
                <div className="rec-header">
                  <span
                    className="priority-badge"
                    style={{ borderColor: PRIORITY_COLOR[rec.priority] ?? "#6b7280" }}
                  >
                    {rec.priority}
                  </span>
                  <span className="audience-tag">{rec.audience}</span>
                  <strong className="rec-title">{rec.title}</strong>
                </div>
                <p className="rec-action">{rec.action}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
