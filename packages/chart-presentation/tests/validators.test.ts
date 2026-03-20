import { describe, it, expect } from "vitest";
import { validateChartPayload } from "../src/validators.js";
import type { ChartPayload } from "../src/types.js";

function makeValidPayload(): ChartPayload {
  return {
    id: "test-chart-001",
    chartType: "bar",
    title: "Test Chart",
    series: [
      {
        id: "series-1",
        label: "Series One",
        points: [
          { label: "Jan", value: "100.00" },
          { label: "Feb", value: "200.00" },
        ],
      },
    ],
    xAxis: { label: "Month", scaleType: "band" },
    yAxis: { label: "Amount (USD)", scaleType: "linear", unit: "USD", showGrid: true },
    accessibility: {
      ariaLabel: "Test Chart showing monthly values",
      summary: "A bar chart showing monthly values for Jan and Feb.",
      keyboardNavigable: true,
    },
    provenance: {
      formulaIds: ["formula-abc"],
      dataSource: "test-adapter@abc123@2026-03-20",
      generatedAt: "2026-03-20T00:00:00.000Z",
      isStale: false,
    },
    renderable: true,
  };
}

describe("validateChartPayload", () => {
  it("1. valid full payload passes", () => {
    const result = validateChartPayload(makeValidPayload());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("2. missing id fails", () => {
    const payload = makeValidPayload() as Record<string, unknown>;
    delete payload.id;
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("id"))).toBe(true);
  });

  it("3. missing series fails", () => {
    const payload = makeValidPayload() as Record<string, unknown>;
    delete payload.series;
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("series"))).toBe(true);
  });

  it("4. empty series array fails", () => {
    const payload = { ...makeValidPayload(), series: [] };
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("series"))).toBe(true);
  });

  it("5. invalid chartType fails", () => {
    const payload = { ...makeValidPayload(), chartType: "hexagon" };
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("chartType"))).toBe(true);
  });

  it("6. missing accessibility fails", () => {
    const payload = makeValidPayload() as Record<string, unknown>;
    delete payload.accessibility;
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("accessibility"))).toBe(true);
  });

  it("7. missing provenance fails", () => {
    const payload = makeValidPayload() as Record<string, unknown>;
    delete payload.provenance;
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("provenance"))).toBe(true);
  });

  it("8. isStale true without stalenessReason fails", () => {
    const payload = {
      ...makeValidPayload(),
      provenance: {
        formulaIds: ["formula-abc"],
        dataSource: "test-adapter@abc123@2026-03-20",
        generatedAt: "2026-03-20T00:00:00.000Z",
        isStale: true,
        // no stalenessReason
      },
    };
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("stalenessReason"))).toBe(true);
  });

  it("9. renderable false without notRenderableReason fails", () => {
    const payload = { ...makeValidPayload(), renderable: false };
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("notRenderableReason"))).toBe(true);
  });

  it("10. series point missing value fails", () => {
    const payload: ChartPayload = {
      ...makeValidPayload(),
      series: [
        {
          id: "series-1",
          label: "Series One",
          points: [
            { label: "Jan", value: "" }, // empty string — falsy
          ],
        },
      ],
    };
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("value"))).toBe(true);
  });

  it("11. invalid axis scaleType fails", () => {
    const payload = {
      ...makeValidPayload(),
      xAxis: { label: "Month", scaleType: "invalid-scale" },
    };
    const result = validateChartPayload(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("scaleType"))).toBe(true);
  });
});
