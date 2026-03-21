import { normalizePeriod } from "@ficecal/core-economics";
import type { Period } from "@ficecal/core-economics";
import type { McpToolDescriptor, McpToolResult } from "../types.js";

// ─── Input / Output ──────────────────────────────────────────────────────────

export interface PeriodNormalizeInput {
  amount: string;
  fromPeriod: string;
  toPeriod: string;
}

export interface PeriodNormalizeOutput {
  normalizedAmount: string;
  fromPeriod: string;
  toPeriod: string;
  formulasApplied: string[];
}

// ─── Tool descriptor ─────────────────────────────────────────────────────────

export const periodNormalizeTool: McpToolDescriptor<PeriodNormalizeInput, PeriodNormalizeOutput> = {
  id: "economics.period.normalize",
  name: "Period Normalize",
  description:
    "Convert a cost amount between billing periods (e.g. monthly → annual) using exact Decimal.js ratio arithmetic. All supported periods: hourly, daily, weekly, monthly, quarterly, annual.",
  namespace: "economics",
  stability: "stable",
  inputSchema: {
    type: "object",
    properties: {
      amount: { type: "string", description: "Source amount as a decimal string (e.g. '1500.00')" },
      fromPeriod: {
        type: "string",
        description: "Source billing period",
        enum: ["hourly", "daily", "weekly", "monthly", "quarterly", "annual"],
      },
      toPeriod: {
        type: "string",
        description: "Target billing period",
        enum: ["hourly", "daily", "weekly", "monthly", "quarterly", "annual"],
      },
    },
    required: ["amount", "fromPeriod", "toPeriod"],
  },

  handler: async (envelope) => {
    const { input, context } = envelope;

    const normalized = normalizePeriod(
      input.amount,
      input.fromPeriod as Period,
      input.toPeriod as Period,
    );

    const output: PeriodNormalizeOutput = {
      normalizedAmount: normalized,
      fromPeriod: input.fromPeriod,
      toPeriod: input.toPeriod,
      formulasApplied: ["period.normalize"],
    };

    const result: McpToolResult<PeriodNormalizeOutput> = {
      output,
      toolId: periodNormalizeTool.id,
      executedAt: new Date().toISOString(),
      requestId: context.requestId,
      warnings: [],
      appliedIds: ["period.normalize"],
    };

    return result;
  },
};
