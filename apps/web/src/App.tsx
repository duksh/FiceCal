import { useState } from "react";
import type { AppMode, SharedContext } from "./types.js";
import { SharedContextForm } from "./components/SharedContextForm.js";
import { ModeSelector } from "./components/ModeSelector.js";
import { CostEstimator } from "./components/CostEstimator.js";
import { HealthDashboard } from "./components/HealthDashboard.js";
import { ArchitectPanel } from "./components/ArchitectPanel.js";

const DEFAULT_CONTEXT: SharedContext = {
  workspaceId: "workspace-finops-001",
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  currency: "MUR",
};

export function App() {
  const [mode, setMode] = useState<AppMode>("quick");
  const [context, setContext] = useState<SharedContext>(DEFAULT_CONTEXT);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <p className="eyebrow">FiceCal v2</p>
          <h1>AI FinOps Platform</h1>
          <p className="subtitle">
            Deterministic cost intelligence — decimal-precise, audit-traceable.
          </p>
        </div>
        <div className="mode-status" aria-live="polite">
          <span className="mode-status-label">Active mode</span>
          <strong className={`mode-badge mode-badge--${mode}`}>{mode}</strong>
        </div>
      </header>

      <ModeSelector activeMode={mode} onModeChange={setMode} />

      <SharedContextForm context={context} onChange={setContext} />

      <main className="content-area" role="main">
        {mode === "quick" && <CostEstimator context={context} />}
        {mode === "operator" && <HealthDashboard context={context} />}
        {mode === "architect" && <ArchitectPanel context={context} />}
      </main>

      <footer className="footer">
        <p>
          FiceCal v2 · Phase 3 bootstrap · All arithmetic via{" "}
          <code>decimal.js</code> (28dp)
        </p>
      </footer>
    </div>
  );
}
