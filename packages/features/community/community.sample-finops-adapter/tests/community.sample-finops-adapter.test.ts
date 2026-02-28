import { normalizeSampleFinOpsPayload } from "../src/index";

describe("community.sample-finops-adapter", () => {
  it("normalizes valid payload rows and computes coverage", () => {
    const result = normalizeSampleFinOpsPayload({
      sourceProvider: "sample-cloud",
      sourcePayload: [
        { service: "compute", cost: 10 },
        { service: "storage", cost: 20 },
        { service: "invalid", cost: Number.NaN },
      ],
    });

    expect(result.normalizedLineItems).toHaveLength(2);
    expect(result.mappingCoveragePct).toBe(67);
  });
});
