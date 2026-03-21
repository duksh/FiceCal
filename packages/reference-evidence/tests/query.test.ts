import { describe, it, expect } from "vitest";
import {
  EVIDENCE_CATALOG,
  queryEvidence,
  getEvidenceById,
  getEvidenceForFormula,
  getAllEvidence,
} from "../src/index.js";

// ─── EVIDENCE_CATALOG ─────────────────────────────────────────────────────────

describe("EVIDENCE_CATALOG", () => {
  it("contains at least 8 entries", () => {
    expect(EVIDENCE_CATALOG.length).toBeGreaterThanOrEqual(8);
  });

  it("every entry has required fields", () => {
    EVIDENCE_CATALOG.forEach((e) => {
      expect(e.id.length).toBeGreaterThan(0);
      expect(e.title.length).toBeGreaterThan(0);
      expect(e.source.length).toBeGreaterThan(0);
      expect(e.rationale.length).toBeGreaterThan(0);
      expect(e.appliesTo.length).toBeGreaterThan(0);
      expect(e.tags.length).toBeGreaterThan(0);
    });
  });

  it("all ids are unique", () => {
    const ids = EVIDENCE_CATALOG.map((e) => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("contains FOCUS 1.3 entry", () => {
    expect(EVIDENCE_CATALOG.some((e) => e.id === "focus-1.3-cost-allocation")).toBe(true);
  });

  it("contains Google SRE error budget entry", () => {
    expect(EVIDENCE_CATALOG.some((e) => e.id === "google-sre-error-budget")).toBe(true);
  });
});

// ─── getAllEvidence ───────────────────────────────────────────────────────────

describe("getAllEvidence", () => {
  it("returns all catalog entries", () => {
    expect(getAllEvidence().length).toBe(EVIDENCE_CATALOG.length);
  });

  it("returns a copy, not the original array", () => {
    const result = getAllEvidence();
    result.push({} as never);
    expect(getAllEvidence().length).toBe(EVIDENCE_CATALOG.length);
  });
});

// ─── getEvidenceById ──────────────────────────────────────────────────────────

describe("getEvidenceById", () => {
  it("finds an entry by exact id", () => {
    const e = getEvidenceById("google-sre-error-budget");
    expect(e).toBeDefined();
    expect(e!.id).toBe("google-sre-error-budget");
  });

  it("returns undefined for unknown id", () => {
    expect(getEvidenceById("does-not-exist")).toBeUndefined();
  });

  it("finds FOCUS entry", () => {
    const e = getEvidenceById("focus-1.3-cost-allocation");
    expect(e!.sourceType).toBe("standard");
    expect(e!.version).toBe("1.3");
  });
});

// ─── getEvidenceForFormula ────────────────────────────────────────────────────

describe("getEvidenceForFormula", () => {
  it("finds evidence for slo.errorBudget.allowableDowntime", () => {
    const entries = getEvidenceForFormula("slo.errorBudget.allowableDowntime");
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((e) => e.id === "google-sre-error-budget")).toBe(true);
  });

  it("finds evidence for slo.reliability.roi", () => {
    const entries = getEvidenceForFormula("slo.reliability.roi");
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((e) => e.id === "slo-reliability-roi")).toBe(true);
  });

  it("finds evidence for budget.projection.compoundGrowth", () => {
    const entries = getEvidenceForFormula("budget.projection.compoundGrowth");
    expect(entries.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown formula key", () => {
    expect(getEvidenceForFormula("does.not.exist")).toHaveLength(0);
  });

  it("finds evidence for forecast.trend.linear", () => {
    const entries = getEvidenceForFormula("forecast.trend.linear");
    expect(entries.some((e) => e.id === "ols-linear-regression-forecast")).toBe(true);
  });
});

// ─── queryEvidence — no filters ───────────────────────────────────────────────

describe("queryEvidence (no filter)", () => {
  it("returns all entries when no filter given", () => {
    const r = queryEvidence();
    expect(r.entries.length).toBe(EVIDENCE_CATALOG.length);
    expect(r.totalMatched).toBe(EVIDENCE_CATALOG.length);
  });
});

// ─── queryEvidence — sourceType filter ───────────────────────────────────────

describe("queryEvidence (sourceType)", () => {
  it("filters by sourceType=methodology", () => {
    const r = queryEvidence({ sourceType: "methodology" });
    r.entries.forEach((e) => expect(e.sourceType).toBe("methodology"));
    expect(r.entries.length).toBeGreaterThan(0);
  });

  it("filters by sourceType=standard", () => {
    const r = queryEvidence({ sourceType: "standard" });
    r.entries.forEach((e) => expect(e.sourceType).toBe("standard"));
    // FOCUS is a standard
    expect(r.entries.some((e) => e.id === "focus-1.3-cost-allocation")).toBe(true);
  });

  it("filters by sourceType=framework", () => {
    const r = queryEvidence({ sourceType: "framework" });
    r.entries.forEach((e) => expect(e.sourceType).toBe("framework"));
    expect(r.entries.some((e) => e.id === "finops-framework-2026")).toBe(true);
  });

  it("returns empty for sourceType with no entries", () => {
    const r = queryEvidence({ sourceType: "regulation" });
    expect(r.entries).toHaveLength(0);
  });
});

// ─── queryEvidence — formulaKeys filter ──────────────────────────────────────

describe("queryEvidence (formulaKeys)", () => {
  it("returns entries applying to given formula key", () => {
    const r = queryEvidence({ formulaKeys: ["slo.errorBudget.allowableDowntime"] });
    expect(r.entries.length).toBeGreaterThan(0);
    r.entries.forEach((e) =>
      expect(e.appliesTo).toContain("slo.errorBudget.allowableDowntime"),
    );
  });

  it("matches any of multiple formula keys (OR semantics)", () => {
    const r = queryEvidence({ formulaKeys: ["slo.reliability.roi", "forecast.trend.linear"] });
    expect(r.entries.length).toBeGreaterThanOrEqual(2);
    r.entries.forEach((e) => {
      const hasAny = e.appliesTo.includes("slo.reliability.roi") ||
                     e.appliesTo.includes("forecast.trend.linear");
      expect(hasAny).toBe(true);
    });
  });

  it("empty formulaKeys does not filter", () => {
    const r = queryEvidence({ formulaKeys: [] });
    expect(r.entries.length).toBe(EVIDENCE_CATALOG.length);
  });
});

// ─── queryEvidence — tags filter ──────────────────────────────────────────────

describe("queryEvidence (tags)", () => {
  it("filters by single tag", () => {
    const r = queryEvidence({ tags: ["SLO"] });
    expect(r.entries.length).toBeGreaterThan(0);
    r.entries.forEach((e) =>
      expect(e.tags.map((t) => t.toLowerCase())).toContain("slo"),
    );
  });

  it("requires ALL tags (AND semantics)", () => {
    const r = queryEvidence({ tags: ["SLO", "ROI"] });
    r.entries.forEach((e) => {
      const lower = e.tags.map((t) => t.toLowerCase());
      expect(lower).toContain("slo");
      expect(lower).toContain("roi");
    });
  });

  it("tag matching is case-insensitive", () => {
    const r1 = queryEvidence({ tags: ["finops"] });
    const r2 = queryEvidence({ tags: ["FinOps"] });
    expect(r1.totalMatched).toBe(r2.totalMatched);
  });

  it("returns empty for combination that matches nothing", () => {
    const r = queryEvidence({ tags: ["SLO", "AI"] });
    expect(r.entries).toHaveLength(0);
  });
});

// ─── queryEvidence — search filter ───────────────────────────────────────────

describe("queryEvidence (search)", () => {
  it("searches in title", () => {
    const r = queryEvidence({ search: "Error Budget" });
    expect(r.entries.length).toBeGreaterThan(0);
    r.entries.forEach((e) =>
      expect(
        e.title.toLowerCase().includes("error budget") ||
        e.rationale.toLowerCase().includes("error budget") ||
        e.source.toLowerCase().includes("error budget"),
      ).toBe(true),
    );
  });

  it("search is case-insensitive", () => {
    const r1 = queryEvidence({ search: "google sre" });
    const r2 = queryEvidence({ search: "Google SRE" });
    expect(r1.totalMatched).toBe(r2.totalMatched);
  });

  it("searches in rationale", () => {
    const r = queryEvidence({ search: "decimal-safe" });
    expect(r.entries.length).toBeGreaterThan(0);
  });

  it("empty search string does not filter", () => {
    const r = queryEvidence({ search: "  " });
    expect(r.entries.length).toBe(EVIDENCE_CATALOG.length);
  });

  it("returns empty for search term with no matches", () => {
    const r = queryEvidence({ search: "xyzzy-nonexistent-term-9999" });
    expect(r.entries).toHaveLength(0);
  });
});

// ─── queryEvidence — combined filters ────────────────────────────────────────

describe("queryEvidence (combined filters)", () => {
  it("sourceType + formulaKeys combined (AND semantics)", () => {
    const r = queryEvidence({
      sourceType: "methodology",
      formulaKeys: ["slo.errorBudget.allowableDowntime"],
    });
    r.entries.forEach((e) => {
      expect(e.sourceType).toBe("methodology");
      expect(e.appliesTo).toContain("slo.errorBudget.allowableDowntime");
    });
  });

  it("query object preserved on result", () => {
    const q = { sourceType: "standard" as const, tags: ["FinOps"] };
    const r = queryEvidence(q);
    expect(r.query).toEqual(q);
  });
});
