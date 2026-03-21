import { describe, it, expect } from "vitest";
import {
  PluginHost,
  ThemeRegistry,
  BillingRegistry,
  RecordingThemeAdapter,
  PluginRegistrationError,
} from "../src/index.js";
import type {
  FicecalPlugin,
  ThemeContribution,
  BillingFixtureContribution,
  BillingAdapterContribution,
  BillingPeriodSummary,
  McpToolRegistrar,
} from "../src/index.js";

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const DARK_TOKENS: Record<string, string> = {
  "--fc-bg-base": "#0a0a0f",
  "--fc-bg-surface": "#111118",
  "--fc-text-primary": "#f1f5f9",
  "--fc-accent": "#818cf8",
};

const darkTheme: ThemeContribution = {
  id: "dark",
  displayName: "Dark",
  tokens: DARK_TOKENS,
  previewSwatch: "#0a0a0f",
};

const lightTheme: ThemeContribution = {
  id: "light",
  displayName: "Light",
  tokens: { "--fc-bg-base": "#ffffff", "--fc-text-primary": "#0f172a", "--fc-accent": "#6366f1" },
  previewSwatch: "#ffffff",
};

const awsPeriodSummary: BillingPeriodSummary = {
  provider: "aws",
  accountId: "123456789012",
  billingPeriodStart: "2026-01-01",
  billingPeriodEnd: "2026-02-01",
  totalCost: 1450.32,
  currency: "USD",
  lineItems: [
    { service: "AmazonBedrock", cost: 820.5, currency: "USD", startDate: "2026-01-01", endDate: "2026-02-01" },
    { service: "AmazonS3", cost: 629.82, currency: "USD", startDate: "2026-01-01", endDate: "2026-02-01" },
  ],
};

const awsFixture: BillingFixtureContribution = {
  provider: "aws",
  version: "1.0.0",
  rawFormat: "cost-explorer",
  data: awsPeriodSummary,
};

const awsAdapter: BillingAdapterContribution = {
  provider: "aws",
  ingestMode: "deterministic",
  async load(_start, _end) { return awsPeriodSummary; },
};

function makeMcpRegistrar(): McpToolRegistrar & { registered: unknown[] } {
  const registered: unknown[] = [];
  return { register: (tool) => { registered.push(tool); }, registered };
}

function makePlugin(overrides: Partial<FicecalPlugin> = {}): FicecalPlugin {
  return {
    id: "test-plugin",
    name: "Test Plugin",
    version: "1.0.0",
    contributions: {},
    ...overrides,
  };
}

// ─── ThemeRegistry ─────────────────────────────────────────────────────────────

describe("ThemeRegistry", () => {
  it("registers a theme and retrieves it by id", () => {
    const reg = new ThemeRegistry();
    reg.register(darkTheme);
    expect(reg.get("dark")).toEqual(darkTheme);
  });

  it("lists all registered themes in registration order", () => {
    const reg = new ThemeRegistry();
    reg.register(lightTheme);
    reg.register(darkTheme);
    expect(reg.list().map((t) => t.id)).toEqual(["light", "dark"]);
  });

  it("reports correct size", () => {
    const reg = new ThemeRegistry();
    expect(reg.size).toBe(0);
    reg.register(darkTheme);
    expect(reg.size).toBe(1);
  });

  it("throws DUPLICATE_THEME when registering same id twice", () => {
    const reg = new ThemeRegistry();
    reg.register(darkTheme);
    expect(() => reg.register(darkTheme, "my-plugin")).toThrow(PluginRegistrationError);
    try {
      reg.register(darkTheme, "my-plugin");
    } catch (e) {
      expect(e).toBeInstanceOf(PluginRegistrationError);
      expect((e as PluginRegistrationError).code).toBe("DUPLICATE_THEME");
      expect((e as PluginRegistrationError).pluginId).toBe("my-plugin");
    }
  });

  it("applies theme tokens to a RecordingThemeAdapter", () => {
    const reg = new ThemeRegistry();
    reg.register(darkTheme);
    const doc = new RecordingThemeAdapter();
    reg.apply("dark", doc);
    expect(doc.attributes.get("data-theme")).toBe("dark");
    expect(doc.styles.get("--fc-bg-base")).toBe("#0a0a0f");
    expect(doc.styles.get("--fc-text-primary")).toBe("#f1f5f9");
  });

  it("throws when applying an unregistered theme id", () => {
    const reg = new ThemeRegistry();
    const doc = new RecordingThemeAdapter();
    expect(() => reg.apply("nonexistent", doc)).toThrow("not registered");
  });

  it("returns undefined for get() on missing id", () => {
    const reg = new ThemeRegistry();
    expect(reg.get("no-such-theme")).toBeUndefined();
  });
});

// ─── BillingRegistry ───────────────────────────────────────────────────────────

describe("BillingRegistry", () => {
  it("registers and retrieves a fixture", () => {
    const reg = new BillingRegistry();
    reg.registerFixture(awsFixture);
    expect(reg.getFixture("aws")).toEqual(awsFixture);
  });

  it("registers and retrieves an adapter", () => {
    const reg = new BillingRegistry();
    reg.registerAdapter(awsAdapter);
    expect(reg.getAdapter("aws")).toEqual(awsAdapter);
  });

  it("lists all fixtures", () => {
    const reg = new BillingRegistry();
    reg.registerFixture(awsFixture);
    expect(reg.listFixtures()).toHaveLength(1);
  });

  it("reports readyProviders only for providers with both fixture and adapter", () => {
    const reg = new BillingRegistry();
    reg.registerFixture(awsFixture);
    expect(reg.readyProviders).toHaveLength(0);
    reg.registerAdapter(awsAdapter);
    expect(reg.readyProviders).toContain("aws");
  });

  it("throws DUPLICATE_BILLING_FIXTURE on second registerFixture for same provider", () => {
    const reg = new BillingRegistry();
    reg.registerFixture(awsFixture, "plugin-a");
    expect(() => reg.registerFixture(awsFixture, "plugin-b")).toThrow(PluginRegistrationError);
    try {
      reg.registerFixture(awsFixture, "plugin-b");
    } catch (e) {
      expect((e as PluginRegistrationError).code).toBe("DUPLICATE_BILLING_FIXTURE");
    }
  });

  it("throws DUPLICATE_BILLING_ADAPTER on second registerAdapter for same provider", () => {
    const reg = new BillingRegistry();
    reg.registerAdapter(awsAdapter, "plugin-a");
    expect(() => reg.registerAdapter(awsAdapter, "plugin-b")).toThrow(PluginRegistrationError);
  });

  it("returns undefined for missing fixture/adapter", () => {
    const reg = new BillingRegistry();
    expect(reg.getFixture("gcp")).toBeUndefined();
    expect(reg.getAdapter("azure")).toBeUndefined();
  });
});

// ─── PluginHost ────────────────────────────────────────────────────────────────

describe("PluginHost", () => {
  it("registers a plugin and tracks it", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar);
    const plugin = makePlugin();
    host.register(plugin);
    expect(host.pluginCount).toBe(1);
    expect(host.getPlugin("test-plugin")).toEqual(plugin);
  });

  it("lists all registered plugins", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar);
    host.register(makePlugin({ id: "plugin-a" }));
    host.register(makePlugin({ id: "plugin-b" }));
    expect(host.listPlugins()).toHaveLength(2);
  });

  it("throws DUPLICATE_PLUGIN on double registration", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar);
    const plugin = makePlugin();
    host.register(plugin);
    expect(() => host.register(plugin)).toThrow(PluginRegistrationError);
    try {
      host.register(plugin);
    } catch (e) {
      expect((e as PluginRegistrationError).code).toBe("DUPLICATE_PLUGIN");
    }
  });

  it("throws UNMET_REQUIREMENTS when feature flag is missing", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar, []);
    const plugin = makePlugin({ requires: ["billing.live"] });
    expect(() => host.register(plugin)).toThrow(PluginRegistrationError);
    try {
      host.register(plugin);
    } catch (e) {
      expect((e as PluginRegistrationError).code).toBe("UNMET_REQUIREMENTS");
    }
  });

  it("allows registration when required feature flags are active", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar, ["billing.live"]);
    const plugin = makePlugin({ requires: ["billing.live"] });
    expect(() => host.register(plugin)).not.toThrow();
  });

  it("routes theme contributions to ThemeRegistry", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar);
    host.register(makePlugin({ contributions: { themes: [darkTheme, lightTheme] } }));
    expect(host.themes.size).toBe(2);
    expect(host.themes.get("dark")).toEqual(darkTheme);
  });

  it("routes mcpTools contributions to McpToolRegistrar", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar);
    const tool = {
      id: "test.tool",
      name: "Test Tool",
      description: "desc",
      namespace: "test",
      stability: "stable" as const,
      inputSchema: { type: "object" as const, properties: {}, required: [] },
      handler: async () => ({ output: null, toolId: "test.tool", executedAt: "", requestId: "", warnings: [], appliedIds: [] }),
    };
    host.register(makePlugin({ contributions: { mcpTools: [tool] } }));
    expect(registrar.registered).toHaveLength(1);
  });

  it("routes billingFixtures and billingAdapters to BillingRegistry", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar);
    host.register(makePlugin({
      contributions: {
        billingFixtures: [awsFixture],
        billingAdapters: [awsAdapter],
      },
    }));
    expect(host.billing.readyProviders).toContain("aws");
  });

  it("returns undefined for getPlugin with unknown id", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar);
    expect(host.getPlugin("nonexistent")).toBeUndefined();
  });

  it("starts with zero plugins", () => {
    const registrar = makeMcpRegistrar();
    const host = new PluginHost(registrar);
    expect(host.pluginCount).toBe(0);
    expect(host.listPlugins()).toHaveLength(0);
  });
});

// ─── PluginRegistrationError ──────────────────────────────────────────────────

describe("PluginRegistrationError", () => {
  it("has correct name, code, pluginId, and message", () => {
    const err = new PluginRegistrationError("DUPLICATE_PLUGIN", "Plugin already exists", "my-plugin");
    expect(err.name).toBe("PluginRegistrationError");
    expect(err.code).toBe("DUPLICATE_PLUGIN");
    expect(err.pluginId).toBe("my-plugin");
    expect(err.message).toBe("Plugin already exists");
    expect(err).toBeInstanceOf(Error);
  });
});
