import type { Period } from "@ficecal/core-economics";

// ─── SLO target ───────────────────────────────────────────────────────────────

/**
 * A Service Level Objective expressed as a percentage uptime target.
 * Canonical SLO tiers map to allowable downtime per period.
 */
export interface SloTarget {
  /** Human label, e.g. "99.9% uptime" */
  label: string;
  /** Uptime percentage as a decimal string, e.g. "99.9" */
  uptimePct: string;
}

/** Commonly referenced SLO tiers. */
export const STANDARD_SLO_TIERS: Record<string, SloTarget> = {
  "99":    { label: "99% (two nines)",    uptimePct: "99" },
  "99.5":  { label: "99.5%",              uptimePct: "99.5" },
  "99.9":  { label: "99.9% (three nines)", uptimePct: "99.9" },
  "99.95": { label: "99.95%",             uptimePct: "99.95" },
  "99.99": { label: "99.99% (four nines)", uptimePct: "99.99" },
  "99.999":{ label: "99.999% (five nines)", uptimePct: "99.999" },
};

// ─── Error budget ─────────────────────────────────────────────────────────────

export interface ErrorBudgetResult {
  /** SLO target used as input. */
  sloTarget: SloTarget;

  /** Billing period. */
  period: Period;

  /** Total minutes in the period. */
  totalMinutes: string;

  /** Allowable downtime minutes before SLO is breached. */
  allowableDowntimeMinutes: string;

  /** Allowable downtime as human-readable string, e.g. "43m 50s" */
  allowableDowntimeFormatted: string;

  /** Error budget consumed (0–100 as decimal string). */
  errorBudgetConsumedPct?: string;

  /** Remaining error budget (0–100 as decimal string). */
  errorBudgetRemainingPct?: string;

  formulasApplied: string[];
}

// ─── Downtime cost ────────────────────────────────────────────────────────────

export interface DowntimeCostInput {
  /** Duration of the outage in minutes. */
  outageMinutes: number;

  /**
   * Revenue at risk per hour of downtime (decimal string).
   * Represents lost transactions, SLA penalties, or engineer cost.
   */
  revenueAtRiskPerHour: string;

  /** Optional: engineering cost per engineer per hour (decimal string). */
  engineeringCostPerHour?: string;

  /** Number of engineers involved in incident response. */
  engineersOnCall?: number;

  /** ISO 4217 currency. */
  currency: string;
}

export interface DowntimeCostResult {
  /** Outage duration in minutes (input). */
  outageMinutes: number;

  /** Revenue impact as decimal-safe string. */
  revenueCost: string;

  /** Engineering response cost as decimal-safe string (0 if not provided). */
  engineeringCost: string;

  /** Total cost (revenue + engineering) as decimal-safe string. */
  totalCost: string;

  currency: string;
  formulasApplied: string[];
  warnings: string[];
}

// ─── Reliability ROI ──────────────────────────────────────────────────────────

export interface ReliabilityRoiInput {
  /** Cost to improve reliability from currentUptimePct to targetUptimePct (decimal string). */
  improvementCost: string;

  /** Current uptime percentage as decimal string, e.g. "99.5" */
  currentUptimePct: string;

  /** Target uptime percentage as decimal string, e.g. "99.9" */
  targetUptimePct: string;

  /** Revenue at risk per hour (decimal string). */
  revenueAtRiskPerHour: string;

  /** Billing period to project over. */
  period: Period;

  /** ISO 4217 currency. */
  currency: string;
}

export interface ReliabilityRoiResult {
  /** Downtime minutes saved per period by achieving the target SLO. */
  downtimeMinutesSaved: string;

  /** Revenue protected per period (saved downtime × revenue rate). */
  revenueProtectedPerPeriod: string;

  /** Simple ROI: revenueProtected / improvementCost (as decimal string). */
  roiMultiple: string;

  /** Payback period in number of billing periods (decimal string). */
  paybackPeriods: string;

  currency: string;
  period: Period;
  formulasApplied: string[];
  warnings: string[];
}
