import { computeHealthScore } from "@ficecal/health-score";
import { computeRecommendations } from "@ficecal/recommendation-module";
import type { HealthSignal } from "@ficecal/health-score";
import type { McpToolDescriptor, McpToolResult } from "../types.js";

// ─── Input / Output ──────────────────────────────────────────────────────────

export interface HealthSignalInput {
  id: string;
  category: string;
  label: string;
  score: number;
  severity: string;
  rationale: string;
  recommendation?: string;
}

export interface WeightedSignalInput {
  signal: HealthSignalInput;
  weight: number;
}

export interface HealthScoreQueryInput {
  signals: WeightedSignalInput[];
  audiences?: string[];
}

export interface HealthScoreQueryOutput {
  weightedScore: number;
  overallSeverity: string;
  computedAt: string;
  warnings: string[];
  recommendations: Array<{
    id: string;
    audience: string;
    priority: string;
    title: string;
    action: string;
  }>;
}

// ─── Tool descriptor ─────────────────────────────────────────────────────────

export const healthScoreQueryTool: McpToolDescriptor<HealthScoreQueryInput, HealthScoreQueryOutput> = {
  id: "health.score.query",
  name: "Health Score Query",
  description:
    "Compute a weighted aggregate health score from a set of health signals, then derive audience-aware recommendations for any signals below threshold.",
  namespace: "health",
  stability: "stable",
  inputSchema: {
    type: "object",
    properties: {
      signals: {
        type: "array",
        description: "Array of weighted health signals to evaluate",
      },
      audiences: {
        type: "array",
        description: "Audience personas to filter recommendations for (default: all)",
      },
    },
    required: ["signals"],
  },

  handler: async (envelope) => {
    const { input, context } = envelope;

    // Cast the loose input signals to the typed HealthSignal interface
    const typedSignals: HealthSignal[] = input.signals.map((ws) => ({
      id: ws.signal.id,
      category: ws.signal.category as HealthSignal["category"],
      label: ws.signal.label,
      score: ws.signal.score,
      severity: ws.signal.severity as HealthSignal["severity"],
      rationale: ws.signal.rationale,
      ...(ws.signal.recommendation !== undefined
        ? { recommendation: ws.signal.recommendation }
        : {}),
    }));

    const weightedSignals = input.signals.map((ws, i) => ({
      signal: typedSignals[i]!,
      weight: ws.weight,
    }));

    const healthResult = computeHealthScore(weightedSignals);

    const recResult = computeRecommendations(typedSignals, {
      audiences: input.audiences as Parameters<typeof computeRecommendations>[1]["audiences"],
    });

    const output: HealthScoreQueryOutput = {
      weightedScore: Number(healthResult.weightedScore.toFixed(2)),
      overallSeverity: healthResult.overallSeverity,
      computedAt: healthResult.computedAt,
      warnings: [...healthResult.warnings, ...recResult.warnings],
      recommendations: recResult.recommendations.map((r) => ({
        id: r.id,
        audience: r.audience,
        priority: r.priority,
        title: r.title,
        action: r.action,
      })),
    };

    const result: McpToolResult<HealthScoreQueryOutput> = {
      output,
      toolId: healthScoreQueryTool.id,
      executedAt: healthResult.computedAt,
      requestId: context.requestId,
      warnings: output.warnings,
      appliedIds: ["health.weightedScore", "recommendation.ruleEngine"],
    };

    return result;
  },
};
