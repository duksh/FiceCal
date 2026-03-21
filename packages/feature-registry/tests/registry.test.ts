import { describe, it, expect, beforeEach } from "vitest";
import { FeatureRegistry, FeatureRegistryError } from "../src/index.js";
import type { FeatureDescriptor } from "../src/index.js";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function desc(
  id: string,
  overrides: Partial<FeatureDescriptor> = {},
): FeatureDescriptor {
  return {
    id,
    version: "0.1.0",
    dependsOn: [],
    provides: [],
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("FeatureRegistry", () => {
  let registry: FeatureRegistry;

  beforeEach(() => {
    registry = new FeatureRegistry();
  });

  // ── Registration ────────────────────────────────────────────────────────

  describe("register", () => {
    it("registers a feature successfully", () => {
      registry.register(desc("economics.core"));
      expect(registry.lookup("economics.core")).toBeDefined();
    });

    it("throws DUPLICATE_ID when registering the same id twice", () => {
      registry.register(desc("economics.core"));
      expect(() => registry.register(desc("economics.core"))).toThrowError(
        FeatureRegistryError,
      );
      try {
        registry.register(desc("economics.core"));
      } catch (e) {
        expect((e as FeatureRegistryError).code).toBe("DUPLICATE_ID");
      }
    });

    it("throws INVALID_DESCRIPTOR when id is empty", () => {
      expect(() => registry.register(desc(""))).toThrowError(FeatureRegistryError);
      try {
        registry.register(desc(""));
      } catch (e) {
        expect((e as FeatureRegistryError).code).toBe("INVALID_DESCRIPTOR");
      }
    });

    it("throws INVALID_DESCRIPTOR when version is empty", () => {
      expect(() =>
        registry.register({ id: "x", version: "", dependsOn: [], provides: [] }),
      ).toThrowError(FeatureRegistryError);
    });

    it("stores registeredAt as a valid ISO timestamp", () => {
      registry.register(desc("economics.core"));
      const entry = registry.require("economics.core");
      expect(new Date(entry.registeredAt).toISOString()).toBe(entry.registeredAt);
    });

    it("preserves metadata", () => {
      registry.register(desc("economics.core", { metadata: { author: "ficecal" } }));
      expect(registry.require("economics.core").descriptor.metadata?.["author"]).toBe(
        "ficecal",
      );
    });
  });

  // ── Lookup ──────────────────────────────────────────────────────────────

  describe("lookup / require", () => {
    it("lookup returns undefined for unknown id", () => {
      expect(registry.lookup("unknown")).toBeUndefined();
    });

    it("require throws NOT_FOUND for unknown id", () => {
      try {
        registry.require("unknown");
      } catch (e) {
        expect((e as FeatureRegistryError).code).toBe("NOT_FOUND");
        expect((e as FeatureRegistryError).featureId).toBe("unknown");
      }
    });

    it("list returns all registered entries", () => {
      registry.register(desc("a"));
      registry.register(desc("b"));
      expect(registry.list()).toHaveLength(2);
    });

    it("ids returns all registered ids", () => {
      registry.register(desc("a"));
      registry.register(desc("b"));
      expect(registry.ids()).toEqual(expect.arrayContaining(["a", "b"]));
    });
  });

  // ── Capability query ─────────────────────────────────────────────────────

  describe("findByCapability", () => {
    it("returns features that provide a capability token", () => {
      registry.register(desc("a", { provides: ["cost-compute"] }));
      registry.register(desc("b", { provides: ["cost-compute", "forex"] }));
      registry.register(desc("c", { provides: ["forex"] }));

      const result = registry.findByCapability("cost-compute");
      expect(result.map((e) => e.descriptor.id)).toEqual(
        expect.arrayContaining(["a", "b"]),
      );
    });

    it("returns empty array when no feature provides the token", () => {
      registry.register(desc("a", { provides: ["forex"] }));
      expect(registry.findByCapability("cost-compute")).toHaveLength(0);
    });

    it("returns empty array on empty registry", () => {
      expect(registry.findByCapability("cost-compute")).toHaveLength(0);
    });
  });

  // ── Validation ────────────────────────────────────────────────────────────

  describe("validate", () => {
    it("returns valid: true when all dependencies are satisfied", () => {
      registry.register(desc("core", { provides: ["compute"] }));
      registry.register(desc("extension", { dependsOn: ["core"] }));
      expect(registry.validate().valid).toBe(true);
    });

    it("returns valid: false when a dependency is missing", () => {
      registry.register(desc("extension", { dependsOn: ["missing-core"] }));
      const result = registry.validate();
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.code).toBe("MISSING_DEPENDENCY");
    });

    it("returns valid: false and identifies circular dependency", () => {
      registry.register(desc("a", { dependsOn: ["b"] }));
      registry.register(desc("b", { dependsOn: ["a"] }));
      const result = registry.validate();
      expect(result.valid).toBe(false);
      expect(result.errors[0]?.code).toBe("CIRCULAR_DEPENDENCY");
    });

    it("returns valid: true on empty registry", () => {
      expect(registry.validate().valid).toBe(true);
    });

    it("returns multiple errors for multiple missing deps", () => {
      registry.register(desc("a", { dependsOn: ["missing-1"] }));
      registry.register(desc("b", { dependsOn: ["missing-2"] }));
      const result = registry.validate();
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Resolution / topological sort ─────────────────────────────────────────

  describe("resolve", () => {
    it("returns single feature with no deps", () => {
      registry.register(desc("core"));
      const resolved = registry.resolve(["core"]);
      expect(resolved).toHaveLength(1);
      expect(resolved[0]?.descriptor.id).toBe("core");
    });

    it("resolves dependency before dependent", () => {
      registry.register(desc("core"));
      registry.register(desc("extension", { dependsOn: ["core"] }));
      registry.register(desc("plugin", { dependsOn: ["extension"] }));

      const resolved = registry.resolve(["plugin"]);
      const ids = resolved.map((e) => e.descriptor.id);
      expect(ids.indexOf("core")).toBeLessThan(ids.indexOf("extension"));
      expect(ids.indexOf("extension")).toBeLessThan(ids.indexOf("plugin"));
    });

    it("resolves all features when called with no args", () => {
      registry.register(desc("a"));
      registry.register(desc("b", { dependsOn: ["a"] }));
      registry.register(desc("c", { dependsOn: ["b"] }));
      const resolved = registry.resolve();
      expect(resolved).toHaveLength(3);
    });

    it("includes transitive deps when resolving a subset", () => {
      registry.register(desc("base"));
      registry.register(desc("mid", { dependsOn: ["base"] }));
      registry.register(desc("top", { dependsOn: ["mid"] }));

      const resolved = registry.resolve(["top"]);
      const ids = resolved.map((e) => e.descriptor.id);
      expect(ids).toContain("base");
      expect(ids).toContain("mid");
      expect(ids).toContain("top");
    });

    it("handles diamond dependency (shared dep used by two features)", () => {
      // A ← B, A ← C, B ← D, C ← D
      // D depends on both B and C which both depend on A
      registry.register(desc("A"));
      registry.register(desc("B", { dependsOn: ["A"] }));
      registry.register(desc("C", { dependsOn: ["A"] }));
      registry.register(desc("D", { dependsOn: ["B", "C"] }));

      const resolved = registry.resolve(["D"]);
      const ids = resolved.map((e) => e.descriptor.id);

      // A must come before B and C; B and C before D
      expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("B"));
      expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("C"));
      expect(ids.indexOf("B")).toBeLessThan(ids.indexOf("D"));
      expect(ids.indexOf("C")).toBeLessThan(ids.indexOf("D"));

      // No duplicates
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("throws NOT_FOUND when resolving an unregistered id", () => {
      expect(() => registry.resolve(["missing"])).toThrowError(FeatureRegistryError);
      try {
        registry.resolve(["missing"]);
      } catch (e) {
        expect((e as FeatureRegistryError).code).toBe("NOT_FOUND");
      }
    });

    it("throws CIRCULAR_DEPENDENCY when resolve encounters a cycle", () => {
      registry.register(desc("x", { dependsOn: ["y"] }));
      registry.register(desc("y", { dependsOn: ["x"] }));
      expect(() => registry.resolve()).toThrowError(FeatureRegistryError);
      try {
        registry.resolve();
      } catch (e) {
        expect((e as FeatureRegistryError).code).toBe("CIRCULAR_DEPENDENCY");
      }
    });

    it("produces deterministic order across multiple calls", () => {
      registry.register(desc("c"));
      registry.register(desc("a"));
      registry.register(desc("b", { dependsOn: ["a", "c"] }));

      const first = registry.resolve().map((e) => e.descriptor.id);
      const second = registry.resolve().map((e) => e.descriptor.id);
      expect(first).toEqual(second);
    });
  });

  // ── Real-world scenario ───────────────────────────────────────────────────

  describe("FiceCal package graph", () => {
    it("resolves a realistic FiceCal package dependency graph", () => {
      registry.register(desc("schemas", { provides: ["model-pricing-schema"] }));
      registry.register(desc("core-economics", { provides: ["cost-compute", "forex"] }));
      registry.register(
        desc("integrations", {
          dependsOn: ["schemas"],
          provides: ["model-pricing-data"],
        }),
      );
      registry.register(
        desc("chart-presentation", {
          dependsOn: ["core-economics"],
          provides: ["chart-payload"],
        }),
      );
      registry.register(
        desc("health-score", {
          provides: ["health-signals"],
        }),
      );
      registry.register(
        desc("recommendation-module", {
          dependsOn: ["health-score"],
          provides: ["recommendations"],
        }),
      );
      registry.register(
        desc("ai-token-economics", {
          dependsOn: ["core-economics"],
          provides: ["ai-cost-compute"],
        }),
      );

      const result = registry.validate();
      expect(result.valid).toBe(true);

      const resolved = registry.resolve();
      const ids = resolved.map((e) => e.descriptor.id);

      // core deps before their dependents
      expect(ids.indexOf("schemas")).toBeLessThan(ids.indexOf("integrations"));
      expect(ids.indexOf("core-economics")).toBeLessThan(ids.indexOf("chart-presentation"));
      expect(ids.indexOf("core-economics")).toBeLessThan(ids.indexOf("ai-token-economics"));
      expect(ids.indexOf("health-score")).toBeLessThan(ids.indexOf("recommendation-module"));
    });
  });
});
