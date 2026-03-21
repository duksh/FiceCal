// ─── ScenarioBar ──────────────────────────────────────────────────────────────
//
// Preset scenario loader buttons from @ficecal/demo-scenarios.
// Clicking a preset populates the CostEstimator and HealthDashboard inputs.

import { getScenariosByDomain, type DemoScenario } from "@ficecal/demo-scenarios";

export interface ScenarioPreset {
  label: string;
  scenario: DemoScenario;
}

interface Props {
  onLoad: (scenario: DemoScenario) => void;
  activeId?: string;
}

// Surface only the scenarios relevant to the browser runtime
const AI_SCENARIOS = getScenariosByDomain("ai.token");
const RELIABILITY_SCENARIOS = getScenariosByDomain("reliability.error-budget");
const BUDGET_SCENARIOS = getScenariosByDomain("budgeting");

const ALL_PRESETS: DemoScenario[] = [
  ...AI_SCENARIOS,
  ...RELIABILITY_SCENARIOS,
  ...BUDGET_SCENARIOS,
  ...getScenariosByDomain("tech.normalization"),
];

export function ScenarioBar({ onLoad, activeId }: Props) {
  if (ALL_PRESETS.length === 0) return null;

  return (
    <div className="scenario-bar" aria-label="Load preset scenario">
      <span className="scenario-bar-label">Presets</span>
      <div className="scenario-bar-buttons">
        {ALL_PRESETS.map((s) => (
          <button
            key={s.id}
            className={`scenario-btn${activeId === s.id ? " is-active" : ""}`}
            onClick={() => onLoad(s)}
            title={s.description}
            aria-pressed={activeId === s.id}
          >
            {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}
