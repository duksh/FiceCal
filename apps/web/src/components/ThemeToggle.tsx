// ─── ThemeToggle ──────────────────────────────────────────────────────────────
//
// Cycles through light → dark → system using ThemeManager.toggle().
// Subscribes to theme changes and re-renders only when the preference changes.

import { useState, useEffect } from "react";
import type { ThemeManager, LocalizationShell } from "@ficecal/ui-foundation";

interface Props {
  theme: ThemeManager;
  i18n: LocalizationShell;
}

const THEME_ICONS: Record<string, string> = {
  light: "☀️",
  dark: "🌙",
  system: "💻",
};

export function ThemeToggle({ theme, i18n }: Props) {
  const [pref, setPref] = useState(theme.getPreference());
  const [resolved, setResolved] = useState(theme.getResolved());

  useEffect(() => {
    return theme.subscribe(() => {
      setPref(theme.getPreference());
      setResolved(theme.getResolved());
      theme.apply();
    });
  }, [theme]);

  const label =
    pref === "light"
      ? i18n.t("ui.theme.light")
      : pref === "dark"
      ? i18n.t("ui.theme.dark")
      : i18n.t("ui.theme.system");

  return (
    <button
      className="theme-toggle"
      onClick={() => theme.toggle()}
      aria-label={`Theme: ${label} (${resolved})`}
      title={`Theme: ${label}`}
    >
      <span aria-hidden="true">{THEME_ICONS[pref]}</span>
      <span className="theme-toggle-label">{label}</span>
    </button>
  );
}
