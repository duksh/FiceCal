import { Decimal, toOutputString } from "./precision.js";
import { normalizePeriod } from "./period.js";
import type { ForexRateProvider } from "./forex/types.js";
import { EconomicsInputSchema, type EconomicsInput, type EconomicsOutput } from "./types.js";

const STALE_FOREX_DAYS = 3;

export type EngineOptions = {
  forex?: ForexRateProvider;
};

export async function computeEconomics(
  rawInput: unknown,
  options: EngineOptions = {}
): Promise<EconomicsOutput> {
  const input: EconomicsInput = EconomicsInputSchema.parse(rawInput);
  const computedAt = new Date().toISOString();
  const formulasApplied: string[] = [];
  const warnings: string[] = [];

  const targetPeriod = input.targetPeriod ?? "monthly";
  const targetCurrency = input.targetCurrency?.toUpperCase() ?? input.currency.toUpperCase();
  const sourceCurrency = input.currency.toUpperCase();

  // Step 1: period normalization
  let amount: string;
  if (input.period !== targetPeriod) {
    amount = normalizePeriod(input.amount, input.period, targetPeriod);
    formulasApplied.push("period.normalize");
  } else {
    amount = input.amount;
  }

  // Step 2: currency conversion
  let outCurrency = sourceCurrency;
  if (targetCurrency !== sourceCurrency) {
    if (!options.forex) {
      warnings.push(
        `targetCurrency "${targetCurrency}" requested but no ForexRateProvider was supplied; amount remains in ${sourceCurrency}`
      );
    } else {
      const rates = await options.forex.getRates(sourceCurrency);
      const age = options.forex.getAgeInDays();
      if (age !== null && age > STALE_FOREX_DAYS) {
        warnings.push(
          `stale-forex: exchange rates are ${age} day(s) old (threshold: ${STALE_FOREX_DAYS}); conversion may be inaccurate`
        );
      }
      const rateStr = rates.rates[targetCurrency];
      if (!rateStr) {
        warnings.push(
          `No exchange rate found for ${sourceCurrency}→${targetCurrency}; amount remains in ${sourceCurrency}`
        );
      } else {
        amount = toOutputString(new Decimal(amount).mul(new Decimal(rateStr)));
        outCurrency = targetCurrency;
        formulasApplied.push("currency.convert");
      }
    }
  }

  // Step 3: cost per unit (optional)
  let costPerUnit: string | undefined;
  if (input.usageQuantity) {
    const qty = new Decimal(input.usageQuantity);
    if (qty.gt(0)) {
      costPerUnit = toOutputString(new Decimal(amount).div(qty));
      formulasApplied.push("unit.costPerUnit");
    } else {
      warnings.push("usageQuantity is zero or negative; costPerUnit skipped");
    }
  }

  return {
    amount,
    currency: outCurrency,
    period: targetPeriod,
    inputAmount: input.amount,
    inputCurrency: sourceCurrency,
    inputPeriod: input.period,
    ...(costPerUnit !== undefined && { costPerUnit }),
    ...(input.usageUnit !== undefined && { usageUnit: input.usageUnit }),
    formulasApplied,
    computedAt,
    warnings,
  };
}
