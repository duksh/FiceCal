import type { Intent, Scope, Mode } from "./types.js";
import {
  DEFAULT_PREFERENCES,
  ALL_INTENTS,
  ALL_SCOPES,
  ALL_MODES,
  INTENT_SCOPE_AFFINITIES,
} from "./types.js";

// ─── State snapshot ───────────────────────────────────────────────────────────

export interface IntentScopeSnapshot {
  intent: Intent;
  scope: Scope;
  mode: Mode;
}

// ─── Deep-link serialization ──────────────────────────────────────────────────

/**
 * Serialize state to a URL-safe query-param string fragment.
 * Format: `intent=operations&scope=baseline-unit-economics&mode=operator`
 */
export function serializeState(state: IntentScopeSnapshot): string {
  const params = new URLSearchParams({
    intent: state.intent,
    scope:  state.scope,
    mode:   state.mode,
  });
  return params.toString();
}

/**
 * Parse a query-param string back into a partial snapshot.
 * Unknown or missing values fall back to defaults.
 */
export function deserializeState(queryString: string): IntentScopeSnapshot {
  const params = new URLSearchParams(queryString);
  const intent = params.get("intent");
  const scope  = params.get("scope");
  const mode   = params.get("mode");

  return {
    intent: ALL_INTENTS.includes(intent as Intent) ? (intent as Intent) : DEFAULT_PREFERENCES.intent,
    scope:  ALL_SCOPES.includes(scope as Scope) ? (scope as Scope) : DEFAULT_PREFERENCES.scope,
    mode:   ALL_MODES.includes(mode as Mode) ? (mode as Mode) : DEFAULT_PREFERENCES.mode,
  };
}

// ─── IntentScopeState ─────────────────────────────────────────────────────────

/**
 * Pure state machine for intent/scope/mode navigation.
 *
 * Maintains a history stack to support back-navigation.
 * All transitions are synchronous; state is immutable between transitions.
 * Subscribers are notified after every state change.
 */
export class IntentScopeState {
  private readonly history: IntentScopeSnapshot[] = [];
  private current: IntentScopeSnapshot;
  private readonly listeners = new Set<(state: IntentScopeSnapshot) => void>();

  constructor(initial?: Partial<IntentScopeSnapshot>) {
    this.current = {
      intent: initial?.intent ?? DEFAULT_PREFERENCES.intent,
      scope:  initial?.scope  ?? DEFAULT_PREFERENCES.scope,
      mode:   initial?.mode   ?? DEFAULT_PREFERENCES.mode,
    };
  }

  // ─── Read ────────────────────────────────────────────────────────────────

  get(): IntentScopeSnapshot {
    return { ...this.current };
  }

  get intent(): Intent { return this.current.intent; }
  get scope():  Scope  { return this.current.scope; }
  get mode():   Mode   { return this.current.mode; }

  /** Suggested primary scope for the current intent (first affinity). */
  get suggestedScope(): Scope {
    return INTENT_SCOPE_AFFINITIES[this.current.intent][0]!;
  }

  /** Whether the active scope is a natural fit for the active intent. */
  get scopeMatchesIntent(): boolean {
    return INTENT_SCOPE_AFFINITIES[this.current.intent].includes(this.current.scope);
  }

  /** Number of states available to go back through. */
  get historyDepth(): number { return this.history.length; }

  // ─── Transitions ─────────────────────────────────────────────────────────

  setIntent(intent: Intent, autoScope = true): void {
    this.push();
    const scope = autoScope
      ? (INTENT_SCOPE_AFFINITIES[intent][0] ?? this.current.scope)
      : this.current.scope;
    this.current = { ...this.current, intent, scope };
    this.notify();
  }

  setScope(scope: Scope): void {
    this.push();
    this.current = { ...this.current, scope };
    this.notify();
  }

  setMode(mode: Mode): void {
    this.push();
    this.current = { ...this.current, mode };
    this.notify();
  }

  setAll(snapshot: Partial<IntentScopeSnapshot>): void {
    this.push();
    this.current = { ...this.current, ...snapshot };
    this.notify();
  }

  /** Navigate back one step. Returns false if no history. */
  back(): boolean {
    const prev = this.history.pop();
    if (!prev) return false;
    this.current = prev;
    this.notify();
    return true;
  }

  /** Reset to a given state, clearing history. */
  reset(state?: Partial<IntentScopeSnapshot>): void {
    this.history.length = 0;
    this.current = {
      intent: state?.intent ?? DEFAULT_PREFERENCES.intent,
      scope:  state?.scope  ?? DEFAULT_PREFERENCES.scope,
      mode:   state?.mode   ?? DEFAULT_PREFERENCES.mode,
    };
    this.notify();
  }

  // ─── Deep-link ───────────────────────────────────────────────────────────

  /** Serialize current state for use in a URL query string. */
  toQueryString(): string {
    return serializeState(this.current);
  }

  /** Apply a deserialized state from a URL query string (clears history). */
  fromQueryString(queryString: string): void {
    const parsed = deserializeState(queryString);
    this.reset(parsed);
  }

  // ─── Subscription ─────────────────────────────────────────────────────────

  subscribe(listener: (state: IntentScopeSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private push(): void {
    this.history.push({ ...this.current });
    // Cap history at 50 entries to avoid unbounded growth
    if (this.history.length > 50) this.history.shift();
  }

  private notify(): void {
    const snapshot = this.get();
    this.listeners.forEach((l) => l(snapshot));
  }
}
