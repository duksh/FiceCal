import { describe, it, expect, beforeEach } from "vitest";
import { McpToolRegistry } from "../src/tool-registry.js";
import { FeatureRegistryError } from "@ficecal/feature-registry";
import { costEstimateTool, healthScoreQueryTool, periodNormalizeTool } from "../src/index.js";

describe("McpToolRegistry", () => {
  let registry: McpToolRegistry;

  beforeEach(() => {
    registry = new McpToolRegistry();
  });

  // ── Registration ────────────────────────────────────────────────────────

  describe("register", () => {
    it("registers a tool successfully", () => {
      registry.register(costEstimateTool);
      expect(registry.lookup(costEstimateTool.id)).toBeDefined();
    });

    it("throws DUPLICATE_ID when registering same tool twice", () => {
      registry.register(costEstimateTool);
      expect(() => registry.register(costEstimateTool)).toThrowError(FeatureRegistryError);
      try {
        registry.register(costEstimateTool);
      } catch (e) {
        expect((e as FeatureRegistryError).code).toBe("DUPLICATE_ID");
      }
    });

    it("registers all three built-in tools without error", () => {
      registry.register(costEstimateTool);
      registry.register(healthScoreQueryTool);
      registry.register(periodNormalizeTool);
      expect(registry.list()).toHaveLength(3);
    });
  });

  // ── Lookup ──────────────────────────────────────────────────────────────

  describe("lookup / require", () => {
    it("lookup returns undefined for unknown id", () => {
      expect(registry.lookup("unknown.tool")).toBeUndefined();
    });

    it("require throws NOT_FOUND for unknown id", () => {
      try {
        registry.require("unknown.tool");
      } catch (e) {
        expect((e as FeatureRegistryError).code).toBe("NOT_FOUND");
      }
    });

    it("require returns the tool descriptor", () => {
      registry.register(costEstimateTool);
      const tool = registry.require(costEstimateTool.id);
      expect(tool.id).toBe(costEstimateTool.id);
      expect(tool.namespace).toBe("economics");
    });
  });

  // ── Namespace queries ────────────────────────────────────────────────────

  describe("listByNamespace", () => {
    it("returns tools in the economics namespace", () => {
      registry.register(costEstimateTool);
      registry.register(healthScoreQueryTool);
      registry.register(periodNormalizeTool);

      const econ = registry.listByNamespace("economics");
      expect(econ.map((t) => t.id)).toContain(costEstimateTool.id);
      expect(econ.map((t) => t.id)).toContain(periodNormalizeTool.id);
      expect(econ.map((t) => t.id)).not.toContain(healthScoreQueryTool.id);
    });

    it("returns tools in the health namespace", () => {
      registry.register(healthScoreQueryTool);
      const health = registry.listByNamespace("health");
      expect(health).toHaveLength(1);
      expect(health[0]?.id).toBe(healthScoreQueryTool.id);
    });

    it("returns empty array for unknown namespace", () => {
      expect(registry.listByNamespace("billing")).toHaveLength(0);
    });
  });

  describe("namespaces", () => {
    it("returns all unique namespaces", () => {
      registry.register(costEstimateTool);
      registry.register(healthScoreQueryTool);
      registry.register(periodNormalizeTool);

      const ns = registry.namespaces();
      expect(ns).toContain("economics");
      expect(ns).toContain("health");
    });

    it("returns empty array on empty registry", () => {
      expect(registry.namespaces()).toHaveLength(0);
    });
  });

  // ── Capabilities manifest ────────────────────────────────────────────────

  describe("getCapabilities", () => {
    it("returns a valid capabilities manifest", () => {
      registry.register(costEstimateTool);
      registry.register(healthScoreQueryTool);
      registry.register(periodNormalizeTool);

      const caps = registry.getCapabilities();
      expect(caps.mcpVersion).toBe("2.0");
      expect(caps.toolNamespaces.length).toBeGreaterThan(0);
    });

    it("includes economics namespace with both tools", () => {
      registry.register(costEstimateTool);
      registry.register(periodNormalizeTool);

      const caps = registry.getCapabilities();
      const econNs = caps.toolNamespaces.find((ns) => ns.namespace === "economics");
      expect(econNs).toBeDefined();
      expect(econNs!.tools).toContain(costEstimateTool.id);
      expect(econNs!.tools).toContain(periodNormalizeTool.id);
    });

    it("includes health namespace", () => {
      registry.register(healthScoreQueryTool);
      const caps = registry.getCapabilities();
      const healthNs = caps.toolNamespaces.find((ns) => ns.namespace === "health");
      expect(healthNs).toBeDefined();
    });

    it("marks stable tools as stable in capabilities", () => {
      registry.register(costEstimateTool);
      const caps = registry.getCapabilities();
      const econNs = caps.toolNamespaces.find((ns) => ns.namespace === "economics");
      expect(econNs!.stability).toBe("stable");
    });

    it("includes ficecal feature flag", () => {
      const caps = registry.getCapabilities();
      expect(caps.featureFlags).toContain("ficecal_economics_tools");
    });

    it("returns empty toolNamespaces when registry is empty", () => {
      const caps = registry.getCapabilities();
      expect(caps.toolNamespaces).toHaveLength(0);
    });
  });
});
