import type { UserPreferences } from "./types.js";
import { DEFAULT_PREFERENCES } from "./types.js";

// ─── Storage adapter ──────────────────────────────────────────────────────────

/**
 * Minimal synchronous key-value storage interface.
 * Allows injection of localStorage, sessionStorage, or in-memory fakes.
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** In-memory storage adapter — used in tests and SSR contexts. */
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
}

// ─── PreferenceStore ──────────────────────────────────────────────────────────

const STORAGE_KEY = "ficecal:preferences:v1";

/**
 * Typed, observable preference store backed by an injected StorageAdapter.
 *
 * Consumers subscribe to changes via `subscribe()`. Each set operation
 * persists to storage and notifies subscribers synchronously.
 */
export class PreferenceStore {
  private state: UserPreferences;
  private readonly listeners = new Set<(prefs: UserPreferences) => void>();

  constructor(private readonly storage: StorageAdapter) {
    this.state = this.load();
  }

  // ─── Read ────────────────────────────────────────────────────────────────

  get(): UserPreferences {
    return { ...this.state };
  }

  // ─── Write ───────────────────────────────────────────────────────────────

  set<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    this.state = { ...this.state, [key]: value };
    this.persist();
    this.notify();
  }

  setAll(partial: Partial<UserPreferences>): void {
    this.state = { ...this.state, ...partial };
    this.persist();
    this.notify();
  }

  reset(): void {
    this.state = { ...DEFAULT_PREFERENCES };
    this.storage.removeItem(STORAGE_KEY);
    this.notify();
  }

  // ─── Subscription ─────────────────────────────────────────────────────────

  subscribe(listener: (prefs: UserPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private load(): UserPreferences {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PREFERENCES };
      const parsed = JSON.parse(raw) as Partial<UserPreferences>;
      // Merge with defaults so new fields added to UserPreferences are populated
      return { ...DEFAULT_PREFERENCES, ...parsed };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  private persist(): void {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage full or unavailable — continue without persistence
    }
  }

  private notify(): void {
    const snapshot = this.get();
    this.listeners.forEach((l) => l(snapshot));
  }
}
