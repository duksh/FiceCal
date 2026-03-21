// ─── CostChart ────────────────────────────────────────────────────────────────
//
// D3-powered chart renderer for ChartPayload from @ficecal/chart-presentation.
// ADR-0001: D3-first chart policy — D3 handles all scale + path computation;
// React owns the component lifecycle and SVG host element.

import { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { ChartPayload } from "@ficecal/chart-presentation";

interface Props {
  payload: ChartPayload;
  width?: number;
  height?: number;
}

const MARGIN = { top: 20, right: 24, bottom: 48, left: 64 };

export function CostChart({ payload, width = 560, height = 280 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  useEffect(() => {
    if (!svgRef.current || !payload.renderable || payload.series.length === 0) return;

    const series = payload.series[0]!;
    const points = series.points;

    // ── Scales ──────────────────────────────────────────────────────────────

    const xScale = d3
      .scaleBand()
      .domain(points.map((p) => p.label))
      .range([0, innerW])
      .padding(0.25);

    const yMax = d3.max(points, (p) => parseFloat(p.value)) ?? 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.15])
      .range([innerH, 0]);

    // ── Clear previous render ────────────────────────────────────────────────

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // ── Gridlines ────────────────────────────────────────────────────────────

    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--fc-accent")
      .trim() || "#38bdf8";

    g.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerW)
          .tickFormat(() => "")
      )
      .call((gEl) => gEl.select(".domain").remove())
      .call((gEl) =>
        gEl.selectAll("line")
          .attr("stroke", "var(--fc-border, #334155)")
          .attr("stroke-dasharray", "3,3")
      );

    // ── Bars ─────────────────────────────────────────────────────────────────

    const barColor = series.colorHint ?? accentColor;

    g.selectAll(".bar")
      .data(points)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.label) ?? 0)
      .attr("y", (d) => yScale(parseFloat(d.value)))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerH - yScale(parseFloat(d.value)))
      .attr("fill", barColor)
      .attr("rx", 4)
      .attr("opacity", 0.9);

    // ── Value labels on bars ──────────────────────────────────────────────────

    g.selectAll(".bar-label")
      .data(points)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => (xScale(d.label) ?? 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(parseFloat(d.value)) - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", "11")
      .attr("fill", "var(--fc-text-muted, #94a3b8)")
      .text((d) => d.displayValue ?? parseFloat(d.value).toFixed(2));

    // ── Axes ─────────────────────────────────────────────────────────────────

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale))
      .call((gEl) => gEl.select(".domain").attr("stroke", "var(--fc-border, #334155)"))
      .call((gEl) =>
        gEl
          .selectAll("text")
          .attr("fill", "var(--fc-text-muted, #94a3b8)")
          .attr("font-size", "11")
      );

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .call((gEl) => gEl.select(".domain").attr("stroke", "var(--fc-border, #334155)"))
      .call((gEl) =>
        gEl
          .selectAll("text")
          .attr("fill", "var(--fc-text-muted, #94a3b8)")
          .attr("font-size", "11")
      );

    // ── Axis labels ───────────────────────────────────────────────────────────

    g.append("text")
      .attr("x", innerW / 2)
      .attr("y", innerH + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "12")
      .attr("fill", "var(--fc-text-muted, #94a3b8)")
      .text(payload.xAxis.label);

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("font-size", "12")
      .attr("fill", "var(--fc-text-muted, #94a3b8)")
      .text(payload.yAxis.label);

  }, [payload, innerW, innerH]);

  if (!payload.renderable) {
    return (
      <div className="chart-placeholder" role="status">
        <p className="chart-placeholder-reason">
          ⚠ {payload.notRenderableReason ?? "Chart unavailable"}
        </p>
        <p className="hint">{payload.accessibility.summary}</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{payload.title}</h3>
        {payload.subtitle && (
          <p className="chart-subtitle">{payload.subtitle}</p>
        )}
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="img"
        aria-label={payload.accessibility.ariaLabel}
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <p className="chart-provenance">
        Formulas: {payload.provenance.formulaIds.join(", ") || "—"} ·{" "}
        {new Date(payload.provenance.generatedAt).toLocaleTimeString()}
        {payload.provenance.isStale && (
          <span className="chart-stale"> ⚠ stale</span>
        )}
      </p>
    </div>
  );
}
