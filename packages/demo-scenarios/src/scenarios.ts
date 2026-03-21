import { STANDARD_SLO_TIERS } from "@ficecal/sla-slo-sli-economics";
import type { DemoScenario } from "./types.js";

/**
 * Canonical FiceCal v2 demo scenarios.
 *
 * These are the six reference narratives shown in the onboarding flow and
 * used as integration-test fixtures in the qa-module.
 */
export const DEMO_SCENARIOS: DemoScenario[] = [
  // ─── 1. AI model cost comparison ─────────────────────────────────────────

  {
    id: "ai-model-cost-comparison",
    title: "AI Model Cost Comparison — GPT-4o vs. Claude 3.5 Sonnet",
    description:
      "A fintech startup runs 10M tokens/day through a customer-support chatbot. " +
      "They want to compare the monthly cost of GPT-4o (per-1M pricing) against " +
      "Claude 3.5 Sonnet to decide which model to standardise on. This scenario " +
      "exercises the AI token economics engine with per_1m_tokens pricing and " +
      "a monthly period roll-up.",
    domains: ["ai.token"],
    inputs: {
      aiCost: {
        pricingUnit: "per_1m_tokens",
        inputTokens: 7_000_000,   // 70% of daily traffic = input
        outputTokens: 3_000_000,  // 30% = output
        inputPricePerUnit: "2.50",
        outputPricePerUnit: "10.00",
        currency: "USD",
        period: "monthly",
      },
    },
    expectedRanges: [
      {
        label: "monthly total cost USD",
        resultField: "totalCost",
        // (7M/1M × 2.50) + (3M/1M × 10.00) = 17.50 + 30.00 = 47.50 per day
        // But input is per-call not per-period; we pass one batch:
        // 7M × $2.50/1M = $17.50 input; 3M × $10/1M = $30 output; total = $47.50
        min: 47,
        max: 48,
      },
    ],
  },

  // ─── 2. SLO error budget — three nines ────────────────────────────────────

  {
    id: "three-nines-error-budget",
    title: "99.9% SLO Monthly Error Budget",
    description:
      "A payments platform targets 99.9% monthly uptime for its checkout API. " +
      "The engineering team wants to know exactly how many minutes of downtime " +
      "they can tolerate this month before breaching the SLA, and how much of " +
      "that budget has already been consumed given 99.87% actual uptime so far.",
    domains: ["reliability.error-budget"],
    inputs: {
      errorBudget: {
        sloTarget: STANDARD_SLO_TIERS["99.9"],
        period: "monthly",
        options: { actualUptimePct: "99.87" },
      },
    },
    expectedRanges: [
      {
        label: "allowable downtime minutes (monthly 99.9%)",
        resultField: "allowableDowntimeMinutes",
        min: 43,
        max: 44,
      },
      {
        label: "error budget consumed % (99.87% actual vs 99.9% target)",
        resultField: "errorBudgetConsumedPct",
        // actual downtime = 0.13% of month; target = 0.1%; consumed = 0.13/0.1 = 130% → clamped to 100
        min: 99,
        max: 101,
      },
    ],
  },

  // ─── 3. Outage cost — major e-commerce incident ───────────────────────────

  {
    id: "ecommerce-outage-cost",
    title: "E-commerce Checkout Outage — 45-Minute Incident Cost",
    description:
      "A Black Friday outage takes down the checkout service for 45 minutes. " +
      "Revenue at risk is $50,000/hour (peak trading). Four senior engineers " +
      "are paged at $200/hour each. Calculate total business impact to include " +
      "in the incident post-mortem.",
    domains: ["reliability.downtime-cost"],
    inputs: {
      downtimeCost: {
        outageMinutes: 45,
        revenueAtRiskPerHour: "50000",
        engineeringCostPerHour: "200",
        engineersOnCall: 4,
        currency: "USD",
      },
    },
    expectedRanges: [
      {
        label: "revenue cost (45min × $50k/hr)",
        resultField: "revenueCost",
        // 0.75 × 50000 = 37500
        min: 37499,
        max: 37501,
      },
      {
        label: "engineering cost (45min × $200/hr × 4 engineers)",
        resultField: "engineeringCost",
        // 0.75 × 200 × 4 = 600
        min: 599,
        max: 601,
      },
      {
        label: "total cost",
        resultField: "totalCost",
        min: 38099,
        max: 38101,
      },
    ],
  },

  // ─── 4. Reliability ROI — four nines upgrade ──────────────────────────────

  {
    id: "four-nines-reliability-roi",
    title: "99.9% → 99.99% Upgrade — Reliability ROI Analysis",
    description:
      "A cloud-native SaaS is considering a $120,000 infrastructure investment " +
      "to upgrade from 99.9% to 99.99% monthly uptime. Revenue at risk is " +
      "$30,000/hour. Calculate the ROI multiple and payback period to present " +
      "to the CFO.",
    domains: ["reliability.roi"],
    inputs: {
      reliabilityRoi: {
        improvementCost: "120000",
        currentUptimePct: "99.9",
        targetUptimePct: "99.99",
        revenueAtRiskPerHour: "30000",
        period: "monthly",
        currency: "USD",
      },
    },
    expectedRanges: [
      {
        label: "downtime minutes saved per month",
        // 99.9%: 0.1% of 43829 ≈ 43.83 min; 99.99%: 0.01% ≈ 4.38 min; saved ≈ 39.45 min
        resultField: "downtimeMinutesSaved",
        min: 38,
        max: 41,
      },
      {
        label: "revenue protected per month",
        // 39.45 min / 60 × 30000 ≈ $19,725
        resultField: "revenueProtectedPerPeriod",
        min: 18000,
        max: 21000,
      },
    ],
  },

  // ─── 5. Multi-cloud portfolio normalisation ───────────────────────────────

  {
    id: "multi-cloud-tech-normalisation",
    title: "Hybrid Cloud Portfolio — Cross-Technology Cost Normalisation",
    description:
      "An enterprise runs workloads across AWS compute, Azure storage, an AI inference " +
      "service, and three SaaS tools. Their CFO wants a single efficiency score for " +
      "each spend category to identify where they're above or below market median.",
    domains: ["tech.normalization"],
    inputs: {
      techNormalization: {
        currency: "USD",
        items: [
          {
            id: "aws-compute",
            label: "AWS EC2 m5.4xlarge fleet",
            category: "cloud-compute",
            rawCost: "4800",
            currency: "USD",
            quantity: 100,
            nativeUnit: "vCPU-hour",
          },
          {
            id: "azure-blob",
            label: "Azure Blob Storage",
            category: "cloud-storage",
            rawCost: "920",
            currency: "USD",
            quantity: 40000,
            nativeUnit: "GB",
          },
          {
            id: "bedrock-inference",
            label: "AWS Bedrock Claude inference",
            category: "ai-inference",
            rawCost: "1200",
            currency: "USD",
            quantity: 1000,
            nativeUnit: "1M tokens",
          },
          {
            id: "github-ent",
            label: "GitHub Enterprise Cloud",
            category: "saas-licence",
            rawCost: "2100",
            currency: "USD",
            quantity: 150,
            nativeUnit: "seat",
          },
        ],
      },
    },
    expectedRanges: [
      {
        label: "portfolio total USD",
        resultField: "portfolioTotal",
        // 4800 + 920 + 1200 + 2100 = 9020
        min: 9019,
        max: 9021,
      },
    ],
  },

  // ─── 6. Budget variance — Q1 cloud spend ─────────────────────────────────

  {
    id: "q1-cloud-budget-variance",
    title: "Q1 Cloud Budget Variance — Engineering Spend Review",
    description:
      "An engineering finance team is reviewing Q1 actuals against the approved " +
      "cloud budget. Three cost centres are analysed: compute (over budget due to " +
      "a GPU spike), storage (under budget after S3 lifecycle policy tuning), and " +
      "networking (on budget). The CFO wants the portfolio variance % to include " +
      "in the board pack.",
    domains: ["budget.variance"],
    inputs: {
      budgetVariance: {
        currency: "USD",
        items: [
          { id: "compute", label: "Compute", budgetedAmount: "80000", actualAmount: "94500", currency: "USD" },
          { id: "storage", label: "Storage", budgetedAmount: "15000", actualAmount: "11200", currency: "USD" },
          { id: "network", label: "Networking", budgetedAmount: "5000",  actualAmount: "4980",  currency: "USD" },
        ],
      },
    },
    expectedRanges: [
      {
        label: "total variance USD (over budget)",
        resultField: "totalVariance",
        // (94500+11200+4980) - (80000+15000+5000) = 110680 - 100000 = 10680
        min: 10679,
        max: 10681,
      },
      {
        label: "portfolio variance pct",
        resultField: "totalVariancePct",
        // 10680 / 100000 × 100 = 10.68%
        min: 10.6,
        max: 10.8,
      },
    ],
  },
];
