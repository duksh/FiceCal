import { useState } from "react";
import { computeAiCost } from "@ficecal/ai-token-economics";
import type { AiCostInput, AiCostResult } from "@ficecal/ai-token-economics";
import type { SharedContext, PricingUnit } from "../types.js";

interface Props {
  context: SharedContext;
}

const PRICING_UNITS: { value: PricingUnit; label: string }[] = [
  { value: "per_1m_tokens", label: "Per 1M tokens" },
  { value: "per_1k_tokens", label: "Per 1K tokens" },
  { value: "per_token", label: "Per token" },
  { value: "per_image", label: "Per image" },
  { value: "per_request", label: "Per request" },
  { value: "per_second", label: "Per second" },
];

function buildInput(unit: PricingUnit, fields: Record<string, string>, currency: string): AiCostInput | null {
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
    // per_second
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

export function CostEstimator({ context }: Props) {
  const [unit, setUnit] = useState<PricingUnit>("per_1m_tokens");
  const [fields, setFields] = useState<Record<string, string>>({
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
  });
  const [result, setResult] = useState<AiCostResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setField(key: string, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function handleCompute() {
    setError(null);
    const input = buildInput(unit, fields, context.currency);
    if (!input) {
      setError("Invalid input — check all required fields.");
      return;
    }
    try {
      setResult(computeAiCost(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Computation error");
    }
  }

  return (
    <div className="panel-stack">
      <section className="panel" aria-label="Cost estimator">
        <h2>Cost Estimator</h2>
        <p className="hint">
          Compute AI inference cost using Decimal.js precision arithmetic.
        </p>

        <div className="field-row">
          <label>
            Pricing unit
            <select value={unit} onChange={(e) => setUnit(e.target.value as PricingUnit)}>
              {PRICING_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {(unit === "per_token" || unit === "per_1k_tokens" || unit === "per_1m_tokens") && (
          <div className="field-grid">
            <label>
              Input tokens
              <input
                type="number"
                value={fields["inputTokens"]}
                onChange={(e) => setField("inputTokens", e.target.value)}
              />
            </label>
            <label>
              Output tokens
              <input
                type="number"
                value={fields["outputTokens"]}
                onChange={(e) => setField("outputTokens", e.target.value)}
              />
            </label>
            <label>
              Input price ({unit === "per_1m_tokens" ? "/1M" : unit === "per_1k_tokens" ? "/1K" : "/token"})
              <input
                type="text"
                value={fields["inputPrice"]}
                onChange={(e) => setField("inputPrice", e.target.value)}
              />
            </label>
            <label>
              Output price (optional, defaults to input price)
              <input
                type="text"
                value={fields["outputPrice"]}
                onChange={(e) => setField("outputPrice", e.target.value)}
              />
            </label>
          </div>
        )}

        {unit === "per_image" && (
          <div className="field-grid">
            <label>
              Image count
              <input
                type="number"
                value={fields["imageCount"]}
                onChange={(e) => setField("imageCount", e.target.value)}
              />
            </label>
            <label>
              Price per image
              <input
                type="text"
                value={fields["pricePerImage"]}
                onChange={(e) => setField("pricePerImage", e.target.value)}
              />
            </label>
            <label>
              Resolution multiplier (optional)
              <input
                type="text"
                placeholder="e.g. 1.5"
                value={fields["resolutionMultiplier"]}
                onChange={(e) => setField("resolutionMultiplier", e.target.value)}
              />
            </label>
          </div>
        )}

        {unit === "per_request" && (
          <div className="field-grid">
            <label>
              Request count
              <input
                type="number"
                value={fields["requestCount"]}
                onChange={(e) => setField("requestCount", e.target.value)}
              />
            </label>
            <label>
              Price per request
              <input
                type="text"
                value={fields["pricePerRequest"]}
                onChange={(e) => setField("pricePerRequest", e.target.value)}
              />
            </label>
          </div>
        )}

        {unit === "per_second" && (
          <div className="field-grid">
            <label>
              Duration (seconds)
              <input
                type="number"
                value={fields["durationSeconds"]}
                onChange={(e) => setField("durationSeconds", e.target.value)}
              />
            </label>
            <label>
              Price per second
              <input
                type="text"
                value={fields["pricePerSecond"]}
                onChange={(e) => setField("pricePerSecond", e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="action-row">
          <button type="button" className="action-button" onClick={handleCompute}>
            Compute cost
          </button>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <p>{error}</p>
          </div>
        )}
      </section>

      {result && (
        <section className="panel result-panel" aria-label="Cost result">
          <h2>Result</h2>
          <div className="metric-row">
            <span>Total cost</span>
            <strong className="metric-value">
              {context.currency} {result.totalCost}
            </strong>
          </div>
          <div className="metric-row">
            <span>Pricing unit</span>
            <code>{result.pricingUnit}</code>
          </div>
          <div className="metric-row">
            <span>Period</span>
            <span>{result.period}</span>
          </div>
          {result.breakdown.length > 0 && (
            <>
              <h3>Breakdown</h3>
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit cost</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((line, i) => (
                    <tr key={i}>
                      <td>{line.label}</td>
                      <td>{line.quantity.toLocaleString()}</td>
                      <td><code>{line.unitCost}</code></td>
                      <td><strong>{line.subtotal}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {result.warnings.length > 0 && (
            <div className="warnings">
              {result.warnings.map((w, i) => (
                <p key={i} className="warning-line">⚠ {w}</p>
              ))}
            </div>
          )}
          <p className="formula-trace">
            Formulas applied: {result.formulasApplied.join(", ")}
          </p>
        </section>
      )}
    </div>
  );
}
