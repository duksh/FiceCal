import type { HealthSignal, HealthScoreResult, SignalSeverity } from "./types.js";

type WeightedSignal = { signal: HealthSignal; weight: number };

function worstSeverity(signals: HealthSignal[]): SignalSeverity {
  if (signals.some(s => s.severity === "critical")) return "critical";
  if (signals.some(s => s.severity === "warning")) return "warning";
  return "ok";
}

/**
 * Compute aggregate health score from a set of weighted signals.
 * weightedScore = sum(signal.score * weight) / sum(weights)
 * All weights must be positive. Signals with weight 0 are excluded.
 */
export function computeHealthScore(weighted: WeightedSignal[]): HealthScoreResult {
  const warnings: string[] = [];
  const active = weighted.filter(w => w.weight > 0);

  if (active.length === 0) {
    return {
      weightedScore: 0,
      overallSeverity: "critical",
      signals: [],
      computedAt: new Date().toISOString(),
      warnings: ["No signals provided — health score is undefined."],
    };
  }

  const totalWeight = active.reduce((sum, w) => sum + w.weight, 0);
  const weightedSum = active.reduce((sum, w) => sum + w.signal.score * w.weight, 0);
  const weightedScore = Math.round(weightedSum / totalWeight);

  const signals = active.map(w => w.signal);
  const overallSeverity = worstSeverity(signals);

  return {
    weightedScore,
    overallSeverity,
    signals,
    computedAt: new Date().toISOString(),
    warnings,
  };
}

export type { WeightedSignal };
