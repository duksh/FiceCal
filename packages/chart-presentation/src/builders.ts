import type {
  ChartPayload, ChartSeries, ChartAxis, ChartAccessibility, ChartProvenance, ChartType, AxisScaleType
} from "./types.js";

let _idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++_idCounter}`;
}

export type PeriodCostPoint = {
  period: string;
  amount: string;
  currency: string;
  displayValue: string;
};

/**
 * Build a bar chart payload from a series of period → cost data points.
 * Used by economics-module outputs to visualise cost over time.
 */
export function buildPeriodCostBarChart(params: {
  id?: string;
  title: string;
  subtitle?: string;
  currency: string;
  points: PeriodCostPoint[];
  formulaIds: string[];
  dataSource: string;
  isStale?: boolean;
  stalenessReason?: string;
}): ChartPayload {
  const series: ChartSeries = {
    id: "cost",
    label: `Cost (${params.currency})`,
    points: params.points.map(p => ({
      label: p.period,
      value: p.amount,
      currency: p.currency,
      displayValue: p.displayValue,
    })),
  };

  const xAxis: ChartAxis = { label: "Period", scaleType: "band" as AxisScaleType };
  const yAxis: ChartAxis = { label: `Amount (${params.currency})`, scaleType: "linear" as AxisScaleType, unit: params.currency, showGrid: true };

  const accessibility: ChartAccessibility = {
    ariaLabel: params.title,
    summary: `Bar chart showing ${params.title}. ${params.points.length} data point(s).`,
    keyboardNavigable: true,
  };

  const provenance: ChartProvenance = {
    formulaIds: params.formulaIds,
    dataSource: params.dataSource,
    generatedAt: new Date().toISOString(),
    isStale: params.isStale ?? false,
    ...(params.isStale && params.stalenessReason ? { stalenessReason: params.stalenessReason } : {}),
  };

  return {
    id: params.id ?? nextId("period-cost-bar"),
    chartType: "bar" as ChartType,
    title: params.title,
    ...(params.subtitle ? { subtitle: params.subtitle } : {}),
    series: [series],
    xAxis,
    yAxis,
    accessibility,
    provenance,
    renderable: params.points.length > 0,
    ...(params.points.length === 0 ? { notRenderableReason: "No data points provided" } : {}),
  };
}

export type ModelCostPoint = {
  modelId: string;
  modelName: string;
  cost: string;
  currency: string;
  displayValue: string;
  pricingSourceType: string;
};

/**
 * Build a grouped bar chart comparing AI model costs.
 * Used by ai-token-economics module to surface model cost comparisons.
 */
export function buildModelComparisonBarChart(params: {
  id?: string;
  title: string;
  subtitle?: string;
  period: string;
  models: ModelCostPoint[];
  formulaIds: string[];
  dataSource: string;
  isStale?: boolean;
  stalenessReason?: string;
}): ChartPayload {
  const series: ChartSeries = {
    id: "model-cost",
    label: `Cost per ${params.period}`,
    points: params.models.map(m => ({
      label: m.modelName,
      value: m.cost,
      currency: m.currency,
      displayValue: m.displayValue,
      meta: { modelId: m.modelId, pricingSourceType: m.pricingSourceType },
    })),
  };

  const xAxis: ChartAxis = { label: "Model", scaleType: "band" as AxisScaleType };
  const yAxis: ChartAxis = {
    label: `Cost per ${params.period} (${params.models[0]?.currency ?? ""})`,
    scaleType: "linear" as AxisScaleType,
    unit: params.models[0]?.currency,
    showGrid: true,
  };

  const accessibility: ChartAccessibility = {
    ariaLabel: params.title,
    summary: `Bar chart comparing costs of ${params.models.length} AI model(s) per ${params.period}.`,
    keyboardNavigable: true,
  };

  const provenance: ChartProvenance = {
    formulaIds: params.formulaIds,
    dataSource: params.dataSource,
    generatedAt: new Date().toISOString(),
    isStale: params.isStale ?? false,
    ...(params.isStale && params.stalenessReason ? { stalenessReason: params.stalenessReason } : {}),
  };

  const renderable = params.models.length > 0;
  return {
    id: params.id ?? nextId("model-comparison-bar"),
    chartType: "bar" as ChartType,
    title: params.title,
    ...(params.subtitle ? { subtitle: params.subtitle } : {}),
    series: [series],
    xAxis,
    yAxis,
    accessibility,
    provenance,
    renderable,
    ...(!renderable ? { notRenderableReason: "No model data points provided" } : {}),
  };
}

/**
 * Build a non-renderable placeholder payload.
 * Use when data is missing or unresolved — surfaces reason to the UI instead of silently dropping the chart.
 */
export function buildUnresolvableChart(params: {
  id?: string;
  title: string;
  reason: string;
  dataSource: string;
}): ChartPayload {
  return {
    id: params.id ?? nextId("unresolvable"),
    chartType: "bar" as ChartType,
    title: params.title,
    series: [],
    xAxis: { label: "", scaleType: "band" as AxisScaleType },
    yAxis: { label: "", scaleType: "linear" as AxisScaleType },
    accessibility: {
      ariaLabel: `${params.title} — unavailable`,
      summary: `This chart could not be rendered: ${params.reason}`,
      keyboardNavigable: false,
    },
    provenance: {
      formulaIds: [],
      dataSource: params.dataSource,
      generatedAt: new Date().toISOString(),
      isStale: false,
    },
    renderable: false,
    notRenderableReason: params.reason,
  };
}
