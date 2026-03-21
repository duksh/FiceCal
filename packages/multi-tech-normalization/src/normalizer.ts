import { Decimal, toOutputString } from "@ficecal/core-economics";
import type {
  TechCostInput,
  NormalizedTechCost,
  TechNormalizationResult,
  TechCategory,
} from "./types.js";
import { CATEGORY_BASIS_UNIT } from "./types.js";

// ─── Category median benchmarks (USD basis) ───────────────────────────────────
// Used to compute efficiency index. These represent approximate market medians
// and are intentionally versioned through the formula registry.

const CATEGORY_MEDIAN_USD: Record<TechCategory, string> = {
  "cloud-compute":    "0.048",    // $/vCPU-hour (general purpose, on-demand)
  "cloud-storage":    "0.023",    // $/GB-month (S3-equivalent)
  "cloud-network":    "0.085",    // $/GB egress
  "ai-inference":     "1.00",     // $/1M tokens equivalent
  "ai-training":      "2.50",     // $/GPU-hour (A100-class)
  "saas-licence":     "15.00",    // $/seat-month (mid-market SaaS)
  "on-prem-hardware": "0.035",    // $/hour amortised (3yr lifecycle)
  "managed-service":  "0.20",     // $/hour (RDS-equivalent, multi-AZ)
  "data-transfer":    "0.09",     // $/GB internet egress
  "support-contract": "500.00",   // $/month (business tier)
};

// ─── Core normalisation ───────────────────────────────────────────────────────

function normalizeItem(input: TechCostInput, warnings: string[]): NormalizedTechCost {
  const raw = new Decimal(input.rawCost);
  const qty = new Decimal(input.quantity);

  if (qty.isZero()) {
    warnings.push(`${input.id}: quantity is zero — costPerBasisUnit will be zero.`);
  }

  const costPerBasisUnit = qty.isZero() ? new Decimal(0) : raw.div(qty);
  const normalizedTotal = raw; // total is already the raw cost

  const median = new Decimal(CATEGORY_MEDIAN_USD[input.category]);
  const efficiencyIndex = median.isZero()
    ? new Decimal("1")
    : costPerBasisUnit.div(median);

  return {
    id: input.id,
    label: input.label,
    category: input.category,
    costPerBasisUnit: toOutputString(costPerBasisUnit),
    basisUnit: CATEGORY_BASIS_UNIT[input.category],
    normalizedTotal: toOutputString(normalizedTotal),
    rawCost: input.rawCost,
    currency: input.currency,
    efficiencyIndex: toOutputString(efficiencyIndex),
    formulasApplied: ["tech.normalization.costPerBasisUnit", "tech.normalization.efficiencyIndex"],
  };
}

// ─── Portfolio engine ─────────────────────────────────────────────────────────

export function normalizeTechCosts(inputs: TechCostInput[]): TechNormalizationResult {
  const warnings: string[] = [];

  if (inputs.length === 0) {
    warnings.push("No inputs provided — empty portfolio.");
    return {
      items: [],
      portfolioTotal: "0.0000000000",
      currency: "USD",
      byCategory: {},
      dominantCategory: "cloud-compute",
      computedAt: new Date().toISOString(),
      warnings,
    };
  }

  // Currency homogeneity check
  const currencies = new Set(inputs.map((i) => i.currency));
  if (currencies.size > 1) {
    warnings.push(
      `Mixed currencies detected (${[...currencies].join(", ")}) — portfolio total assumes same currency. Convert to a common currency first.`,
    );
  }
  const currency = inputs[0]!.currency;

  const items = inputs.map((input) => normalizeItem(input, warnings));

  // Portfolio total
  const portfolioTotal = items.reduce(
    (acc, item) => acc.add(new Decimal(item.normalizedTotal)),
    new Decimal(0),
  );

  // By-category breakdown
  const byCategoryMap = new Map<string, Decimal>();
  for (const item of items) {
    const prev = byCategoryMap.get(item.category) ?? new Decimal(0);
    byCategoryMap.set(item.category, prev.add(new Decimal(item.normalizedTotal)));
  }
  const byCategory: Record<string, string> = {};
  for (const [cat, total] of byCategoryMap) {
    byCategory[cat] = toOutputString(total);
  }

  // Dominant category
  let dominantCategory: TechCategory = items[0]!.category;
  let dominantTotal = new Decimal(0);
  for (const [cat, total] of byCategoryMap) {
    if (total.greaterThan(dominantTotal)) {
      dominantTotal = total;
      dominantCategory = cat as TechCategory;
    }
  }

  return {
    items,
    portfolioTotal: toOutputString(portfolioTotal),
    currency,
    byCategory,
    dominantCategory,
    computedAt: new Date().toISOString(),
    warnings,
  };
}
