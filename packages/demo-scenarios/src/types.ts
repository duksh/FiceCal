/**
 * A self-contained demo scenario that exercises one or more FiceCal v2 engines.
 *
 * Scenarios serve three purposes:
 * 1. UI seeding — pre-populate forms so users can see realistic results immediately
 * 2. Documentation — each scenario tells a plausible real-world story
 * 3. Integration testing — tests assert that running the scenario inputs through
 *    the live engines produces output within the expected ranges
 */
export interface DemoScenario {
  /** Stable identifier used in URL routing and tests. */
  id: string;

  /** Short display title (≤ 60 chars). */
  title: string;

  /** One-paragraph narrative explaining the business context. */
  description: string;

  /**
   * Which engines / calculation domains this scenario exercises.
   * Mirrors the domain keys from @ficecal/economics-module.
   */
  domains: string[];

  /** Pre-set input values ready to pass directly into engine functions. */
  inputs: DemoInputSet;

  /**
   * Expected output ranges for integration assertions.
   * Each assertion describes one computed field with min/max bounds.
   * Ranges are intentionally generous to survive minor Decimal precision
   * differences or engine tuning without needing exact byte equality.
   */
  expectedRanges: ExpectedRange[];
}

export interface DemoInputSet {
  /** @ficecal/ai-token-economics input, if exercised. */
  aiCost?: Record<string, unknown>;

  /** @ficecal/sla-slo-sli-economics — error budget, if exercised. */
  errorBudget?: Record<string, unknown>;

  /** @ficecal/sla-slo-sli-economics — downtime cost, if exercised. */
  downtimeCost?: Record<string, unknown>;

  /** @ficecal/sla-slo-sli-economics — reliability ROI, if exercised. */
  reliabilityRoi?: Record<string, unknown>;

  /** @ficecal/multi-tech-normalization input, if exercised. */
  techNormalization?: Record<string, unknown>;

  /** @ficecal/budgeting-forecasting — variance, if exercised. */
  budgetVariance?: Record<string, unknown>;

  /** @ficecal/budgeting-forecasting — projection, if exercised. */
  budgetProjection?: Record<string, unknown>;

  /** @ficecal/budgeting-forecasting — trend extrapolation, if exercised. */
  trendExtrapolation?: Record<string, unknown>;

  /** @ficecal/health-score — signals, if exercised. */
  healthScore?: Record<string, unknown>;
}

export interface ExpectedRange {
  /** Human label for this assertion, e.g. "monthly error budget minutes". */
  label: string;
  /** Path to the result field, e.g. "allowableDowntimeMinutes". */
  resultField: string;
  /** Minimum numeric value (inclusive). */
  min: number;
  /** Maximum numeric value (inclusive). */
  max: number;
}
