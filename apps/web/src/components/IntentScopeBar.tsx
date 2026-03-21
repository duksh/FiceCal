// ─── IntentScopeBar ───────────────────────────────────────────────────────────
//
// Displays and controls the active Intent + Scope + Mode triple.
// Uses IntentScopeState from ui-foundation as the single source of truth.

import { useState, useEffect } from "react";
import {
  ALL_INTENTS,
  ALL_SCOPES,
  ALL_MODES,
  INTENT_LABELS,
  SCOPE_LABELS,
  MODE_LABELS,
} from "@ficecal/ui-foundation";
import type {
  IntentScopeState,
  LocalizationShell,
  Intent,
  Scope,
  Mode,
} from "@ficecal/ui-foundation";

interface Props {
  intentScope: IntentScopeState;
  i18n: LocalizationShell;
  /** Notify parent that mode changed (so existing panel routing still works). */
  onModeChange?: (mode: Mode) => void;
}

export function IntentScopeBar({ intentScope, i18n, onModeChange }: Props) {
  const [snapshot, setSnapshot] = useState(intentScope.get());

  useEffect(() => {
    return intentScope.subscribe(() => {
      const next = intentScope.get();
      setSnapshot(next);
      onModeChange?.(next.mode);
    });
  }, [intentScope, onModeChange]);

  function handleIntent(e: React.ChangeEvent<HTMLSelectElement>) {
    intentScope.setIntent(e.target.value as Intent, /* autoScope */ true);
  }

  function handleScope(e: React.ChangeEvent<HTMLSelectElement>) {
    intentScope.setScope(e.target.value as Scope);
  }

  function handleMode(e: React.ChangeEvent<HTMLSelectElement>) {
    intentScope.setMode(e.target.value as Mode);
  }

  function handleBack() {
    intentScope.back();
  }

  return (
    <nav className="intent-scope-bar" aria-label="Intent and scope controls">
      <div className="intent-scope-bar__group">
        <label htmlFor="fc-intent">{i18n.t("ui.title")} Intent</label>
        <select id="fc-intent" value={snapshot.intent} onChange={handleIntent}>
          {ALL_INTENTS.map((intent) => (
            <option key={intent} value={intent}>
              {INTENT_LABELS[intent]}
            </option>
          ))}
        </select>
      </div>

      <div className="intent-scope-bar__group">
        <label htmlFor="fc-scope">Scope</label>
        <select id="fc-scope" value={snapshot.scope} onChange={handleScope}>
          {ALL_SCOPES.map((scope) => (
            <option key={scope} value={scope}>
              {SCOPE_LABELS[scope]}
            </option>
          ))}
        </select>
      </div>

      <div className="intent-scope-bar__group">
        <label htmlFor="fc-mode">Mode</label>
        <select id="fc-mode" value={snapshot.mode} onChange={handleMode}>
          {ALL_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {MODE_LABELS[mode]}
            </option>
          ))}
        </select>
      </div>

      {intentScope.historyDepth > 0 && (
        <button
          className="intent-scope-bar__back"
          onClick={handleBack}
          aria-label={i18n.t("ui.back")}
        >
          ← {i18n.t("ui.back")}
        </button>
      )}

      {!intentScope.scopeMatchesIntent && (
        <p className="intent-scope-bar__hint" role="status">
          Suggested: {SCOPE_LABELS[intentScope.suggestedScope]}
        </p>
      )}
    </nav>
  );
}
