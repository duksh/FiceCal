export type {
  DemoScenario,
  DemoInputSet,
  ExpectedRange,
} from "./types.js";

export { DEMO_SCENARIOS } from "./scenarios.js";

import { DEMO_SCENARIOS } from "./scenarios.js";
import type { DemoScenario } from "./types.js";

/**
 * Look up a single scenario by its stable id.
 * Returns undefined if not found.
 */
export function getScenarioById(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find((s) => s.id === id);
}

/**
 * Return all scenarios that exercise a given domain.
 */
export function getScenariosByDomain(domain: string): DemoScenario[] {
  return DEMO_SCENARIOS.filter((s) => s.domains.includes(domain));
}
