import type { AppMode } from "../types.js";

interface Props {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const MODES: { id: AppMode; label: string; description: string }[] = [
  { id: "quick", label: "Quick", description: "Instant cost estimate" },
  { id: "operator", label: "Operator", description: "Health & recommendations" },
  { id: "architect", label: "Architect", description: "Traceability & audit" },
];

export function ModeSelector({ activeMode, onModeChange }: Props) {
  return (
    <section className="panel" aria-label="Mode selection">
      <h2>Mode</h2>
      <div className="mode-switch" role="tablist" aria-label="UX mode switcher">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={activeMode === m.id}
            className={`mode-button${activeMode === m.id ? " is-active" : ""}`}
            onClick={() => onModeChange(m.id)}
            title={m.description}
          >
            {m.label}
          </button>
        ))}
      </div>
    </section>
  );
}
