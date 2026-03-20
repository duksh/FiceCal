import { describe, it, expect } from "vitest";
import { computeHealthScore } from "../src/engine.js";
import type { HealthSignal } from "../src/types.js";

function makeSignal(overrides: Partial<HealthSignal> = {}): HealthSignal {
  return {
    id: "test.signal",
    category: "cost-efficiency",
    label: "Test Signal",
    score: 100,
    severity: "ok",
    rationale: "Test rationale",
    ...overrides,
  };
}

describe("computeHealthScore", () => {
  it("single signal, weight 1 → weightedScore equals signal score", () => {
    const signal = makeSignal({ score: 80, severity: "ok" });
    const result = computeHealthScore([{ signal, weight: 1 }]);
    expect(result.weightedScore).toBe(80);
  });

  it("two signals equal weight → weightedScore is average", () => {
    const s1 = makeSignal({ score: 60, severity: "warning" });
    const s2 = makeSignal({ score: 100, severity: "ok" });
    const result = computeHealthScore([
      { signal: s1, weight: 1 },
      { signal: s2, weight: 1 },
    ]);
    expect(result.weightedScore).toBe(80);
  });

  it("two signals unequal weight → correct weighted average", () => {
    const s1 = makeSignal({ score: 0, severity: "critical" });
    const s2 = makeSignal({ score: 100, severity: "ok" });
    // weight 1 and 3: (0*1 + 100*3) / 4 = 75
    const result = computeHealthScore([
      { signal: s1, weight: 1 },
      { signal: s2, weight: 3 },
    ]);
    expect(result.weightedScore).toBe(75);
  });

  it("worst severity propagates (one critical → overall critical)", () => {
    const s1 = makeSignal({ score: 100, severity: "ok" });
    const s2 = makeSignal({ score: 0, severity: "critical" });
    const result = computeHealthScore([
      { signal: s1, weight: 1 },
      { signal: s2, weight: 1 },
    ]);
    expect(result.overallSeverity).toBe("critical");
  });

  it("empty signals → warnings contain message, severity critical", () => {
    const result = computeHealthScore([]);
    expect(result.overallSeverity).toBe("critical");
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("No signals");
  });

  it("score 0+100 equal weight → weightedScore 50", () => {
    const s1 = makeSignal({ score: 0, severity: "critical" });
    const s2 = makeSignal({ score: 100, severity: "ok" });
    const result = computeHealthScore([
      { signal: s1, weight: 1 },
      { signal: s2, weight: 1 },
    ]);
    expect(result.weightedScore).toBe(50);
  });

  it("all ok signals → overallSeverity ok", () => {
    const s1 = makeSignal({ score: 90, severity: "ok" });
    const s2 = makeSignal({ score: 85, severity: "ok" });
    const result = computeHealthScore([
      { signal: s1, weight: 1 },
      { signal: s2, weight: 1 },
    ]);
    expect(result.overallSeverity).toBe("ok");
  });
});
