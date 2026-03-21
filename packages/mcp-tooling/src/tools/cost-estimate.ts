import { computeAiCost } from "@ficecal/ai-token-economics";
import type { AiCostInput } from "@ficecal/ai-token-economics";
import type { McpToolDescriptor, McpToolResult } from "../types.js";

// ─── Input / Output ──────────────────────────────────────────────────────────

export interface CostEstimateInput {
  pricingUnit: string;
  // Token inputs
  inputTokens?: number;
  outputTokens?: number;
  inputPricePerUnit?: string;
  outputPricePerUnit?: string;
  // Image inputs
  imageCount?: number;
  pricePerImage?: string;
  resolutionMultiplier?: string;
  stepsMultiplier?: string;
  // Request inputs
  requestCount?: number;
  pricePerRequest?: string;
  // Time inputs
  durationSeconds?: number;
  pricePerSecond?: string;
  // Common
  currency: string;
  period: string;
}

export interface CostEstimateOutput {
  totalCost: string;
  currency: string;
  period: string;
  pricingUnit: string;
  breakdown: Array<{ label: string; quantity: number; unitCost: string; subtotal: string }>;
  formulasApplied: string[];
}

// ─── Tool descriptor ─────────────────────────────────────────────────────────

export const costEstimateTool: McpToolDescriptor<CostEstimateInput, CostEstimateOutput> = {
  id: "economics.estimate.cost",
  name: "Cost Estimate",
  description:
    "Compute AI inference cost for any pricing unit (per_token, per_1k_tokens, per_1m_tokens, per_image, per_request, per_second) using Decimal.js precision arithmetic.",
  namespace: "economics",
  stability: "stable",
  inputSchema: {
    type: "object",
    properties: {
      pricingUnit: {
        type: "string",
        description: "Pricing unit variant",
        enum: ["per_token", "per_1k_tokens", "per_1m_tokens", "per_image", "per_request", "per_second"],
      },
      inputTokens: { type: "number", description: "Number of input/prompt tokens" },
      outputTokens: { type: "number", description: "Number of output/completion tokens" },
      inputPricePerUnit: { type: "string", description: "Price per unit for input tokens (decimal string)" },
      outputPricePerUnit: { type: "string", description: "Price per unit for output tokens (decimal string)" },
      imageCount: { type: "number", description: "Number of images generated" },
      pricePerImage: { type: "string", description: "Base price per image (decimal string)" },
      resolutionMultiplier: { type: "string", description: "Resolution tier multiplier (default '1')" },
      stepsMultiplier: { type: "string", description: "Diffusion steps multiplier (default '1')" },
      requestCount: { type: "number", description: "Number of API requests" },
      pricePerRequest: { type: "string", description: "Price per API request (decimal string)" },
      durationSeconds: { type: "number", description: "Total inference duration in seconds" },
      pricePerSecond: { type: "string", description: "Price per second (decimal string)" },
      currency: { type: "string", description: "ISO 4217 currency code (e.g. USD)" },
      period: {
        type: "string",
        description: "Billing period",
        enum: ["hourly", "daily", "weekly", "monthly", "quarterly", "annual"],
      },
    },
    required: ["pricingUnit", "currency", "period"],
  },

  handler: async (envelope) => {
    const { input, context } = envelope;
    const warnings: string[] = [];

    // Build typed AiCostInput from the loose envelope input
    let aiInput: AiCostInput;

    if (
      input.pricingUnit === "per_token" ||
      input.pricingUnit === "per_1k_tokens" ||
      input.pricingUnit === "per_1m_tokens"
    ) {
      if (input.inputPricePerUnit === undefined) {
        warnings.push("inputPricePerUnit not provided — defaulting to '0'");
      }
      aiInput = {
        pricingUnit: input.pricingUnit as "per_token" | "per_1k_tokens" | "per_1m_tokens",
        inputTokens: input.inputTokens ?? 0,
        outputTokens: input.outputTokens ?? 0,
        inputPricePerUnit: input.inputPricePerUnit ?? "0",
        ...(input.outputPricePerUnit !== undefined
          ? { outputPricePerUnit: input.outputPricePerUnit }
          : {}),
        currency: input.currency,
        period: input.period as AiCostInput["period"],
      };
    } else if (input.pricingUnit === "per_image") {
      aiInput = {
        pricingUnit: "per_image",
        imageCount: input.imageCount ?? 0,
        pricePerImage: input.pricePerImage ?? "0",
        ...(input.resolutionMultiplier !== undefined
          ? { resolutionMultiplier: input.resolutionMultiplier }
          : {}),
        ...(input.stepsMultiplier !== undefined
          ? { stepsMultiplier: input.stepsMultiplier }
          : {}),
        currency: input.currency,
        period: input.period as AiCostInput["period"],
      };
    } else if (input.pricingUnit === "per_request") {
      aiInput = {
        pricingUnit: "per_request",
        requestCount: input.requestCount ?? 0,
        pricePerRequest: input.pricePerRequest ?? "0",
        currency: input.currency,
        period: input.period as AiCostInput["period"],
      };
    } else {
      // per_second
      aiInput = {
        pricingUnit: "per_second",
        durationSeconds: input.durationSeconds ?? 0,
        pricePerSecond: input.pricePerSecond ?? "0",
        currency: input.currency,
        period: input.period as AiCostInput["period"],
      };
    }

    const result = computeAiCost(aiInput);
    warnings.push(...result.warnings);

    const output: CostEstimateOutput = {
      totalCost: result.totalCost,
      currency: result.currency,
      period: result.period,
      pricingUnit: result.pricingUnit,
      breakdown: result.breakdown,
      formulasApplied: result.formulasApplied,
    };

    const toolResult: McpToolResult<CostEstimateOutput> = {
      output,
      toolId: costEstimateTool.id,
      executedAt: result.computedAt,
      requestId: context.requestId,
      warnings,
      appliedIds: result.formulasApplied,
    };

    return toolResult;
  },
};
