// ─── Built-in FiceCal theme plugins ───────────────────────────────────────────
//
// The built-in light and dark themes are expressed as plugin contributions.
// This means core has no special-casing — themes are just plugins.
//
// Additional themes (high-contrast, brand themes) live here too.
// Community themes are separate packages that depend on @ficecal/plugin-api.
//
// Note: ThemeContribution is defined locally here because @ficecal/plugin-api
// does not yet exist in the monorepo (planned for Phase 7+). When that package
// is created, replace the local interface with the import from that package.

import { THEME_TOKENS } from "./theme.js";

// ─── ThemeContribution (local definition until @ficecal/plugin-api exists) ────

/**
 * A theme contribution registers a named theme with display metadata and
 * a map of CSS custom property tokens to apply when the theme is active.
 */
export interface ThemeContribution {
  /** Unique theme identifier (e.g. "light", "dark", "high-contrast"). */
  id: string;
  /** Human-readable display name shown in theme picker UI. */
  displayName: string;
  /** Short description of the theme's aesthetic intent. */
  description: string;
  /** Hex colour used to preview the theme in a swatch. */
  previewSwatch: string;
  /** CSS custom property map applied to the document root when active. */
  tokens: Record<string, string>;
}

/**
 * Light theme — FiceCal default light mode.
 * Tokens sourced from THEME_TOKENS.light for single source of truth.
 */
export const lightThemeContribution: ThemeContribution = {
  id: "light",
  displayName: "Light",
  description: "FiceCal default light mode. Clean white surfaces, indigo accents.",
  tokens: THEME_TOKENS.light,
  previewSwatch: "#ffffff",
};

/**
 * Dark theme — FiceCal default dark mode.
 * Tokens sourced from THEME_TOKENS.dark for single source of truth.
 */
export const darkThemeContribution: ThemeContribution = {
  id: "dark",
  displayName: "Dark",
  description: "FiceCal default dark mode. Deep navy surfaces, violet accents.",
  tokens: THEME_TOKENS.dark,
  previewSwatch: "#0a0a0f",
};

/**
 * High Contrast theme — WCAG AAA compliant.
 * Suitable for accessibility-first environments.
 */
export const highContrastThemeContribution: ThemeContribution = {
  id: "high-contrast",
  displayName: "High Contrast",
  description: "WCAG AAA accessible theme with maximum contrast ratios.",
  previewSwatch: "#000000",
  tokens: {
    "--fc-bg-base":        "#000000",
    "--fc-bg-surface":     "#0a0a0a",
    "--fc-bg-elevated":    "#1a1a1a",
    "--fc-border":         "#ffffff",
    "--fc-text-primary":   "#ffffff",
    "--fc-text-secondary": "#eeeeee",
    "--fc-text-tertiary":  "#cccccc",
    "--fc-accent":         "#ffff00",
    "--fc-accent-hover":   "#ffff88",
    "--fc-success":        "#00ff88",
    "--fc-warning":        "#ffcc00",
    "--fc-danger":         "#ff4444",
  },
};

/**
 * Ocean Blue theme — calm blue-teal palette.
 * A community-style theme example shipped with core.
 */
export const oceanBlueThemeContribution: ThemeContribution = {
  id: "ocean-blue",
  displayName: "Ocean Blue",
  description: "Calm blue-teal palette inspired by deep ocean aesthetics.",
  previewSwatch: "#0c1b33",
  tokens: {
    "--fc-bg-base":        "#0c1b33",
    "--fc-bg-surface":     "#122344",
    "--fc-bg-elevated":    "#1a2f5a",
    "--fc-border":         "#1e3a6e",
    "--fc-text-primary":   "#e8f4f8",
    "--fc-text-secondary": "#a8d4e6",
    "--fc-text-tertiary":  "#5b8fa8",
    "--fc-accent":         "#00b4d8",
    "--fc-accent-hover":   "#48cae4",
    "--fc-success":        "#2ec4b6",
    "--fc-warning":        "#f77f00",
    "--fc-danger":         "#e63946",
  },
};

/** All built-in theme contributions in registration order. */
export const BUILT_IN_THEMES: ThemeContribution[] = [
  lightThemeContribution,
  darkThemeContribution,
  highContrastThemeContribution,
  oceanBlueThemeContribution,
];
