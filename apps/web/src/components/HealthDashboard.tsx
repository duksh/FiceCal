import { useState } from "react";
import { computeHealthScore } from "@ficecal/health-score";
import { computeRecommendations } from "@ficecal/recommendation-module";
import type { HealthSignal, WeightedSignal } from "@ficecal/health-score";
import type { Recommendation } from "@ficecal/recommendation-module";
import type { SharedContext } from "../types.js";

interface Props {
  context: SharedContext;
}

// Default demo signals so the dashboard is immediately useful
const DEFAULT_SIGNALS: WeightedSignal[] = [
  {
    signal: {
      id: "pricing-freshness-demo",
      category: "pricing-freshness",
      label: "Pricing freshness",
      score: 75,
      severity: "warning",
      rationale: "Pricing data is 12 days old — past the 7-day warning threshold.",
    },
    weight: 2,
  },
  {
    signal: {
      id: "budget-adherence-demo",
      category: "budget-adherence",
      label: "Budget adherence",
      score: 55,
      severity: "warning",
      rationale: "Spend at 88% of the monthly budget ceiling.",
    },
    weight: 3,
  },
  {
    signal: {
      id: "model-trust-demo",
      category: "model-trust",
      label: "Model trust",
      score: 90,
      severity: "ok",
      rationale: "All active models use verified pricing sources.",
    },
    weight: 1,
  },
  {
    signal: {
      id: "data-completeness-demo",
      category: "data-completeness",
      label: "Data completeness",
      score: 100,
      severity: "ok",
      rationale: "All billing records are complete.",
    },
    weight: 1,
  },
];

const SEVERITY_COLOR: Record<string, string> = {
  ok: "#16a34a",
  warning: "#d97706",
  critical: "#dc2626",
};

const PRIORITY_COLOR: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
  low: "#6b7280",
};

export function HealthDashboard({ context: _context }: Props) {
  const [signals] = useState<WeightedSignal[]>(DEFAULT_SIGNALS);

  const healthResult = computeHealthScore(signals);
  const recResult = computeRecommendations(signals.map((ws) => ws.signal));

  const scoreColor =
    healthResult.overallSeverity === "ok"
      ? SEVERITY_COLOR["ok"]!
      : healthResult.overallSeverity === "warning"
        ? SEVERITY_COLOR["warning"]!
        : SEVERITY_COLOR["critical"]!;

  return (
    <div className="panel-stack">
      {/* ── Score summary ────────────────────────────────────────── */}
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
          <span
            className="severity-badge"
            style={{ backgroundColor: scoreColor }}
          >
            {healthResult.overallSeverity}
          </span>
        </div>
        <p className="hint">
          Weighted aggregate across {signals.length} signals · computed{" "}
          {new Date(healthResult.computedAt).toLocaleTimeString()}
        </p>
      </section>

      {/* ── Signal breakdown ─────────────────────────────────────── */}
      <section className="panel" aria-label="Signal breakdown">
        <h2>Signals</h2>
        <ul className="signal-list">
          {signals.map(({ signal }: { signal: HealthSignal }) => (
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

      {/* ── Recommendations ───────────────────────────────────────── */}
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
