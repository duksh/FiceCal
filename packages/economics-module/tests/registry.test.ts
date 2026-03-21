import { describe, it, expect, beforeEach } from "vitest";
import {
  EconomicsRegistry,
  EconomicsRegistryError,
  createDefaultRegistry,
  aiTokenPlugin,
  reliabilityErrorBudgetPlugin,
  reliabilityDowntimeCostPlugin,
  reliabilityRoiPlugin,
  techNormalizationPlugin,
  STANDARD_SLO_TIERS,
} from "../src/index.js";
import type { EconomicsPlugin } from "../src/index.js";

// ─── EconomicsRegistry unit ───────────────────────────────────────────────────

describe("EconomicsRegistry", () => {
  let registry: EconomicsRegistry;

  beforeEach(() => {
    registry = new EconomicsRegistry();
  });

  it("starts empty", () => {
    expect(registry.size).toBe(0);
    expect(registry.listDomains()).toEqual([]);
  });

  it("register and lookup a plugin", () => {
    const plugin: EconomicsPlugin<number, number> = {
      domain: "test.double",
      version: "1.0.0",
      description: "doubles its input",
      compute: (n) => n * 2,
    };
    registry.register(plugin);
    expect(registry.size).toBe(1);
    const found = registry.lookup<number, number>("test.double");
    expect(found).toBeDefined();
    expect(found!.compute(21)).toBe(42);
  });

  it("throws DOMAIN_ALREADY_REGISTERED on duplicate register", () => {
    const plugin: EconomicsPlugin<number, number> = {
      domain: "test.duplicate",
      version: "1.0.0",
      description: "test",
      compute: (n) => n,
    };
    registry.register(plugin);
    expect(() => registry.register(plugin)).toThrow(EconomicsRegistryError);
    try {
      registry.register(plugin);
    } catch (err) {
      expect((err as EconomicsRegistryError).code).toBe("DOMAIN_ALREADY_REGISTERED");
    }
  });

  it("unregister removes a plugin", () => {
    const plugin: EconomicsPlugin<number, number> = {
      domain: "test.remove",
      version: "1.0.0",
      description: "test",
      compute: (n) => n,
    };
    registry.register(plugin);
    expect(registry.size).toBe(1);
    const removed = registry.unregister("test.remove");
    expect(removed).toBe(true);
    expect(registry.size).toBe(0);
  });

  it("unregister on missing domain returns false", () => {
    expect(registry.unregister("does.not.exist")).toBe(false);
  });

  it("require throws DOMAIN_NOT_FOUND for unregistered domain", () => {
    expect(() => registry.require("missing.domain")).toThrow(EconomicsRegistryError);
    try {
      registry.require("missing.domain");
    } catch (err) {
      expect((err as EconomicsRegistryError).code).toBe("DOMAIN_NOT_FOUND");
    }
  });

  it("compute dispatches correctly and returns result", () => {
    const plugin: EconomicsPlugin<number, string> = {
      domain: "test.stringify",
      version: "1.0.0",
      description: "test",
      compute: (n) => `value:${n}`,
    };
    registry.register(plugin);
    const result = registry.compute<number, string>("test.stringify", 99);
    expect(result).toBe("value:99");
  });

  it("compute wraps thrown errors as COMPUTE_ERROR", () => {
    const plugin: EconomicsPlugin<number, number> = {
      domain: "test.throws",
      version: "1.0.0",
      description: "test",
      compute: () => { throw new Error("boom"); },
    };
    registry.register(plugin);
    expect(() => registry.compute("test.throws", 0)).toThrow(EconomicsRegistryError);
    try {
      registry.compute("test.throws", 0);
    } catch (err) {
      expect((err as EconomicsRegistryError).code).toBe("COMPUTE_ERROR");
    }
  });

  it("listDomains returns sorted domain keys", () => {
    const make = (domain: string): EconomicsPlugin<void, void> => ({
      domain,
      version: "1.0.0",
      description: "test",
      compute: () => undefined,
    });
    registry.register(make("z.last"));
    registry.register(make("a.first"));
    registry.register(make("m.middle"));
    expect(registry.listDomains()).toEqual(["a.first", "m.middle", "z.last"]);
  });

  it("manifest returns all domain metadata", () => {
    const plugin: EconomicsPlugin<void, void> = {
      domain: "test.manifest",
      version: "2.1.0",
      description: "manifest test plugin",
      compute: () => undefined,
    };
    registry.register(plugin);
    const mf = registry.manifest();
    expect(mf).toHaveLength(1);
    expect(mf[0]).toEqual({
      domain: "test.manifest",
      version: "2.1.0",
      description: "manifest test plugin",
    });
  });

  it("allows re-register after unregister", () => {
    const plugin: EconomicsPlugin<number, number> = {
      domain: "test.replace",
      version: "1.0.0",
      description: "v1",
      compute: (n) => n,
    };
    registry.register(plugin);
    registry.unregister("test.replace");
    const v2: EconomicsPlugin<number, number> = { ...plugin, version: "2.0.0", compute: (n) => n * 2 };
    registry.register(v2);
    expect(registry.require<number, number>("test.replace").version).toBe("2.0.0");
  });
});

// ─── createDefaultRegistry ────────────────────────────────────────────────────

describe("createDefaultRegistry", () => {
  it("registers all 5 built-in domains", () => {
    const r = createDefaultRegistry();
    expect(r.size).toBe(5);
    expect(r.listDomains()).toContain("ai.token");
    expect(r.listDomains()).toContain("reliability.error-budget");
    expect(r.listDomains()).toContain("reliability.downtime-cost");
    expect(r.listDomains()).toContain("reliability.roi");
    expect(r.listDomains()).toContain("tech.normalization");
  });

  it("each call returns an independent registry instance", () => {
    const r1 = createDefaultRegistry();
    const r2 = createDefaultRegistry();
    r1.unregister("ai.token");
    expect(r1.size).toBe(4);
    expect(r2.size).toBe(5);
  });

  it("can extend with a custom plugin after creation", () => {
    const r = createDefaultRegistry();
    const plugin: EconomicsPlugin<number, number> = {
      domain: "cloud.egress",
      version: "1.0.0",
      description: "Cloud egress cost",
      compute: (gb) => gb * 0.09,
    };
    r.register(plugin);
    expect(r.size).toBe(6);
    expect(r.compute<number, number>("cloud.egress", 100)).toBeCloseTo(9.0, 5);
  });
});

// ─── Built-in plugin integration ─────────────────────────────────────────────

describe("ai.token plugin", () => {
  it("dispatches token cost via registry", () => {
    const r = createDefaultRegistry();
    const result = r.compute("ai.token", {
      pricingUnit: "per_1m_tokens",
      inputTokens: 1000,
      outputTokens: 500,
      inputPricePerUnit: "3.00",
      outputPricePerUnit: "15.00",
      currency: "USD",
      period: "monthly",
    });
    expect(result).toBeDefined();
    expect((result as { totalCost: string }).totalCost).toBeDefined();
  });

  it("direct plugin compute matches registry dispatch", () => {
    const r = createDefaultRegistry();
    const input = {
      pricingUnit: "per_1m_tokens" as const,
      inputTokens: 500,
      outputTokens: 250,
      inputPricePerUnit: "1.00",
      outputPricePerUnit: "3.00",
      currency: "USD",
      period: "monthly" as const,
    };
    const direct = aiTokenPlugin.compute(input);
    const dispatched = r.compute("ai.token", input) as typeof direct;
    expect(direct.totalCost).toBe(dispatched.totalCost);
  });
});

describe("reliability.error-budget plugin", () => {
  it("dispatches error budget computation via registry", () => {
    const r = createDefaultRegistry();
    const result = r.compute("reliability.error-budget", {
      sloTarget: STANDARD_SLO_TIERS["99.9"]!,
      period: "monthly",
    });
    const eb = result as ReturnType<typeof reliabilityErrorBudgetPlugin.compute>;
    const mins = parseFloat(eb.allowableDowntimeMinutes);
    expect(mins).toBeGreaterThan(43);
    expect(mins).toBeLessThan(44);
  });

  it("direct plugin compute matches registry dispatch", () => {
    const r = createDefaultRegistry();
    const input = {
      sloTarget: STANDARD_SLO_TIERS["99.99"]!,
      period: "monthly" as const,
    };
    const direct = reliabilityErrorBudgetPlugin.compute(input);
    const dispatched = r.compute("reliability.error-budget", input) as typeof direct;
    expect(direct.allowableDowntimeMinutes).toBe(dispatched.allowableDowntimeMinutes);
  });
});

describe("reliability.downtime-cost plugin", () => {
  it("dispatches downtime cost via registry", () => {
    const r = createDefaultRegistry();
    const result = r.compute("reliability.downtime-cost", {
      outageMinutes: 60,
      revenueAtRiskPerHour: "10000",
      currency: "USD",
    });
    const dc = result as ReturnType<typeof reliabilityDowntimeCostPlugin.compute>;
    expect(dc.totalCost).toBe("10000.0000000000");
  });
});

describe("reliability.roi plugin", () => {
  it("dispatches reliability ROI via registry", () => {
    const r = createDefaultRegistry();
    const result = r.compute("reliability.roi", {
      improvementCost: "50000",
      currentUptimePct: "99.5",
      targetUptimePct: "99.9",
      revenueAtRiskPerHour: "10000",
      period: "monthly",
      currency: "USD",
    });
    const roi = result as ReturnType<typeof reliabilityRoiPlugin.compute>;
    expect(parseFloat(roi.downtimeMinutesSaved)).toBeGreaterThan(0);
    expect(roi.formulasApplied).toContain("slo.reliability.roi");
  });
});

describe("tech.normalization plugin", () => {
  it("dispatches tech normalization via registry", () => {
    const r = createDefaultRegistry();
    const result = r.compute("tech.normalization", {
      currency: "USD",
      items: [
        {
          id: "gpu-1",
          label: "GPU Instance",
          category: "ai-inference",
          rawCost: "100",
          currency: "USD",
          quantity: 100,
          nativeUnit: "1M tokens",
        },
      ],
    });
    const tn = result as ReturnType<typeof techNormalizationPlugin.compute>;
    expect(tn.items).toHaveLength(1);
    expect(tn.dominantCategory).toBe("ai-inference");
  });

  it("direct plugin compute matches registry dispatch", () => {
    const r = createDefaultRegistry();
    const input = {
      currency: "USD",
      items: [
        {
          id: "s3-1",
          label: "S3 Storage",
          category: "cloud-storage" as const,
          rawCost: "50",
          currency: "USD",
          quantity: 2000,
          nativeUnit: "GB",
        },
      ],
    };
    const direct = techNormalizationPlugin.compute(input);
    const dispatched = r.compute("tech.normalization", input) as typeof direct;
    expect(direct.portfolioTotal).toBe(dispatched.portfolioTotal);
  });
});

// ─── manifest ─────────────────────────────────────────────────────────────────

describe("manifest()", () => {
  it("manifest contains all built-in plugin metadata", () => {
    const r = createDefaultRegistry();
    const mf = r.manifest();
    expect(mf).toHaveLength(5);
    const domains = mf.map((m) => m.domain);
    expect(domains).toContain("ai.token");
    expect(domains).toContain("reliability.error-budget");
    expect(domains).toContain("reliability.downtime-cost");
    expect(domains).toContain("reliability.roi");
    expect(domains).toContain("tech.normalization");
    // each entry has version + description
    mf.forEach((entry) => {
      expect(entry.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(entry.description.length).toBeGreaterThan(0);
    });
  });
});
