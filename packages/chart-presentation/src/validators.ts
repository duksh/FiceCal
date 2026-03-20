import type { ChartPayload, ChartPayloadValidationResult, ChartType, AxisScaleType } from "./types.js";

const VALID_CHART_TYPES: readonly ChartType[] = [
  "bar", "grouped-bar", "stacked-bar", "line", "area", "pie", "donut", "scatter", "waterfall"
];

const VALID_SCALE_TYPES: readonly AxisScaleType[] = ["linear", "log", "band", "time"];

export function validateChartPayload(payload: unknown): ChartPayloadValidationResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["payload must be a non-null object"] };
  }

  const p = payload as Record<string, unknown>;

  // Required string fields
  for (const field of ["id", "title", "chartType"] as const) {
    if (!p[field] || typeof p[field] !== "string") {
      errors.push(`${field} must be a non-empty string`);
    }
  }

  // chartType must be valid
  if (typeof p.chartType === "string" && !VALID_CHART_TYPES.includes(p.chartType as ChartType)) {
    errors.push(`chartType "${p.chartType}" is not a valid ChartType`);
  }

  // series must be a non-empty array
  if (!Array.isArray(p.series) || p.series.length === 0) {
    errors.push("series must be a non-empty array");
  } else {
    for (let i = 0; i < p.series.length; i++) {
      const s = p.series[i] as Record<string, unknown>;
      if (!s.id || typeof s.id !== "string") errors.push(`series[${i}].id must be a non-empty string`);
      if (!s.label || typeof s.label !== "string") errors.push(`series[${i}].label must be a non-empty string`);
      if (!Array.isArray(s.points)) errors.push(`series[${i}].points must be an array`);
      else {
        for (let j = 0; j < s.points.length; j++) {
          const pt = s.points[j] as Record<string, unknown>;
          if (!pt.label || typeof pt.label !== "string") errors.push(`series[${i}].points[${j}].label required`);
          if (!pt.value || typeof pt.value !== "string") errors.push(`series[${i}].points[${j}].value must be a decimal-safe string`);
        }
      }
    }
  }

  // xAxis and yAxis
  for (const axisKey of ["xAxis", "yAxis"] as const) {
    const axis = p[axisKey] as Record<string, unknown> | undefined;
    if (!axis || typeof axis !== "object") {
      errors.push(`${axisKey} is required`);
    } else {
      if (!axis.label || typeof axis.label !== "string") errors.push(`${axisKey}.label required`);
      if (!axis.scaleType || !VALID_SCALE_TYPES.includes(axis.scaleType as AxisScaleType)) {
        errors.push(`${axisKey}.scaleType must be one of: ${VALID_SCALE_TYPES.join(", ")}`);
      }
    }
  }

  // accessibility
  const a11y = p.accessibility as Record<string, unknown> | undefined;
  if (!a11y || typeof a11y !== "object") {
    errors.push("accessibility is required");
  } else {
    if (!a11y.ariaLabel || typeof a11y.ariaLabel !== "string") errors.push("accessibility.ariaLabel required");
    if (!a11y.summary || typeof a11y.summary !== "string") errors.push("accessibility.summary required");
    if (typeof a11y.keyboardNavigable !== "boolean") errors.push("accessibility.keyboardNavigable must be boolean");
  }

  // provenance
  const prov = p.provenance as Record<string, unknown> | undefined;
  if (!prov || typeof prov !== "object") {
    errors.push("provenance is required");
  } else {
    if (!Array.isArray(prov.formulaIds)) errors.push("provenance.formulaIds must be an array");
    if (!prov.dataSource || typeof prov.dataSource !== "string") errors.push("provenance.dataSource required");
    if (!prov.generatedAt || typeof prov.generatedAt !== "string") errors.push("provenance.generatedAt required");
    if (typeof prov.isStale !== "boolean") errors.push("provenance.isStale must be boolean");
    if (prov.isStale && (!prov.stalenessReason || typeof prov.stalenessReason !== "string")) {
      errors.push("provenance.stalenessReason required when isStale is true");
    }
  }

  // renderable
  if (typeof p.renderable !== "boolean") {
    errors.push("renderable must be a boolean");
  }
  if (p.renderable === false && (!p.notRenderableReason || typeof p.notRenderableReason !== "string")) {
    errors.push("notRenderableReason required when renderable is false");
  }

  return { valid: errors.length === 0, errors };
}
