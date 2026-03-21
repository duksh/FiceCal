import type {
  EngineContract,
  ContractCheckResult,
  AssertionResult,
} from "./types.js";

/**
 * Run all assertions in an EngineContract against a result object.
 *
 * Uses dot-path field resolution so nested fields (e.g. "sloTarget.uptimePct")
 * can be asserted without requiring the result to be flat.
 */
export function runContractCheck(
  contract: EngineContract,
  result: unknown,
): ContractCheckResult {
  const assertions: AssertionResult[] = contract.assertions.map((assertion) => {
    const actualValue = getNestedField(result, assertion.field);
    let passed: boolean;
    try {
      passed = assertion.predicate(actualValue);
    } catch {
      passed = false;
    }
    return {
      field: assertion.field,
      description: assertion.description,
      passed,
      actualValue,
    };
  });

  const failedCount = assertions.filter((a) => !a.passed).length;
  const passedCount = assertions.filter((a) => a.passed).length;

  return {
    contractId: contract.id,
    passed: failedCount === 0,
    assertions,
    failedCount,
    passedCount,
  };
}

/**
 * Run multiple contracts and return all results.
 * Useful for a single pass that validates every engine output.
 */
export function runAllContractChecks(
  checks: Array<{ contract: EngineContract; result: unknown }>,
): ContractCheckResult[] {
  return checks.map(({ contract, result }) => runContractCheck(contract, result));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolve a dot-path field from an object.
 * e.g. getNestedField({ a: { b: 42 } }, "a.b") → 42
 */
function getNestedField(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}
