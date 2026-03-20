import type { RecommendationRule } from "./types.js";

/**
 * Declarative rule catalogue.
 *
 * Rules are evaluated against HealthSignal[] by the engine.
 * Each rule fires when the signal's severity >= rule.minSeverity.
 * Multiple rules can match the same signal (different audiences).
 *
 * Ordering within the array is irrelevant — the engine sorts by priority.
 */
export const RECOMMENDATION_RULES: readonly RecommendationRule[] = [
  // ── pricing-freshness ───────────────────────────────────────────────────

  {
    id: "pricing-freshness.platform-engineer.refresh-feed",
    category: "pricing-freshness",
    minSeverity: "warning",
    audience: "platform-engineer",
    priority: "high",
    title: "Refresh pricing data feed",
    rationale: (s) => `Pricing data is stale. Signal: ${s}`,
    action:
      "Trigger a manual pricing-data refresh or verify the scheduled scraper job has not failed.",
    estimatedImpact:
      "Brings pricing age under the 7-day warning threshold, restoring signal score ≥80.",
  },
  {
    id: "pricing-freshness.finops-analyst.flag-stale-costs",
    category: "pricing-freshness",
    minSeverity: "warning",
    audience: "finops-analyst",
    priority: "medium",
    title: "Flag cost reports as potentially stale",
    rationale: (s) => `Pricing data staleness detected. Signal: ${s}`,
    action:
      "Add a staleness disclaimer to any cost report produced until pricing data is refreshed.",
    estimatedImpact: "Prevents misinformed budget decisions based on outdated rates.",
  },
  {
    id: "pricing-freshness.executive.data-quality-risk",
    category: "pricing-freshness",
    minSeverity: "critical",
    audience: "executive",
    priority: "high",
    title: "Pricing data quality risk",
    rationale: (s) => `Critical pricing staleness. Signal: ${s}`,
    action:
      "Ask the platform team for an ETA on pricing refresh before reviewing cost summaries.",
    estimatedImpact: "Reduces risk of acting on materially incorrect cost figures.",
  },

  // ── budget-adherence ────────────────────────────────────────────────────

  {
    id: "budget-adherence.finops-analyst.investigate-overrun",
    category: "budget-adherence",
    minSeverity: "warning",
    audience: "finops-analyst",
    priority: "high",
    title: "Investigate spend approaching budget limit",
    rationale: (s) => `Budget utilisation is above 85%. Signal: ${s}`,
    action:
      "Review top-cost line items. Identify which model or period accounts for the overage trend.",
    estimatedImpact: "Early intervention can prevent a full budget breach.",
  },
  {
    id: "budget-adherence.finops-analyst.breach-response",
    category: "budget-adherence",
    minSeverity: "critical",
    audience: "finops-analyst",
    priority: "critical",
    title: "Budget breach — immediate action required",
    rationale: (s) => `Spend has exceeded the configured budget. Signal: ${s}`,
    action:
      "Raise an incident. Pause non-critical model inference jobs and escalate to the budget owner.",
    estimatedImpact: "Stopping discretionary spend can cap overrun within the billing period.",
  },
  {
    id: "budget-adherence.executive.budget-alert",
    category: "budget-adherence",
    minSeverity: "warning",
    audience: "executive",
    priority: "medium",
    title: "AI spend approaching budget ceiling",
    rationale: (s) => `Budget utilisation warning. Signal: ${s}`,
    action: "Review the FinOps team's spend forecast and approve any necessary budget adjustment.",
    estimatedImpact: "Proactive approval avoids last-minute escalations.",
  },
  {
    id: "budget-adherence.executive.budget-breach",
    category: "budget-adherence",
    minSeverity: "critical",
    audience: "executive",
    priority: "critical",
    title: "AI spend has exceeded approved budget",
    rationale: (s) => `Budget has been breached. Signal: ${s}`,
    action:
      "Approve an emergency budget supplement or direct the FinOps team to throttle AI usage.",
  },
  {
    id: "budget-adherence.developer.reduce-usage",
    category: "budget-adherence",
    minSeverity: "critical",
    audience: "developer",
    priority: "high",
    title: "Reduce model inference volume",
    rationale: (s) => `Budget breach in progress. Signal: ${s}`,
    action:
      "Switch non-critical workloads to lower-cost models. Review token throughput per endpoint.",
    estimatedImpact: "Reducing token volume by 20% can materially reduce over-budget spend.",
  },

  // ── data-completeness ───────────────────────────────────────────────────

  {
    id: "data-completeness.platform-engineer.fill-gaps",
    category: "data-completeness",
    minSeverity: "warning",
    audience: "platform-engineer",
    priority: "medium",
    title: "Fill missing fields in billing records",
    rationale: (s) => `Billing records have incomplete data. Signal: ${s}`,
    action:
      "Audit NormalizedCostRecord entries for missing required fields. Update the ingestion pipeline.",
    estimatedImpact: "Higher completeness improves accuracy of cost attribution and reporting.",
  },
  {
    id: "data-completeness.finops-analyst.caveat-reports",
    category: "data-completeness",
    minSeverity: "warning",
    audience: "finops-analyst",
    priority: "low",
    title: "Note data gaps in cost analysis",
    rationale: (s) => `Incomplete data detected. Signal: ${s}`,
    action:
      "Add a data-completeness caveat to cost analysis outputs until platform resolves the gaps.",
  },

  // ── model-trust ─────────────────────────────────────────────────────────

  {
    id: "model-trust.finops-analyst.verify-pricing-source",
    category: "model-trust",
    minSeverity: "warning",
    audience: "finops-analyst",
    priority: "medium",
    title: "Verify pricing source for untrusted models",
    rationale: (s) => `One or more models use hardcoded or unverified pricing. Signal: ${s}`,
    action:
      "Cross-reference model pricing against vendor pricing pages. Update pricingSourceType to 'verified' after confirmation.",
    estimatedImpact: "Verified pricing eliminates the model-trust score penalty.",
  },
  {
    id: "model-trust.developer.prefer-verified-models",
    category: "model-trust",
    minSeverity: "warning",
    audience: "developer",
    priority: "medium",
    title: "Prefer models with verified pricing",
    rationale: (s) => `Model pricing trust is low. Signal: ${s}`,
    action:
      "Where possible, choose models flagged as 'verified' in the model catalog for cost-sensitive workloads.",
    estimatedImpact: "Reduces cost estimation error in billing projections.",
  },

  // ── cost-efficiency ─────────────────────────────────────────────────────

  {
    id: "cost-efficiency.finops-analyst.optimize-spend",
    category: "cost-efficiency",
    minSeverity: "warning",
    audience: "finops-analyst",
    priority: "high",
    title: "Cost efficiency below threshold",
    rationale: (s) => `Cost-efficiency signal degraded. Signal: ${s}`,
    action:
      "Identify the top-cost model SKUs and evaluate whether cheaper alternatives meet the performance requirement.",
    estimatedImpact: "Even a 10% model substitution rate can yield meaningful monthly savings.",
  },
  {
    id: "cost-efficiency.developer.model-substitution",
    category: "cost-efficiency",
    minSeverity: "critical",
    audience: "developer",
    priority: "high",
    title: "Evaluate cheaper model alternatives",
    rationale: (s) => `Cost efficiency is critically low. Signal: ${s}`,
    action:
      "Run a benchmark comparison against lower-tier models for your workload. Use the Model Lens catalog for alternatives.",
  },

  // ── commitment-utilisation ──────────────────────────────────────────────

  {
    id: "commitment-utilisation.finops-analyst.check-reservations",
    category: "commitment-utilisation",
    minSeverity: "warning",
    audience: "finops-analyst",
    priority: "medium",
    title: "Review commitment utilisation",
    rationale: (s) => `Committed spend is under- or over-utilised. Signal: ${s}`,
    action:
      "Review active reservations and savings plans. Adjust commitment coverage to match actual usage patterns.",
    estimatedImpact: "Optimal commitment utilisation can reduce effective unit cost by 20–40%.",
  },
];
