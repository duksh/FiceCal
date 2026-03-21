import type { EvidenceEntry } from "./types.js";

/**
 * Canonical evidence catalog for FiceCal v2.
 *
 * Each entry explains the authoritative basis for one or more calculation
 * methodologies or recommendation thresholds used in FiceCal v2.
 *
 * Versioning: entries are append-only; deprecated entries gain a "deprecated"
 * tag rather than being removed so existing formula references remain resolvable.
 */
export const EVIDENCE_CATALOG: EvidenceEntry[] = [
  // ─── FinOps / FOCUS ───────────────────────────────────────────────────────

  {
    id: "focus-1.3-cost-allocation",
    title: "FOCUS 1.3 — Cost and Usage Specification",
    sourceType: "standard",
    source: "FinOps Foundation",
    version: "1.3",
    url: "https://focus.finops.org/",
    rationale:
      "FOCUS 1.3 defines the canonical columns and semantics for cloud cost and usage data. " +
      "FiceCal v2 uses FOCUS column names (BilledCost, EffectiveCost, ChargePeriodStart) as " +
      "the normalisation target when ingesting multi-cloud billing exports, ensuring " +
      "vendor-agnostic cost comparisons.",
    appliesTo: ["budget.variance.item", "budget.variance.portfolio", "tech.normalize.perUnit"],
    tags: ["FinOps", "FOCUS", "cost-allocation", "multi-cloud"],
  },
  {
    id: "finops-framework-2026",
    title: "FinOps Framework 2026 — Capabilities and Domains",
    sourceType: "framework",
    source: "FinOps Foundation",
    version: "2026",
    url: "https://www.finops.org/framework/",
    rationale:
      "The FinOps Framework organises cloud financial management into six domains and 18 " +
      "capabilities. FiceCal v2 maps its health-score signal categories to FinOps domains " +
      "(Understand, Quantify, Optimise) to align recommendations with industry-standard " +
      "maturity progression rather than arbitrary thresholds.",
    appliesTo: ["health.score.weighted", "recommendation.rule.match"],
    tags: ["FinOps", "framework", "maturity", "capability"],
  },

  // ─── SLO / Reliability ────────────────────────────────────────────────────

  {
    id: "google-sre-error-budget",
    title: "Google SRE Book — Error Budgets",
    sourceType: "methodology",
    source: "Google SRE",
    version: "2nd Edition",
    url: "https://sre.google/sre-book/embracing-risk/",
    rationale:
      "The error budget concept — converting an SLO target into allowable downtime per " +
      "period — originates in Google's SRE practice. FiceCal v2's computeErrorBudget " +
      "implements this formula verbatim: allowableDowntime = totalMinutes × (1 − SLO%). " +
      "The six canonical tiers (99% through 99.999%) reflect real-world SLA tiers cited " +
      "across hyperscaler public commitments.",
    appliesTo: [
      "slo.errorBudget.allowableDowntime",
      "slo.downtimeCost.revenue",
      "slo.downtimeCost.engineering",
    ],
    tags: ["SLO", "SLA", "reliability", "error-budget", "SRE"],
  },
  {
    id: "slo-reliability-roi",
    title: "SRE Workbook — Setting SLOs",
    sourceType: "methodology",
    source: "Google SRE",
    version: "1st Edition",
    url: "https://sre.google/workbook/implementing-slos/",
    rationale:
      "The reliability ROI calculation (revenue protected per period ÷ improvement cost) " +
      "provides a business justification for reliability investments. Payback period " +
      "(improvement cost ÷ revenue protected) is the reciprocal and expresses break-even " +
      "in billing periods. Both formulas are endorsed in the SRE Workbook's economic " +
      "framework for SLO justification.",
    appliesTo: ["slo.reliability.roi", "slo.reliability.payback"],
    tags: ["SLO", "reliability", "ROI", "investment", "SRE"],
  },

  // ─── AI / Token pricing ───────────────────────────────────────────────────

  {
    id: "ai-token-billing-units",
    title: "AI Model Pricing Unit Taxonomy — FiceCal v2 Internal",
    sourceType: "methodology",
    source: "FiceCal v2",
    version: "1.0.0",
    rationale:
      "Different AI providers charge by different units: per individual token, per 1K tokens, " +
      "per 1M tokens, per image, per API request, or per second of compute. FiceCal v2 " +
      "normalises all six variants to a single decimal-safe cost result, enabling " +
      "apples-to-apples comparisons across models from different vendors. The taxonomy " +
      "is derived from a survey of AWS Bedrock, Anthropic, OpenAI, and Google Vertex AI " +
      "public pricing pages as of 2026.",
    appliesTo: ["aiCost.token", "aiCost.image", "aiCost.request", "aiCost.time"],
    tags: ["AI", "tokens", "pricing", "LLM", "multi-model"],
  },

  // ─── Multi-technology normalisation ───────────────────────────────────────

  {
    id: "tech-normalization-basis-units",
    title: "Cloud Pricing Basis Unit Normalisation — FiceCal v2 Internal",
    sourceType: "methodology",
    source: "FiceCal v2",
    version: "1.0.0",
    rationale:
      "Comparing costs across cloud-compute ($/vCPU-hour), AI inference ($/1M tokens), " +
      "SaaS licences ($/seat/month), and on-prem hardware ($/device) is impossible without " +
      "normalisation to a canonical basis unit per category. FiceCal v2 defines 10 " +
      "TechCategory variants, each with a documented basis unit and a median market benchmark " +
      "derived from public vendor pricing. The efficiency index (costPerBasisUnit / median) " +
      "enables relative spend health scoring across heterogeneous technology stacks.",
    appliesTo: ["tech.normalize.perUnit", "tech.normalize.efficiencyIndex", "tech.normalize.portfolio"],
    tags: ["normalization", "multi-cloud", "hybrid", "efficiency", "benchmark"],
  },

  // ─── Budget / Forecasting ─────────────────────────────────────────────────

  {
    id: "ols-linear-regression-forecast",
    title: "Ordinary Least Squares Regression for Spend Forecasting",
    sourceType: "methodology",
    source: "FiceCal v2",
    version: "1.0.0",
    rationale:
      "OLS linear regression fits a straight line (y = slope × x + intercept) to historical " +
      "spend data indexed by period. The R² coefficient of determination measures goodness " +
      "of fit; values close to 1.0 indicate the linear trend explains most of the observed " +
      "variance. FiceCal v2 uses OLS as the default forecast method because it is " +
      "interpretable, audit-friendly, and computationally lightweight for the small " +
      "observation windows typical in cloud billing (6–24 months).",
    appliesTo: ["forecast.trend.linear", "forecast.trend.rSquared"],
    tags: ["forecasting", "regression", "OLS", "trend", "spend"],
  },
  {
    id: "compound-growth-projection",
    title: "Compound Growth Budget Projection",
    sourceType: "methodology",
    source: "FiceCal v2",
    version: "1.0.0",
    rationale:
      "Budget projection using compound growth (projected = baseline × (1 + r)^n) is the " +
      "standard approach for multi-period financial planning when a growth rate assumption " +
      "is known. FiceCal v2 exposes the growth rate as an explicit input rather than " +
      "inferring it from historical data, making the assumption transparent and auditable.",
    appliesTo: ["budget.projection.compoundGrowth"],
    tags: ["forecasting", "projection", "budget", "growth-rate"],
  },

  // ─── Health scoring ───────────────────────────────────────────────────────

  {
    id: "weighted-signal-health-score",
    title: "Weighted Signal Aggregation for Cloud Health Scoring",
    sourceType: "methodology",
    source: "FiceCal v2",
    version: "1.0.0",
    rationale:
      "FiceCal v2's health score is computed as a weighted average of normalised signal " +
      "scores across six categories (pricing-freshness, budget-adherence, model-trust, etc.). " +
      "The worst-severity propagation rule ensures that a single critical signal can cap the " +
      "overall score, preventing a high average from masking a severe outlier. This approach " +
      "is consistent with composite index design patterns used in financial risk scoring.",
    appliesTo: ["health.score.weighted", "health.score.worstSeverity"],
    tags: ["health-score", "reliability", "composite-index", "risk"],
  },
];
