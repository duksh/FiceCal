import { Decimal, toOutputString } from "@ficecal/core-economics";
import type { Period } from "@ficecal/core-economics";
import type {
  SloTarget,
  ErrorBudgetResult,
  DowntimeCostInput,
  DowntimeCostResult,
  ReliabilityRoiInput,
  ReliabilityRoiResult,
} from "./types.js";

// ─── Period minutes ───────────────────────────────────────────────────────────

const MINUTES_IN_PERIOD: Record<Period, string> = {
  hourly:    "60",
  daily:     "1440",
  weekly:    "10080",
  monthly:   "43829.0625",   // 365.25 / 12 × 24 × 60
  quarterly: "131487.1875",  // monthly × 3
  annual:    "525948.75",    // 365.25 × 24 × 60
};

// ─── Error budget ─────────────────────────────────────────────────────────────

function formatMinutes(minutes: Decimal): string {
  const totalSecs = minutes.mul(60).toDecimalPlaces(0, Decimal.ROUND_FLOOR);
  const h = totalSecs.divToInt(3600);
  const m = totalSecs.minus(h.mul(3600)).divToInt(60);
  const s = totalSecs.minus(h.mul(3600)).minus(m.mul(60));
  const parts: string[] = [];
  if (h.greaterThan(0)) parts.push(`${h}h`);
  if (m.greaterThan(0)) parts.push(`${m}m`);
  if (s.greaterThan(0) || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

export function computeErrorBudget(
  sloTarget: SloTarget,
  period: Period,
  options?: { actualUptimePct?: string },
): ErrorBudgetResult {
  const totalMinutes = new Decimal(MINUTES_IN_PERIOD[period]);
  const downtimePct = new Decimal(100).minus(new Decimal(sloTarget.uptimePct));
  const allowableDowntimeMinutes = totalMinutes.mul(downtimePct).div(100);

  let errorBudgetConsumedPct: string | undefined;
  let errorBudgetRemainingPct: string | undefined;

  if (options?.actualUptimePct !== undefined) {
    const actualDowntimePct = new Decimal(100).minus(new Decimal(options.actualUptimePct));
    const actualDowntimeMinutes = totalMinutes.mul(actualDowntimePct).div(100);
    const rawConsumed = allowableDowntimeMinutes.isZero()
      ? new Decimal(100)
      : actualDowntimeMinutes.div(allowableDowntimeMinutes).mul(100);
    const consumed = rawConsumed.lessThan(0)
      ? new Decimal(0)
      : rawConsumed.greaterThan(100)
        ? new Decimal(100)
        : rawConsumed;
    const remaining = new Decimal(100).minus(consumed);
    errorBudgetConsumedPct = toOutputString(consumed);
    errorBudgetRemainingPct = toOutputString(remaining.lessThan(0) ? new Decimal(0) : remaining);
  }

  return {
    sloTarget,
    period,
    totalMinutes: toOutputString(totalMinutes),
    allowableDowntimeMinutes: toOutputString(allowableDowntimeMinutes),
    allowableDowntimeFormatted: formatMinutes(allowableDowntimeMinutes),
    ...(errorBudgetConsumedPct !== undefined ? { errorBudgetConsumedPct } : {}),
    ...(errorBudgetRemainingPct !== undefined ? { errorBudgetRemainingPct } : {}),
    formulasApplied: ["slo.errorBudget.allowableDowntime"],
  };
}

// ─── Downtime cost ────────────────────────────────────────────────────────────

export function computeDowntimeCost(input: DowntimeCostInput): DowntimeCostResult {
  const warnings: string[] = [];
  const outageHours = new Decimal(input.outageMinutes).div(60);
  const revenueRate = new Decimal(input.revenueAtRiskPerHour);
  const revenueCost = outageHours.mul(revenueRate);

  let engineeringCost = new Decimal(0);
  if (input.engineeringCostPerHour !== undefined && input.engineersOnCall !== undefined) {
    engineeringCost = outageHours
      .mul(new Decimal(input.engineeringCostPerHour))
      .mul(new Decimal(input.engineersOnCall));
  } else if (input.engineeringCostPerHour !== undefined || input.engineersOnCall !== undefined) {
    warnings.push(
      "Both engineeringCostPerHour and engineersOnCall are required to compute engineering cost — skipping.",
    );
  }

  const totalCost = revenueCost.add(engineeringCost);

  return {
    outageMinutes: input.outageMinutes,
    revenueCost: toOutputString(revenueCost),
    engineeringCost: toOutputString(engineeringCost),
    totalCost: toOutputString(totalCost),
    currency: input.currency,
    formulasApplied: ["slo.downtimeCost.revenue", "slo.downtimeCost.engineering"],
    warnings,
  };
}

// ─── Reliability ROI ──────────────────────────────────────────────────────────

export function computeReliabilityRoi(input: ReliabilityRoiInput): ReliabilityRoiResult {
  const warnings: string[] = [];
  const totalMinutes = new Decimal(MINUTES_IN_PERIOD[input.period]);

  const currentDowntimePct = new Decimal(100).minus(new Decimal(input.currentUptimePct));
  const targetDowntimePct = new Decimal(100).minus(new Decimal(input.targetUptimePct));

  if (targetDowntimePct.greaterThanOrEqualTo(currentDowntimePct)) {
    warnings.push(
      "targetUptimePct is not higher than currentUptimePct — no reliability improvement modelled.",
    );
  }

  const currentDowntimeMinutes = totalMinutes.mul(currentDowntimePct).div(100);
  const targetDowntimeMinutes = totalMinutes.mul(targetDowntimePct).div(100);
  const rawSaved = currentDowntimeMinutes.minus(targetDowntimeMinutes);
  const downtimeMinutesSaved = rawSaved.lessThan(0) ? new Decimal(0) : rawSaved;

  const downtimeHoursSaved = downtimeMinutesSaved.div(60);
  const revenueProtectedPerPeriod = downtimeHoursSaved.mul(new Decimal(input.revenueAtRiskPerHour));
  const improvementCost = new Decimal(input.improvementCost);

  const roiMultiple = improvementCost.isZero()
    ? new Decimal(0)
    : revenueProtectedPerPeriod.div(improvementCost);

  const paybackPeriods = revenueProtectedPerPeriod.isZero()
    ? new Decimal(0)
    : improvementCost.div(revenueProtectedPerPeriod);

  return {
    downtimeMinutesSaved: toOutputString(downtimeMinutesSaved),
    revenueProtectedPerPeriod: toOutputString(revenueProtectedPerPeriod),
    roiMultiple: toOutputString(roiMultiple),
    paybackPeriods: toOutputString(paybackPeriods),
    currency: input.currency,
    period: input.period,
    formulasApplied: ["slo.reliability.roi", "slo.reliability.payback"],
    warnings,
  };
}
