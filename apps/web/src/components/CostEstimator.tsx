// ─── CostEstimator ────────────────────────────────────────────────────────────
//
// Real-time AI cost estimator — computes on every input change (no button click).
// Lifts result up via onResult so other panels (Health, Chart) can consume it.

import { useState, useEffect, useCallback } from "react";
import { computeAiCost } from "@ficecal/ai-token-economics";
import { buildModelComparisonBarChart } from "@ficecal/chart-presentation";
import type { AiCostInput, AiCostResult } from "@ficecal/ai-token-economics";
import type { SharedContext, PricingUnit } from "../types.js";
import { CostChart } from "./CostChart.js";
import type { DemoScenario } from "@ficecal/demo-scenarios";

interface Props {
  context: SharedContext;
  onResult?: (result: AiCostResult | null) => void;
  scenarioOverride?: DemoScenario | null;
}

const PRICING_UNITS: { value: PricingUnit; label: string }[] = [
  { value: "per_1m_tokens", label: "Per 1M tokens" },
  { value: "per_1k_tokens", label: "Per 1K tokens" },
  { value: "per_token", label: "Per token" },
  { value: "per_image", label: "Per image" },
  { value: "per_request", label: "Per request" },
  { value: "per_second", label: "Per second" },
];

const DEFAULT_FIELDS: Record<string, string> = {
  inputTokens: "1000000",
  outputTokens: "500000",
  inputPrice: "0.50",
  outputPrice: "1.50",
  imageCount: "100",
  pricePerImage: "0.040",
  resolutionMultiplier: "",
  requestCount: "1000",
  pricePerRequest: "0.001",
  durationSeconds: "3600",
  pricePerSecond: "0.0001",
  modelLabel: "Model A",
};

function buildInput(
  unit: PricingUnit,
  fields: Record<string, string>,
  currency: string
): AiCostInput | null {
  try {
    if (unit === "per_token" || unit === "per_1k_tokens" || unit === "per_1m_tokens") {
      return {
        pricingUnit: unit,
        inputTokens: Number(fields["inputTokens"] ?? "0"),
        outputTokens: Number(fields["outputTokens"] ?? "0"),
        inputPricePerUnit: fields["inputPrice"] ?? "0",
        outputPricePerUnit: fields["outputPrice"] || undefined,
        currency,
        period: "monthly",
      };
    }
    if (unit === "per_image") {
      return {
        pricingUnit: "per_image",
        imageCount: Number(fields["imageCount"] ?? "0"),
        pricePerImage: fields["pricePerImage"] ?? "0",
        resolutionMultiplier: fields["resolutionMultiplier"] || undefined,
        currency,
        period: "monthly",
      };
    }
    if (unit === "per_request") {
      return {
        pricingUnit: "per_request",
        requestCount: Number(fields["requestCount"] ?? "0"),
        pricePerRequest: fields["pricePerRequest"] ?? "0",
        currency,
        period: "monthly",
      };
    }
    return {
      pricingUnit: "per_second",
      durationSeconds: Number(fields["durationSeconds"] ?? "0"),
      pricePerSecond: fields["pricePerSecond"] ?? "0",
      currency,
      period: "monthly",
    };
  } catch {
    return null;
  }
}

export function CostEstimator({ context, onResult, scenarioOverride }: Props) {
  const [unit, setUnit] = useState<PricingUnit>("per_1m_tokens");
  const [fields, setFields] = useState<Record<string, string>>(DEFAULT_FIELDS);
  const [result, setResult] = useState<AiCostResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Apply scenario preset when provided
  useEffect(() => {
    if (!scenarioOverride?.inputs?.aiCost) return;
    const ai = scenarioOverride.inputs.aiCost;
    if (ai.pricingUnit) setUnit(ai.pricingUnit as PricingUnit);
    setFields((f) => ({
      ...f,
      inputTokens: String(ai.inputTokens ?? f["inputTokens"]),
      outputTokens: String(ai.outputTokens ?? f["outputTokens"]),
      inputPrice: String(ai.inputPricePerUnit ?? f["inputPrice"]),
      outputPrice: String(ai.outputPricePerUnit ?? f["outputPrice"]),
    }));
  }, [scenarioOverride]);

  // Real-time compute on every input change
  const compute = useCallback(() => {
    const input = buildInput(unit, fields, context.currency);
    if (!input) {
      setResult(null);
      setError("Invalid input — check required fields.");
      onResult?.(null);
      return;
    }
    try {
      const r = computeAiCost(input);
      setResult(r);
      setError(null);
      onResult?.(r);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Computation error");
      onResult?.(null);
    }
  }, [unit, fields, context.currency, onResult]);

  useEffect(() => {
    compute();
  }, [compute]);

  function setField(key: string, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  // Build chart payload from result
  const chartPayload = result
    ? buildModelComparisonBarChart({
        title: "AI cost breakdown",
        subtitle: `${context.currency} · ${result.period}`,
        period: result.period,
        models: result.breakdown.map((line, i) => ({
          modelId: `line-${i}`,
          modelName: line.label,
          cost: line.subtotal,
          currency: context.currency,
          displayValue: `${context.currency} ${parseFloat(line.subtotal).toFixed(4)}`,
          pricingSourceType: "manual",
        })),
        formulaIds: result.formulasApplied,
        dataSource: "apps/web:CostEstimator",
      })
    : null;

  return (
    <div className="panel-stack">
      <section className="panel" aria-label="AI cost estimator">
        <div className="panel-header">
          <h2>Cost Estimator</h2>
          <p className="hint">Real-time · decimal.js 28dp · formula-traced</p>
        </div>

        <div className="field-row">
          <label>
            Pricing unit
            <select value={unit} onChange={(e) => setUnit(e.target.value as PricingUnit)}>
              {PRICING_UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </label>
        </div>

        {(unit === "per_token" || unit === "per_1k_tokens" || unit === "per_1m_tokens") && (
          <div className="field-grid">
            <label>
              Input tokens
              <input type="number" value={fields["inputTokens"]}
                onChange={(e) => setField("inputTokens", e.target.value)} />
            </label>
            <label>
              Output tokens
              <input type="number" value={fields["outputTokens"]}
                onChange={(e) => setField("outputTokens", e.target.value)} />
            </label>
            <label>
              Input price ({unit === "per_1m_tokens" ? "/1M" : unit === "per_1k_tokens" ? "/1K" : "/token"})
              <input type="text" value={fields["inputPrice"]}
                onChange={(e) => setField("inputPrice", e.target.value)} />
            </label>
            <label>
              Output price (optional)
              <input type="text" value={fields["outputPrice"]}
                onChange={(e) => setField("outputPrice", e.target.value)} />
            </label>
          </div>
        )}

        {unit === "per_image" && (
          <div className="field-grid">
            <label>
              Image count
              <input type="number" value={fields["imageCount"]}
                onChange={(e) => setField("imageCount", e.target.value)} />
            </label>
            <label>
              Price per image
              <input type="text" value={fields["pricePerImage"]}
                onChange={(e) => setField("pricePerImage", e.target.value)} />
            </label>
            <label>
              Resolution multiplier (optional)
              <input type="text" placeholder="e.g. 1.5" value={fields["resolutionMultiplier"]}
                onChange={(e) => setField("resolutionMultiplier", e.target.value)} />
            </label>
          </div>
        )}

        {unit === "per_request" && (
          <div className="field-grid">
            <label>
              Request count
              <input type="number" value={fields["requestCount"]}
                onChange={(e) => setField("requestCount", e.target.value)} />
            </label>
            <label>
              Price per request
              <input type="text" value={fields["pricePerRequest"]}
                onChange={(e) => setField("pricePerRequest", e.target.value)} />
            </label>
          </div>
        )}

        {unit === "per_second" && (
          <div className="field-grid">
            <label>
              Duration (seconds)
              <input type="number" value={fields["durationSeconds"]}
                onChange={(e) => setField("durationSeconds", e.target.value)} />
            </label>
            <label>
              Price per second
              <input type="text" value={fields["pricePerSecond"]}
                onChange={(e) => setField("pricePerSecond", e.target.value)} />
            </label>
          </div>
        )}

        {error && (
          <div className="error-banner" role="alert"><p>{error}</p></div>
        )}
      </section>

      {/* ── Output cards ───────────────────────────────────────────────────── */}
      {result && (
        <div className="output-cards" aria-label="Cost results">
          <div className="output-card output-card--primary">
            <span className="output-card-label">Total cost</span>
            <strong className="output-card-value">
              {context.currency} {parseFloat(result.totalCost).toFixed(4)}
            </strong>
            <span className="output-card-sub">{result.period}</span>
          </div>

          {result.breakdown.map((line, i) => (
            <div key={i} className="output-card">
              <span className="output-card-label">{line.label}</span>
              <strong className="output-card-value">
                {context.currency} {parseFloat(line.subtotal).toFixed(4)}
              </strong>
              <span className="output-card-sub">
                {line.quantity.toLocaleString()} × {line.unitCost}
              </span>
            </div>
          ))}
        </div>
      )}

      {result && (
        <p className="formula-trace">
          Formulas: {result.formulasApplied.join(", ")}
          {result.warnings.map((w, i) => (
            <span key={i} className="warning-line"> · ⚠ {w}</span>
          ))}
        </p>
      )}

      {/* ── D3 chart ───────────────────────────────────────────────────────── */}
      {chartPayload && chartPayload.series[0]?.points.length > 0 && (
        <section className="panel chart-panel" aria-label="Cost chart">
          <CostChart payload={chartPayload} />
        </section>
      )}
    </div>
  );
}
