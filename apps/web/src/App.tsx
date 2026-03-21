import { useState, useEffect } from "react";
import type { SharedContext } from "./types.js";
import { useUiFoundation } from "./hooks/useUiFoundation.js";
import { SharedContextForm } from "./components/SharedContextForm.js";
import { CostEstimator } from "./components/CostEstimator.js";
import { HealthDashboard } from "./components/HealthDashboard.js";
import { ArchitectPanel } from "./components/ArchitectPanel.js";
import { ThemeToggle } from "./components/ThemeToggle.js";
import { IntentScopeBar } from "./components/IntentScopeBar.js";
import type { Mode } from "@ficecal/ui-foundation";

const DEFAULT_CONTEXT: SharedContext = {
  workspaceId: "workspace-finops-001",
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  currency: "MUR",
};

export function App() {
  const { theme, intentScope, i18n, preferences } = useUiFoundation();

  // Sync mode from IntentScopeState → local React state for panel routing.
  const [mode, setMode] = useState<Mode>(intentScope.get().mode);
  const [context, setContext] = useState<SharedContext>(DEFAULT_CONTEXT);

  // Keep currency preference in sync with context currency.
  useEffect(() => {
    const prefs = preferences.get();
    if (prefs.currency !== context.currency) {
      preferences.set("currency", context.currency as typeof prefs.currency);
    }
  }, [context.currency, preferences]);

  // Apply the initial theme on mount (no-FWOT).
  useEffect(() => {
    theme.apply();
  }, [theme]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <p className="eyebrow">{i18n.t("ui.title")} v2</p>
          <h1>{i18n.t("ui.tagline")}</h1>
          <p className="subtitle">
            Deterministic cost intelligence — decimal-precise, audit-traceable.
          </p>
        </div>
        <div className="topbar-actions">
          <div className="mode-status" aria-live="polite">
            <span className="mode-status-label">Active mode</span>
            <strong className={`mode-badge mode-badge--${mode}`}>{mode}</strong>
          </div>
          <ThemeToggle theme={theme} i18n={i18n} />
        </div>
      </header>

      <IntentScopeBar
        intentScope={intentScope}
        i18n={i18n}
        onModeChange={setMode}
      />

      <SharedContextForm context={context} onChange={setContext} />

      <main className="content-area" role="main">
        {mode === "quick" && <CostEstimator context={context} />}
        {mode === "operator" && <HealthDashboard context={context} />}
        {mode === "architect" && <ArchitectPanel context={context} />}
      </main>

      <footer className="footer">
        <p>
          {i18n.t("ui.title")} v2 · Phase 3 complete · All arithmetic via{" "}
          <code>decimal.js</code> (28dp)
        </p>
      </footer>
    </div>
  );
}
