export type FormulaEntry = {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  output: string;
  example: string;
};

export const FORMULA_REGISTRY: readonly FormulaEntry[] = [
  {
    id: "period.normalize",
    name: "Period Normalization",
    description:
      "Converts a monetary amount from one billing period to another using month-equivalent ratios",
    inputs: ["amount", "fromPeriod", "toPeriod"],
    output: "normalizedAmount",
    example: "1000 monthly → 12000 annual",
  },
  {
    id: "currency.convert",
    name: "Currency Conversion",
    description:
      "Converts an amount from a source currency to a target currency using a provided exchange rate",
    inputs: ["amount", "fromCurrency", "toCurrency", "rate"],
    output: "convertedAmount",
    example: "100 USD → 85 EUR at rate 0.85",
  },
  {
    id: "unit.costPerUnit",
    name: "Cost Per Unit",
    description:
      "Derives the cost per unit of consumption given total cost and total usage quantity",
    inputs: ["totalCost", "usageQuantity"],
    output: "costPerUnit",
    example: "1000 total / 500 units = 2.00 per unit",
  },
  {
    id: "economics.periodizedCost",
    name: "Periodized Cost",
    description:
      "Normalizes a raw cost to a target period and target currency in a single pass",
    inputs: ["amount", "fromCurrency", "toCurrency", "rate", "fromPeriod", "toPeriod"],
    output: "periodizedCost",
    example: "1000 USD monthly → EUR quarterly",
  },
];

export function getFormula(id: string): FormulaEntry | undefined {
  return FORMULA_REGISTRY.find((e) => e.id === id);
}

export function requireFormula(id: string): FormulaEntry {
  const entry = getFormula(id);
  if (!entry) {
    throw new Error(`Formula not found in registry: "${id}"`);
  }
  return entry;
}
