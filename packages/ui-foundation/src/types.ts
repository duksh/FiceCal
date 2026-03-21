// ─── Intent ────────────────────────────────────────────────────────────────────
// WHY the user is in FiceCal right now.

/**
 * The four analytical intents of FiceCal v2.
 * Maps to FinOps Framework 2026 audience lenses.
 */
export type Intent =
  | "viability"     // Is this workload or spend justified? Break-even, burn rate, cost risk
  | "operations"    // How is this running day-to-day? Budget adherence, health signals
  | "architecture"  // Which design or hosting choice is better? Tradeoff comparison
  | "executive";    // What demands leadership attention? KPI summary, prioritization

export const INTENT_LABELS: Record<Intent, string> = {
  viability:    "Viability",
  operations:   "Operations",
  architecture: "Architecture",
  executive:    "Executive",
};

export const INTENT_DESCRIPTIONS: Record<Intent, string> = {
  viability:    "Assess cost justification, break-even, and financial risk",
  operations:   "Monitor budget adherence, health signals, and spend trends",
  architecture: "Compare hosting choices and quantify tradeoffs",
  executive:    "Surface KPIs and prioritization signals for leadership decisions",
};

export const ALL_INTENTS: Intent[] = ["viability", "operations", "architecture", "executive"];

// ─── Scope ─────────────────────────────────────────────────────────────────────
// WHICH FinOps business question is currently active.

/**
 * FinOps Framework 2026-aligned business-question scopes.
 * Scopes are stable identifiers for telemetry, reporting, and recommendation framing.
 */
export type Scope =
  | "baseline-unit-economics"     // What does this workload fundamentally cost and why?
  | "optimization-opportunities"  // Where is waste or inefficiency present?
  | "architecture-tradeoffs"      // Which design choice produces the better outcome?
  | "executive-strategy";         // Which decisions deserve leadership attention?

export const SCOPE_LABELS: Record<Scope, string> = {
  "baseline-unit-economics":    "Baseline Economics",
  "optimization-opportunities": "Optimization",
  "architecture-tradeoffs":     "Architecture Tradeoffs",
  "executive-strategy":         "Executive Strategy",
};

export const SCOPE_DESCRIPTIONS: Record<Scope, string> = {
  "baseline-unit-economics":    "Understand what a workload or service fundamentally costs",
  "optimization-opportunities": "Identify waste, mis-sizing, and efficiency signals",
  "architecture-tradeoffs":     "Compare design or hosting choices by economic outcome",
  "executive-strategy":         "Prioritize investments and communicate risk to leadership",
};

export const ALL_SCOPES: Scope[] = [
  "baseline-unit-economics",
  "optimization-opportunities",
  "architecture-tradeoffs",
  "executive-strategy",
];

/**
 * Which scopes are primary for each intent (ordered by relevance).
 */
export const INTENT_SCOPE_AFFINITIES: Record<Intent, Scope[]> = {
  viability:    ["baseline-unit-economics", "architecture-tradeoffs"],
  operations:   ["optimization-opportunities", "baseline-unit-economics"],
  architecture: ["architecture-tradeoffs", "optimization-opportunities"],
  executive:    ["executive-strategy", "optimization-opportunities"],
};

// ─── Mode ──────────────────────────────────────────────────────────────────────
// HOW MUCH complexity the user wants exposed.

/**
 * Information density / complexity modes.
 */
export type Mode = "quick" | "operator" | "architect";

export const MODE_LABELS: Record<Mode, string> = {
  quick:     "Quick",
  operator:  "Operator",
  architect: "Architect",
};

export const MODE_DESCRIPTIONS: Record<Mode, string> = {
  quick:     "Key metrics only — no configuration required",
  operator:  "Full controls with guided defaults",
  architect: "All parameters exposed — complete analytical control",
};

export const ALL_MODES: Mode[] = ["quick", "operator", "architect"];

// ─── Theme ─────────────────────────────────────────────────────────────────────

/** User preference for color theme. */
export type ThemePreference = "light" | "dark" | "system";

/** Resolved theme applied to the document (no 'system'). */
export type ResolvedTheme = "light" | "dark";

export const ALL_THEME_PREFERENCES: ThemePreference[] = ["light", "dark", "system"];

// ─── Locale ────────────────────────────────────────────────────────────────────

/** Supported UI locales. */
export type Locale = "en" | "fr" | "zh";

export const ALL_LOCALES: Locale[] = ["en", "fr", "zh"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  zh: "中文",
};

// ─── Breakpoints ───────────────────────────────────────────────────────────────

/** Tailwind-aligned responsive breakpoint keys. */
export type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl";

/** Minimum pixel width for each breakpoint. */
export const BREAKPOINTS: Record<BreakpointKey, number> = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  "2xl": 1536,
};

// ─── Preferences shape ─────────────────────────────────────────────────────────

/** Full user preference state persisted to storage. */
export interface UserPreferences {
  theme: ThemePreference;
  locale: Locale;
  /** ISO 4217 currency code, e.g. "USD", "EUR", "MUR". */
  currency: string;
  /** FinOps billing period granularity. */
  period: "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  intent: Intent;
  scope: Scope;
  mode: Mode;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme:    "system",
  locale:   "en",
  currency: "USD",
  period:   "monthly",
  intent:   "operations",
  scope:    "baseline-unit-economics",
  mode:     "operator",
};
