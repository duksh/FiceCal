// ─── useUiFoundation ──────────────────────────────────────────────────────────
//
// Bootstraps all @ficecal/ui-foundation singletons for the browser runtime.
// Returns stable references — safe to call from multiple components.

import { useMemo } from "react";
import {
  PreferenceStore,
  ThemeManager,
  IntentScopeState,
  LocalizationShell,
  MediaQuerySystemThemeAdapter,
  DEFAULT_PREFERENCES,
} from "@ficecal/ui-foundation";

// ─── Browser-compatible storage adapter ───────────────────────────────────────

const localStorageAdapter = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};

// ─── Singletons (module-level, one instance per app lifetime) ─────────────────

let _preferenceStore: PreferenceStore | null = null;
let _themeManager: ThemeManager | null = null;
let _intentScopeState: IntentScopeState | null = null;
let _localizationShell: LocalizationShell | null = null;

function getPreferenceStore(): PreferenceStore {
  if (!_preferenceStore) {
    _preferenceStore = new PreferenceStore(localStorageAdapter);
  }
  return _preferenceStore;
}

function getThemeManager(): ThemeManager {
  if (!_themeManager) {
    _themeManager = new ThemeManager(
      localStorageAdapter,
      new MediaQuerySystemThemeAdapter(),
      {
        setAttribute: (name: string, value: string) =>
          document.documentElement.setAttribute(name, value),
        setStyle: (property: string, value: string) =>
          document.documentElement.style.setProperty(property, value),
      }
    );
    _themeManager.apply(); // synchronous — no FWOT
  }
  return _themeManager;
}

function getIntentScopeState(): IntentScopeState {
  if (!_intentScopeState) {
    const prefs = getPreferenceStore().get();
    _intentScopeState = new IntentScopeState({
      intent: prefs.intent,
      scope: prefs.scope,
      mode: prefs.mode,
    });
  }
  return _intentScopeState;
}

function getLocalizationShell(): LocalizationShell {
  if (!_localizationShell) {
    const prefs = getPreferenceStore().get();
    _localizationShell = new LocalizationShell(prefs.locale);
  }
  return _localizationShell;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UiFoundation {
  preferences: PreferenceStore;
  theme: ThemeManager;
  intentScope: IntentScopeState;
  i18n: LocalizationShell;
  defaultPreferences: typeof DEFAULT_PREFERENCES;
}

/**
 * Returns stable singleton references to all ui-foundation primitives.
 * Bootstrap this once at the root component and pass down via props or context.
 */
export function useUiFoundation(): UiFoundation {
  return useMemo(
    () => ({
      preferences: getPreferenceStore(),
      theme: getThemeManager(),
      intentScope: getIntentScopeState(),
      i18n: getLocalizationShell(),
      defaultPreferences: DEFAULT_PREFERENCES,
    }),
    []
  );
}
