import { describe, it, expect } from "vitest";
import { costEstimateTool, healthScoreQueryTool, periodNormalizeTool } from "../src/index.js";
import type { McpRequestContext } from "../src/types.js";

// ─── Context fixture ──────────────────────────────────────────────────────────

function makeContext(overrides?: Partial<McpRequestContext>): McpRequestContext {
  return {
    requestId: "test-req-001",
    traceId: "test-trace-001",
    mode: "operator",
    workspaceId: "ws-test",
    actor: "system",
    timeRange: { start: "2026-01-01", end: "2026-01-31", tz: "UTC" },
    contractVersions: { mcp: "2.0", tool: "1.0", fixture: "1.0" },
    featureFlags: [],
    ...overrides,
  };
}

// ─── costEstimateTool ─────────────────────────────────────────────────────────

describe("costEstimateTool (economics.estimate.cost)", () => {
  it("has correct id and namespace", () => {
    expect(costEstimateTool.id).toBe("economics.estimate.cost");
    expect(costEstimateTool.namespace).toBe("economics");
    expect(costEstimateTool.stability).toBe("stable");
  });

  it("computes per_1m_tokens cost correctly", async () => {
    const result = await costEstimateTool.handler({
      context: makeContext(),
      input: {
        pricingUnit: "per_1m_tokens",
        inputTokens: 1_000_000,
        outputTokens: 500_000,
        inputPricePerUnit: "0.50",
        outputPricePerUnit: "1.50",
        currency: "USD",
        period: "monthly",
      },
    });
    expect(result.output.totalCost).toBe("1.2500000000");
    expect(result.requestId).toBe("test-req-001");
    expect(result.toolId).toBe("economics.estimate.cost");
  });

  it("computes per_image cost correctly", async () => {
    const result = await costEstimateTool.handler({
      context: makeContext(),
      input: {
        pricingUnit: "per_image",
        imageCount: 100,
        pricePerImage: "0.080",
        currency: "USD",
        period: "monthly",
      },
    });
    expect(result.output.totalCost).toBe("8.0000000000");
    expect(result.output.pricingUnit).toBe("per_image");
  });

  it("computes per_request cost correctly", async () => {
    const result = await costEstimateTool.handler({
      context: makeContext(),
      input: {
        pricingUnit: "per_request",
        requestCount: 1000,
        pricePerRequest: "0.0005",
        currency: "USD",
        period: "monthly",
      },
    });
    expect(result.output.totalCost).toBe("0.5000000000");
  });

  it("computes per_second cost correctly", async () => {
    const result = await costEstimateTool.handler({
      context: makeContext(),
      input: {
        pricingUnit: "per_second",
        durationSeconds: 3600,
        pricePerSecond: "0.00010",
        currency: "USD",
        period: "monthly",
      },
    });
    expect(result.output.totalCost).toBe("0.3600000000");
  });

  it("includes formulasApplied in output", async () => {
    const result = await costEstimateTool.handler({
      context: makeContext(),
      input: {
        pricingUnit: "per_token",
        inputTokens: 100,
        outputTokens: 50,
        inputPricePerUnit: "0.000010",
        currency: "USD",
        period: "monthly",
      },
    });
    expect(result.appliedIds.length).toBeGreaterThan(0);
  });
});

// ─── healthScoreQueryTool ─────────────────────────────────────────────────────

describe("healthScoreQueryTool (health.score.query)", () => {
  it("has correct id and namespace", () => {
    expect(healthScoreQueryTool.id).toBe("health.score.query");
    expect(healthScoreQueryTool.namespace).toBe("health");
    expect(healthScoreQueryTool.stability).toBe("stable");
  });

  it("computes health score from signals", async () => {
    const result = await healthScoreQueryTool.handler({
      context: makeContext(),
      input: {
        signals: [
          {
            signal: {
              id: "sig-1",
              category: "pricing-freshness",
              label: "Pricing freshness",
              score: 80,
              severity: "ok",
              rationale: "Pricing is fresh.",
            },
            weight: 1,
          },
          {
            signal: {
              id: "sig-2",
              category: "budget-adherence",
              label: "Budget adherence",
              score: 60,
              severity: "warning",
              rationale: "Spend at 88% of budget.",
            },
            weight: 2,
          },
        ],
      },
    });
    expect(result.output.weightedScore).toBeTypeOf("number");
    expect(result.output.weightedScore).toBeGreaterThan(0);
    expect(["ok", "warning", "critical"]).toContain(result.output.overallSeverity);
    expect(result.requestId).toBe("test-req-001");
  });

  it("returns recommendations for warning-level signals", async () => {
    const result = await healthScoreQueryTool.handler({
      context: makeContext(),
      input: {
        signals: [
          {
            signal: {
              id: "sig-budget",
              category: "budget-adherence",
              label: "Budget",
              score: 40,
              severity: "critical",
              rationale: "Budget exceeded.",
            },
            weight: 1,
          },
        ],
      },
    });
    expect(result.output.recommendations.length).toBeGreaterThan(0);
    const priorities = result.output.recommendations.map((r) => r.priority);
    expect(priorities).toContain("critical");
  });

  it("returns no recommendations when all signals are ok", async () => {
    const result = await healthScoreQueryTool.handler({
      context: makeContext(),
      input: {
        signals: [
          {
            signal: {
              id: "sig-ok",
              category: "cost-efficiency",
              label: "Cost efficiency",
              score: 100,
              severity: "ok",
              rationale: "All good.",
            },
            weight: 1,
          },
        ],
      },
    });
    expect(result.output.recommendations).toHaveLength(0);
  });
});

// ─── periodNormalizeTool ──────────────────────────────────────────────────────

describe("periodNormalizeTool (economics.period.normalize)", () => {
  it("has correct id and namespace", () => {
    expect(periodNormalizeTool.id).toBe("economics.period.normalize");
    expect(periodNormalizeTool.namespace).toBe("economics");
    expect(periodNormalizeTool.stability).toBe("stable");
  });

  it("converts monthly to annual correctly", async () => {
    const result = await periodNormalizeTool.handler({
      context: makeContext(),
      input: { amount: "1000", fromPeriod: "monthly", toPeriod: "annual" },
    });
    expect(result.output.normalizedAmount).toBe("12000.0000000000");
    expect(result.output.fromPeriod).toBe("monthly");
    expect(result.output.toPeriod).toBe("annual");
    expect(result.appliedIds).toContain("period.normalize");
  });

  it("converts annual to monthly correctly", async () => {
    const result = await periodNormalizeTool.handler({
      context: makeContext(),
      input: { amount: "12000", fromPeriod: "annual", toPeriod: "monthly" },
    });
    expect(result.output.normalizedAmount).toBe("1000.0000000000");
  });

  it("converts daily to monthly correctly", async () => {
    const result = await periodNormalizeTool.handler({
      context: makeContext(),
      input: { amount: "100", fromPeriod: "daily", toPeriod: "monthly" },
    });
    // 100/day × 30.4375 days/month
    const val = parseFloat(result.output.normalizedAmount);
    expect(val).toBeGreaterThan(3000);
    expect(val).toBeLessThan(3100);
  });

  it("returns requestId from context", async () => {
    const result = await periodNormalizeTool.handler({
      context: makeContext({ requestId: "my-req-xyz" }),
      input: { amount: "500", fromPeriod: "monthly", toPeriod: "annual" },
    });
    expect(result.requestId).toBe("my-req-xyz");
  });
});
