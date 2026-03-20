import { describe, it, expect } from "vitest";
import { FORMULA_REGISTRY, getFormula, requireFormula } from "../src/formula-registry.js";

describe("FORMULA_REGISTRY", () => {
  it("contains at least 4 entries", () => {
    expect(FORMULA_REGISTRY.length).toBeGreaterThanOrEqual(4);
  });

  it("every entry has required fields", () => {
    for (const entry of FORMULA_REGISTRY) {
      expect(entry.id).toBeTruthy();
      expect(entry.name).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(Array.isArray(entry.inputs)).toBe(true);
      expect(entry.output).toBeTruthy();
      expect(entry.example).toBeTruthy();
    }
  });

  it("no duplicate IDs", () => {
    const ids = FORMULA_REGISTRY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getFormula", () => {
  it("returns entry for known id", () => {
    const f = getFormula("period.normalize");
    expect(f).toBeDefined();
    expect(f!.id).toBe("period.normalize");
  });

  it("returns undefined for unknown id", () => {
    expect(getFormula("does.not.exist")).toBeUndefined();
  });
});

describe("requireFormula", () => {
  it("returns entry for known id", () => {
    const f = requireFormula("currency.convert");
    expect(f.id).toBe("currency.convert");
  });

  it("throws for unknown id", () => {
    expect(() => requireFormula("unknown.formula")).toThrow();
  });
});
