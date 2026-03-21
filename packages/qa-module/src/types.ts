/**
 * A contract assertion that a computation result field must satisfy.
 */
export interface ContractAssertion {
  /** Dot-path to the field in the result object, e.g. "totalCost". */
  field: string;
  /** Human description of what is being asserted. */
  description: string;
  /** Predicate function that returns true when the assertion passes. */
  predicate: (value: unknown) => boolean;
}

/**
 * Result of running a single contract assertion.
 */
export interface AssertionResult {
  field: string;
  description: string;
  passed: boolean;
  actualValue: unknown;
}

/**
 * Result of a full contract check run.
 */
export interface ContractCheckResult {
  contractId: string;
  passed: boolean;
  assertions: AssertionResult[];
  failedCount: number;
  passedCount: number;
}

/**
 * A named contract that groups assertions for a specific engine function.
 */
export interface EngineContract {
  id: string;
  description: string;
  assertions: ContractAssertion[];
}
