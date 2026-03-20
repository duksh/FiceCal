import { z } from "zod";

export const PeriodSchema = z.enum([
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "annual",
]);
export type Period = z.infer<typeof PeriodSchema>;

export const EconomicsInputSchema = z.object({
  /** Decimal-safe monetary amount as a string */
  amount: z.string().min(1),
  /** ISO 4217 currency code of the input amount */
  currency: z.string().length(3).toUpperCase(),
  /** Billing period the amount represents */
  period: PeriodSchema,
  /** Target period for normalization. Defaults to "monthly" if omitted */
  targetPeriod: PeriodSchema.optional(),
  /** Target ISO 4217 currency for conversion. If omitted, no conversion is applied */
  targetCurrency: z.string().length(3).toUpperCase().optional(),
  /** Usage quantity for unit-cost derivation. Optional */
  usageQuantity: z.string().optional(),
  /** Usage unit label e.g. "API calls", "GB", "tokens" */
  usageUnit: z.string().optional(),
});
export type EconomicsInput = z.infer<typeof EconomicsInputSchema>;

export const EconomicsOutputSchema = z.object({
  /** Normalized amount in targetPeriod and targetCurrency */
  amount: z.string(),
  /** Currency of the output amount */
  currency: z.string(),
  /** Period of the output amount */
  period: z.string(),
  /** Original input amount, unchanged */
  inputAmount: z.string(),
  /** Original input currency */
  inputCurrency: z.string(),
  /** Original input period */
  inputPeriod: z.string(),
  /** Cost per usage unit (if usageQuantity was provided) */
  costPerUnit: z.string().optional(),
  /** Usage unit label (if provided) */
  usageUnit: z.string().optional(),
  /** Formula IDs applied in order of execution */
  formulasApplied: z.array(z.string()),
  /** ISO timestamp of computation */
  computedAt: z.string(),
  /** Warnings e.g. stale forex rates */
  warnings: z.array(z.string()),
});
export type EconomicsOutput = z.infer<typeof EconomicsOutputSchema>;
