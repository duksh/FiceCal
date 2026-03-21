// ─── Keyboard shortcut registry ───────────────────────────────────────────────

export interface KeyboardShortcut {
  /** Unique identifier for this shortcut. */
  id: string;
  /** Human-readable description shown in help overlays. */
  description: string;
  /** Key combination, e.g. "ctrl+k", "?", "g i". Case-insensitive. */
  keys: string;
  /** Handler invoked when the shortcut fires. Return true to stop propagation. */
  handler: (event: KeyboardEvent) => boolean | void;
  /** Whether the shortcut fires when an input/textarea is focused. Default: false. */
  allowInInput?: boolean;
}

/**
 * Registry for keyboard shortcuts.
 *
 * Shortcuts are matched against KeyboardEvent instances using a normalized
 * key descriptor. The registry is framework-agnostic — wire it to the DOM
 * via a single `document.addEventListener("keydown", registry.handleKeyDown)`.
 */
export class KeyboardShortcutRegistry {
  private readonly shortcuts = new Map<string, KeyboardShortcut>();

  // ─── Registration ──────────────────────────────────────────────────────────

  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  unregister(id: string): boolean {
    return this.shortcuts.delete(id);
  }

  list(): KeyboardShortcut[] {
    return [...this.shortcuts.values()];
  }

  get size(): number { return this.shortcuts.size; }

  // ─── Event handling ────────────────────────────────────────────────────────

  /**
   * Handle a KeyboardEvent. Returns true if a shortcut was matched and fired.
   *
   * Bind as: `document.addEventListener("keydown", registry.handleKeyDown)`
   * Note: arrow function preserves `this` context.
   */
  handleKeyDown = (event: KeyboardEvent): boolean => {
    const descriptor = normalizeDescriptor(event);
    const inInput = isInputFocused(event);

    for (const shortcut of this.shortcuts.values()) {
      if (normalizeKeys(shortcut.keys) !== descriptor) continue;
      if (inInput && !shortcut.allowInInput) continue;

      const result = shortcut.handler(event);
      if (result !== false) return true;
    }
    return false;
  };
}

// ─── Focus trap ───────────────────────────────────────────────────────────────

/**
 * Focusable element selectors per WCAG 2.1.
 */
const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(", ");

/**
 * Returns all focusable elements within a container, in DOM order.
 * Browser-independent type signature — container is typed as a minimal subset.
 */
export function getFocusableElements(container: {
  querySelectorAll: (sel: string) => ArrayLike<HTMLElement>;
}): HTMLElement[] {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS));
}

/**
 * Returns the first focusable element within a container, or null.
 */
export function getFirstFocusable(container: {
  querySelectorAll: (sel: string) => ArrayLike<HTMLElement>;
}): HTMLElement | null {
  return getFocusableElements(container)[0] ?? null;
}

/**
 * Returns the last focusable element within a container, or null.
 */
export function getLastFocusable(container: {
  querySelectorAll: (sel: string) => ArrayLike<HTMLElement>;
}): HTMLElement | null {
  const els = getFocusableElements(container);
  return els[els.length - 1] ?? null;
}

// ─── WCAG accessibility helpers ───────────────────────────────────────────────

/**
 * Compute a contrast ratio between two sRGB color luminance values.
 * Implements WCAG 2.1 § 1.4.3 formula.
 * Returns a ratio ≥ 1.0.
 */
export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert an 8-bit sRGB channel value (0–255) to relative luminance contribution.
 * Per WCAG 2.1 § 1.4.3.
 */
export function sRgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Compute relative luminance of an RGB triplet (channels 0–255).
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
}

/**
 * WCAG 2.1 minimum contrast ratio thresholds.
 */
export const WCAG_CONTRAST = {
  /** AA normal text (4.5:1). */
  AA_NORMAL:  4.5,
  /** AA large text / UI components (3:1). */
  AA_LARGE:   3.0,
  /** AAA normal text (7:1). */
  AAA_NORMAL: 7.0,
  /** AAA large text (4.5:1). */
  AAA_LARGE:  4.5,
} as const;

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Normalize a KeyboardEvent to a descriptor string like "ctrl+k" or "shift+?". */
function normalizeDescriptor(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey  || event.metaKey) parts.push("ctrl");
  if (event.altKey)   parts.push("alt");
  if (event.shiftKey) parts.push("shift");
  parts.push(event.key.toLowerCase());
  return parts.join("+");
}

/** Normalize a shortcut keys string to the same descriptor format. */
function normalizeKeys(keys: string): string {
  return keys.toLowerCase().replace(/\s+/g, "").replace(/cmd|meta|win/g, "ctrl");
}

/** Returns true when the event target is an input element. */
function isInputFocused(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" ||
         target.isContentEditable;
}
