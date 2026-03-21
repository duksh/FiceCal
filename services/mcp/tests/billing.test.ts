// ─── Billing MCP Tool Tests ───────────────────────────────────────────────────
//
// Phase 6 integration tests for billing.estimate.actual and billing.compare.period.
// Uses app.inject() — no live port, no external dependencies, deterministic fixtures.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/server.js";
import { _resetRegistry } from "../src/transport/registry.js";

let app: FastifyInstance;

beforeEach(async () => {
  _resetRegistry();
  app = await buildApp();
  await app.ready();
});

afterEach(async () => {
  await app.close();
  _resetRegistry();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callBillingEstimate(provider: string, extra: Record<string, unknown> = {}) {
  return app.inject({
    method: "POST",
    url: "/mcp/v1/tools/billing.estimate.actual/call",
    payload: {
      input: {
        provider,
        periodStart: "2026-01-01",
        periodEnd: "2026-02-01",
        ...extra,
      },
    },
  });
}

async function callBillingCompare(provider: string) {
  return app.inject({
    method: "POST",
    url: "/mcp/v1/tools/billing.compare.period/call",
    payload: {
      input: {
        provider,
        baselineStart: "2026-01-01",
        baselineEnd: "2026-02-01",
        comparisonStart: "2026-01-01",
        comparisonEnd: "2026-02-01",
      },
    },
  });
}

// ─── billing.estimate.actual — AWS ────────────────────────────────────────────

describe("POST /mcp/v1/tools/billing.estimate.actual/call — AWS", () => {
  it("returns 200 for provider aws", async () => {
    const res = await callBillingEstimate("aws");
    expect(res.statusCode).toBe(200);
  });

  it("returns correct toolId", async () => {
    const res = await callBillingEstimate("aws");
    expect(res.json().toolId).toBe("billing.estimate.actual");
  });

  it("returns aws fixture totalCost of 1450.32", async () => {
    const res = await callBillingEstimate("aws");
    expect(res.json().output.totalCost).toBe(1450.32);
  });

  it("returns 2 line items for aws fixture", async () => {
    const res = await callBillingEstimate("aws");
    const { output } = res.json();
    expect(output.lineItemCount).toBe(2);
    expect(output.lineItems).toHaveLength(2);
  });

  it("returns AmazonBedrock as first line item service", async () => {
    const res = await callBillingEstimate("aws");
    const { lineItems } = res.json().output;
    expect(lineItems[0].service).toBe("AmazonBedrock");
  });

  it("ingestMode is deterministic", async () => {
    const res = await callBillingEstimate("aws");
    expect(res.json().output.ingestMode).toBe("deterministic");
  });

  it("includes fixtureVersion in output", async () => {
    const res = await callBillingEstimate("aws");
    expect(res.json().output.fixtureVersion).toBe("1.0.0");
  });

  it("includes deterministic warning in warnings array", async () => {
    const res = await callBillingEstimate("aws");
    const { warnings } = res.json();
    expect(Array.isArray(warnings)).toBe(true);
    expect(warnings.some((w: string) => w.includes("deterministic"))).toBe(true);
  });

  it("echoes requestId from x-request-id header", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/mcp/v1/tools/billing.estimate.actual/call",
      headers: { "x-request-id": "billing-req-001" },
      payload: { input: { provider: "aws", periodStart: "2026-01-01", periodEnd: "2026-02-01" } },
    });
    expect(res.json().requestId).toBe("billing-req-001");
  });
});

// ─── billing.estimate.actual — all providers ──────────────────────────────────

describe("POST /mcp/v1/tools/billing.estimate.actual/call — all providers", () => {
  it("returns data for gcp provider", async () => {
    const res = await callBillingEstimate("gcp");
    expect(res.statusCode).toBe(200);
    expect(res.json().output.provider).toBe("gcp");
    expect(res.json().output.totalCost).toBe(987.14);
  });

  it("returns data for azure provider", async () => {
    const res = await callBillingEstimate("azure");
    expect(res.statusCode).toBe(200);
    expect(res.json().output.provider).toBe("azure");
    expect(res.json().output.totalCost).toBe(1123.88);
  });

  it("returns data for openai provider", async () => {
    const res = await callBillingEstimate("openai");
    expect(res.statusCode).toBe(200);
    expect(res.json().output.provider).toBe("openai");
    expect(res.json().output.totalCost).toBe(634.75);
  });

  it("returns 500 for unregistered provider", async () => {
    const res = await callBillingEstimate("unknown-cloud");
    expect(res.statusCode).toBe(500);
    expect(res.json().error.code).toBe("TOOL_EXECUTION_FAILED");
  });

  it("openai fixture has 2 line items (input + output tokens)", async () => {
    const res = await callBillingEstimate("openai");
    const { lineItems } = res.json().output;
    expect(lineItems).toHaveLength(2);
    expect(lineItems.some((li: { sku: string }) => li.sku === "gpt-4o-input")).toBe(true);
    expect(lineItems.some((li: { sku: string }) => li.sku === "gpt-4o-output")).toBe(true);
  });
});

// ─── billing.compare.period ───────────────────────────────────────────────────

describe("POST /mcp/v1/tools/billing.compare.period/call", () => {
  it("returns 200 for aws provider", async () => {
    const res = await callBillingCompare("aws");
    expect(res.statusCode).toBe(200);
  });

  it("returns correct toolId", async () => {
    const res = await callBillingCompare("aws");
    expect(res.json().toolId).toBe("billing.compare.period");
  });

  it("returns flat trend when comparing fixture to itself", async () => {
    // Same period vs same period → delta = 0 → trend: flat
    const res = await callBillingCompare("aws");
    const { output } = res.json();
    expect(output.trend).toBe("flat");
    expect(output.deltaCost).toBe(0);
  });

  it("deltaPercent is 0 or null when baseline equals comparison", async () => {
    const res = await callBillingCompare("aws");
    const { output } = res.json();
    // deltaPercent is 0 (not null) because baseline > 0
    expect(output.deltaPercent).toBe(0);
  });

  it("returns serviceDeltas array with at least 1 entry", async () => {
    const res = await callBillingCompare("aws");
    const { serviceDeltas } = res.json().output;
    expect(Array.isArray(serviceDeltas)).toBe(true);
    expect(serviceDeltas.length).toBeGreaterThan(0);
  });

  it("serviceDeltas contain AmazonBedrock and AmazonS3 for aws", async () => {
    const res = await callBillingCompare("aws");
    const { serviceDeltas } = res.json().output;
    const services = serviceDeltas.map((d: { service: string }) => d.service);
    expect(services).toContain("AmazonBedrock");
    expect(services).toContain("AmazonS3");
  });

  it("works for gcp provider", async () => {
    const res = await callBillingCompare("gcp");
    expect(res.statusCode).toBe(200);
    const { output } = res.json();
    expect(output.provider).toBe("gcp");
  });

  it("returns 500 for unknown provider", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/mcp/v1/tools/billing.compare.period/call",
      payload: {
        input: {
          provider: "nonexistent",
          baselineStart: "2026-01-01",
          baselineEnd: "2026-02-01",
          comparisonStart: "2026-01-01",
          comparisonEnd: "2026-02-01",
        },
      },
    });
    expect(res.statusCode).toBe(500);
    expect(res.json().error.code).toBe("TOOL_EXECUTION_FAILED");
  });
});

// ─── Plugin registry health assertions ────────────────────────────────────────

describe("Plugin registry via /health", () => {
  it("health reports 5 tools after Phase 6 plugin bootstrap", async () => {
    const res = await app.inject({ method: "GET", url: "/mcp/v1/health" });
    expect(res.json().toolCount).toBe(5);
  });

  it("capabilities manifest includes billing namespace", async () => {
    const res = await app.inject({ method: "GET", url: "/mcp/v1/capabilities" });
    const body = res.json();
    const billingNs = body.toolNamespaces.find(
      (ns: { namespace: string }) => ns.namespace === "billing"
    );
    expect(billingNs).toBeDefined();
    expect(billingNs.stability).toBe("beta");
  });
});
