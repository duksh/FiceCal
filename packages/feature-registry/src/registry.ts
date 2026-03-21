import type {
  FeatureDescriptor,
  FeatureRegistryEntry,
  RegistryValidationResult,
} from "./types.js";
import { FeatureRegistryError } from "./types.js";

/**
 * FiceCal feature/plugin registry.
 *
 * Lifecycle:
 * 1. `register(descriptor)` — add a feature (throws on duplicate id)
 * 2. `validate()` — check all declared dependencies are satisfied
 * 3. `resolve(ids?)` — return entries in dependency-safe topological order
 * 4. `lookup(id)` / `require(id)` — point lookups
 * 5. `findByCapability(token)` — capability-based discovery
 */
export class FeatureRegistry {
  private readonly entries = new Map<string, FeatureRegistryEntry>();

  // ── Registration ──────────────────────────────────────────────────────────

  /**
   * Register a feature descriptor.
   * @throws {FeatureRegistryError} DUPLICATE_ID if the id is already registered.
   * @throws {FeatureRegistryError} INVALID_DESCRIPTOR if id or version is empty.
   */
  register(descriptor: FeatureDescriptor): void {
    if (!descriptor.id || descriptor.id.trim() === "") {
      throw new FeatureRegistryError(
        "Feature descriptor must have a non-empty id",
        "INVALID_DESCRIPTOR",
      );
    }
    if (!descriptor.version || descriptor.version.trim() === "") {
      throw new FeatureRegistryError(
        `Feature '${descriptor.id}' must have a non-empty version`,
        "INVALID_DESCRIPTOR",
        descriptor.id,
      );
    }
    if (this.entries.has(descriptor.id)) {
      throw new FeatureRegistryError(
        `Feature '${descriptor.id}' is already registered`,
        "DUPLICATE_ID",
        descriptor.id,
      );
    }

    this.entries.set(descriptor.id, {
      descriptor,
      registeredAt: new Date().toISOString(),
    });
  }

  // ── Lookup ────────────────────────────────────────────────────────────────

  /** Returns the entry or `undefined` if not found. */
  lookup(id: string): FeatureRegistryEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Returns the entry.
   * @throws {FeatureRegistryError} NOT_FOUND if the id is not registered.
   */
  require(id: string): FeatureRegistryEntry {
    const entry = this.entries.get(id);
    if (entry === undefined) {
      throw new FeatureRegistryError(
        `Feature '${id}' is not registered`,
        "NOT_FOUND",
        id,
      );
    }
    return entry;
  }

  /** Returns all registered entries (insertion order, not resolved order). */
  list(): FeatureRegistryEntry[] {
    return [...this.entries.values()];
  }

  /** Returns all ids currently registered. */
  ids(): string[] {
    return [...this.entries.keys()];
  }

  // ── Capability query ──────────────────────────────────────────────────────

  /**
   * Returns all entries that expose a given capability token.
   * Example: `registry.findByCapability("cost-compute")`
   */
  findByCapability(token: string): FeatureRegistryEntry[] {
    return [...this.entries.values()].filter((e) =>
      e.descriptor.provides.includes(token),
    );
  }

  // ── Validation ────────────────────────────────────────────────────────────

  /**
   * Validates that all declared dependencies are registered and
   * that there are no circular dependency chains.
   */
  validate(): RegistryValidationResult {
    const errors: RegistryValidationResult["errors"] = [];

    for (const entry of this.entries.values()) {
      const { id, dependsOn } = entry.descriptor;

      // Check all dependencies are registered
      for (const dep of dependsOn) {
        if (!this.entries.has(dep)) {
          errors.push({
            featureId: id,
            message: `Declared dependency '${dep}' is not registered`,
            code: "MISSING_DEPENDENCY",
          });
        }
      }
    }

    // Check for circular dependencies (only if no missing deps)
    if (errors.length === 0) {
      try {
        this._topologicalSort([...this.entries.keys()]);
      } catch (e) {
        if (e instanceof FeatureRegistryError && e.code === "CIRCULAR_DEPENDENCY") {
          errors.push({
            featureId: e.featureId ?? "unknown",
            message: e.message,
            code: "CIRCULAR_DEPENDENCY",
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ── Resolution ────────────────────────────────────────────────────────────

  /**
   * Returns entries in dependency-safe topological order.
   *
   * If `ids` is provided, only those features (and their transitive
   * dependencies) are included. Otherwise all registered features are resolved.
   *
   * @throws {FeatureRegistryError} NOT_FOUND — if a requested id is not registered
   * @throws {FeatureRegistryError} MISSING_DEPENDENCY — if a dependency is absent
   * @throws {FeatureRegistryError} CIRCULAR_DEPENDENCY — if a cycle is detected
   */
  resolve(ids?: string[]): FeatureRegistryEntry[] {
    const rootIds = ids ?? [...this.entries.keys()];

    // Validate requested ids exist
    for (const id of rootIds) {
      if (!this.entries.has(id)) {
        throw new FeatureRegistryError(
          `Cannot resolve: feature '${id}' is not registered`,
          "NOT_FOUND",
          id,
        );
      }
    }

    const sorted = this._topologicalSort(rootIds);
    return sorted.map((id) => this.entries.get(id)!);
  }

  // ── Internal: Kahn's topological sort ────────────────────────────────────

  private _topologicalSort(rootIds: string[]): string[] {
    // Expand to full transitive closure
    const visited = new Set<string>();
    const toVisit = [...rootIds];

    while (toVisit.length > 0) {
      const id = toVisit.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);

      const entry = this.entries.get(id);
      if (!entry) {
        throw new FeatureRegistryError(
          `Dependency '${id}' is not registered`,
          "MISSING_DEPENDENCY",
          id,
        );
      }
      for (const dep of entry.descriptor.dependsOn) {
        if (!visited.has(dep)) toVisit.push(dep);
      }
    }

    // Kahn's algorithm on the subgraph
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>(); // id → dependents

    for (const id of visited) {
      if (!inDegree.has(id)) inDegree.set(id, 0);
      if (!adjList.has(id)) adjList.set(id, []);
    }

    for (const id of visited) {
      const entry = this.entries.get(id)!;
      for (const dep of entry.descriptor.dependsOn) {
        if (!visited.has(dep)) continue;
        adjList.get(dep)!.push(id);
        inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id);
    }

    const result: string[] = [];
    while (queue.length > 0) {
      // Sort for deterministic output
      queue.sort();
      const id = queue.shift()!;
      result.push(id);

      for (const dependent of adjList.get(id) ?? []) {
        const newDegree = (inDegree.get(dependent) ?? 0) - 1;
        inDegree.set(dependent, newDegree);
        if (newDegree === 0) queue.push(dependent);
      }
    }

    if (result.length !== visited.size) {
      // There's a cycle — find which nodes weren't processed
      const remaining = [...visited].filter((id) => !result.includes(id));
      throw new FeatureRegistryError(
        `Circular dependency detected among: ${remaining.join(", ")}`,
        "CIRCULAR_DEPENDENCY",
        remaining[0],
      );
    }

    return result;
  }
}
