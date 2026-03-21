// ─── FiceCal Plugin API ────────────────────────────────────────────────────────

// ─── Types ──────────────────────────────────────────────────────────────────────
export type {
  ThemeContribution,
  BillingLineItem,
  BillingPeriodSummary,
  BillingFixtureContribution,
  BillingAdapterContribution,
  UiPanelContribution,
  EconomicsEngineContribution,
  PluginMcpTool,
  FicecalPluginContributions,
  FicecalPlugin,
  PluginErrorCode,
} from "./types.js";
export { PluginRegistrationError } from "./types.js";

// ─── ThemeRegistry ─────────────────────────────────────────────────────────────
export type { ThemeDocumentAdapter } from "./theme-registry.js";
export { ThemeRegistry, RecordingThemeAdapter } from "./theme-registry.js";

// ─── BillingRegistry ───────────────────────────────────────────────────────────
export { BillingRegistry } from "./billing-registry.js";

// ─── PluginHost ────────────────────────────────────────────────────────────────
export type { McpToolRegistrar } from "./plugin-host.js";
export { PluginHost } from "./plugin-host.js";
