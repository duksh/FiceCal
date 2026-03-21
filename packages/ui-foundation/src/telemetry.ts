import type { Intent, Scope, Mode, ThemePreference, Locale } from "./types.js";

// ─── Event schema ─────────────────────────────────────────────────────────────

/**
 * Discriminated union of all FiceCal v2 telemetry events.
 *
 * Naming convention: `<noun>.<verb>` in past tense.
 * All events carry a `ts` (Unix ms timestamp) and `sessionId`.
 *
 * New events must be added here before being emitted anywhere in the codebase.
 * This is the single authoritative event schema.
 */
export type TelemetryEvent =
  | IntentChangedEvent
  | ScopeChangedEvent
  | ModeChangedEvent
  | ThemeChangedEvent
  | LocaleChangedEvent
  | CalculationPerformedEvent
  | RecommendationViewedEvent
  | ScenarioLoadedEvent
  | EvidencePanelOpenedEvent
  | HealthScoreViewedEvent
  | PreferenceSavedEvent
  | ErrorBoundaryTriggeredEvent;

interface BaseEvent {
  /** Stable event name. */
  name: string;
  /** Unix millisecond timestamp. */
  ts: number;
  /** Opaque session identifier (UUID v4 or random hex). */
  sessionId: string;
}

export interface IntentChangedEvent extends BaseEvent {
  name: "intent.changed";
  from: Intent | null;
  to: Intent;
  scope: Scope;
  mode: Mode;
}

export interface ScopeChangedEvent extends BaseEvent {
  name: "scope.changed";
  from: Scope | null;
  to: Scope;
  intent: Intent;
}

export interface ModeChangedEvent extends BaseEvent {
  name: "mode.changed";
  from: Mode | null;
  to: Mode;
}

export interface ThemeChangedEvent extends BaseEvent {
  name: "theme.changed";
  from: ThemePreference | null;
  to: ThemePreference;
  resolved: "light" | "dark";
}

export interface LocaleChangedEvent extends BaseEvent {
  name: "locale.changed";
  from: Locale | null;
  to: Locale;
}

export interface CalculationPerformedEvent extends BaseEvent {
  name: "calculation.performed";
  domain: string;     // e.g. "ai.token", "reliability.error-budget"
  intent: Intent;
  scope: Scope;
  mode: Mode;
  durationMs: number;
}

export interface RecommendationViewedEvent extends BaseEvent {
  name: "recommendation.viewed";
  recommendationId: string;
  priority: string;
  audience: string;
  intent: Intent;
  scope: Scope;
}

export interface ScenarioLoadedEvent extends BaseEvent {
  name: "scenario.loaded";
  scenarioId: string;
  intent: Intent;
  scope: Scope;
}

export interface EvidencePanelOpenedEvent extends BaseEvent {
  name: "evidence.panel.opened";
  evidenceId: string;
  formulaKey: string;
}

export interface HealthScoreViewedEvent extends BaseEvent {
  name: "health.score.viewed";
  weightedScore: number;
  overallSeverity: string;
  signalCount: number;
  intent: Intent;
  scope: Scope;
}

export interface PreferenceSavedEvent extends BaseEvent {
  name: "preference.saved";
  key: string;
  value: string;
}

export interface ErrorBoundaryTriggeredEvent extends BaseEvent {
  name: "error.boundary.triggered";
  componentName: string;
  errorMessage: string;
  intent: Intent;
  scope: Scope;
}

// ─── Emitter interface ────────────────────────────────────────────────────────

export type TelemetryHandler = (event: TelemetryEvent) => void;

/**
 * Contract for telemetry emitters.
 * Implementations may send to analytics services, log to console, or buffer.
 */
export interface TelemetryEmitter {
  emit(event: TelemetryEvent): void;
  subscribe(handler: TelemetryHandler): () => void;
}

// ─── ConsoleTelemetryEmitter ──────────────────────────────────────────────────

/**
 * Default telemetry emitter — logs events to the console.
 * Used during development and as the fallback when no analytics service is wired.
 */
export class ConsoleTelemetryEmitter implements TelemetryEmitter {
  private readonly handlers = new Set<TelemetryHandler>();

  emit(event: TelemetryEvent): void {
    // Notify local subscribers first (e.g. dev overlays)
    this.handlers.forEach((h) => h(event));
    // eslint-disable-next-line no-console
    console.debug("[ficecal:telemetry]", event.name, event);
  }

  subscribe(handler: TelemetryHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

// ─── BufferedTelemetryEmitter ─────────────────────────────────────────────────

/**
 * Buffers events in memory without emitting externally.
 * Useful in tests to assert which events were fired.
 */
export class BufferedTelemetryEmitter implements TelemetryEmitter {
  private readonly buffer: TelemetryEvent[] = [];
  private readonly handlers = new Set<TelemetryHandler>();

  emit(event: TelemetryEvent): void {
    this.buffer.push(event);
    this.handlers.forEach((h) => h(event));
  }

  subscribe(handler: TelemetryHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /** All events captured since creation or last flush(). */
  events(): TelemetryEvent[] { return [...this.buffer]; }

  /** Events filtered by name. */
  eventsNamed(name: TelemetryEvent["name"]): TelemetryEvent[] {
    return this.buffer.filter((e) => e.name === name);
  }

  /** Clear the buffer. */
  flush(): void { this.buffer.length = 0; }

  get count(): number { return this.buffer.length; }
}

// ─── Event factory helpers ────────────────────────────────────────────────────

/** Generate a simple pseudo-random session ID. Not cryptographically secure. */
export function generateSessionId(): string {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

/** Create the base fields shared by all events. */
export function makeBaseEvent(sessionId: string): { ts: number; sessionId: string } {
  return { ts: Date.now(), sessionId };
}
