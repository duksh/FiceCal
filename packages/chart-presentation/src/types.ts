/**
 * chart-presentation contracts
 *
 * Canonical chart payload types for FiceCal v2.
 * These DTOs cross the boundary between domain modules and the UI rendering layer.
 * D3 library types must NOT appear here — only plain data.
 *
 * ADR-0001: D3-first chart policy
 */

/** The chart type drives rendering strategy in the UI */
export type ChartType =
  | "bar"
  | "grouped-bar"
  | "stacked-bar"
  | "line"
  | "area"
  | "pie"
  | "donut"
  | "scatter"
  | "waterfall";

/** Axis scale type */
export type AxisScaleType = "linear" | "log" | "band" | "time";

/** A single data point on any chart */
export type ChartDataPoint = {
  /** X-axis label or category */
  label: string;
  /** Primary numeric value (decimal-safe string) */
  value: string;
  /** Optional secondary value (e.g. for grouped/stacked) */
  value2?: string;
  /** ISO currency code when value represents money */
  currency?: string;
  /** Human-readable formatted value for display (pre-formatted by domain layer) */
  displayValue?: string;
  /** Metadata for tooltip or detail panel */
  meta?: Record<string, string>;
};

/** A named series of data points */
export type ChartSeries = {
  /** Unique series identifier */
  id: string;
  /** Display label for legend */
  label: string;
  /** Ordered data points */
  points: ChartDataPoint[];
  /** Optional colour hint (CSS colour string) — UI may override */
  colorHint?: string;
};

/** Axis configuration */
export type ChartAxis = {
  /** Axis label shown to the user */
  label: string;
  /** Scale type for D3 scale selection */
  scaleType: AxisScaleType;
  /** Unit suffix for display e.g. "USD", "%" */
  unit?: string;
  /** Whether to show gridlines */
  showGrid?: boolean;
};

/** Accessibility metadata — mandatory for all user-facing charts per ADR-0001 */
export type ChartAccessibility = {
  /** ARIA label for the chart container */
  ariaLabel: string;
  /** Plain-text summary of what the chart shows (for screen readers) */
  summary: string;
  /** Whether keyboard navigation is supported */
  keyboardNavigable: boolean;
};

/** Evidence provenance — which formulas and data sources produced this chart */
export type ChartProvenance = {
  /** Formula IDs from the formula registry that produced the data */
  formulaIds: string[];
  /** Data source label e.g. "duksh-models-adapter@a3f9b12cd401@2026-03-20" */
  dataSource: string;
  /** ISO timestamp of when the payload was generated */
  generatedAt: string;
  /** Whether the underlying data is stale */
  isStale: boolean;
  /** Staleness warning message if isStale is true */
  stalenessReason?: string;
};

/**
 * Canonical chart payload — the complete DTO passed from domain layer to UI renderer.
 *
 * Rules:
 * - All numeric values are decimal-safe strings
 * - All user-facing text is pre-formatted by the domain layer
 * - No D3 types cross this boundary
 * - Provenance is always present
 * - Accessibility is always present
 */
export type ChartPayload = {
  /** Unique chart instance ID */
  id: string;
  /** Chart type — drives D3 rendering strategy */
  chartType: ChartType;
  /** Chart title shown to the user */
  title: string;
  /** Optional subtitle or context description */
  subtitle?: string;
  /** Data series — one series for simple charts, multiple for grouped/stacked */
  series: ChartSeries[];
  /** X-axis configuration */
  xAxis: ChartAxis;
  /** Y-axis configuration */
  yAxis: ChartAxis;
  /** Accessibility metadata */
  accessibility: ChartAccessibility;
  /** Provenance traceability */
  provenance: ChartProvenance;
  /** Whether this chart can be rendered — false means degrade gracefully */
  renderable: boolean;
  /** Reason why chart cannot be rendered (when renderable is false) */
  notRenderableReason?: string;
};

/** Result of chart payload validation */
export type ChartPayloadValidationResult = {
  valid: boolean;
  errors: string[];
};
