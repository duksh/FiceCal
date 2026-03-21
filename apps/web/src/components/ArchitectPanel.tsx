import type { SharedContext } from "../types.js";

interface Props {
  context: SharedContext;
}

const PACKAGE_GRAPH = [
  {
    id: "core-economics",
    status: "active",
    phase: 1,
    provides: ["cost-compute", "forex", "period-normalize"],
    dependsOn: [],
  },
  {
    id: "schemas",
    status: "active",
    phase: 0,
    provides: ["model-pricing-schema"],
    dependsOn: [],
  },
  {
    id: "integrations",
    status: "active",
    phase: 0,
    provides: ["model-pricing-data"],
    dependsOn: ["schemas"],
  },
  {
    id: "schemas.normalized-cost-record",
    status: "active",
    phase: 1,
    provides: ["billing-record-contract"],
    dependsOn: [],
  },
  {
    id: "chart-presentation",
    status: "active",
    phase: 2,
    provides: ["chart-payload"],
    dependsOn: ["core-economics"],
  },
  {
    id: "health-score",
    status: "active",
    phase: 2,
    provides: ["health-signals"],
    dependsOn: [],
  },
  {
    id: "recommendation-module",
    status: "active",
    phase: 2,
    provides: ["recommendations"],
    dependsOn: ["health-score"],
  },
  {
    id: "ai-token-economics",
    status: "active",
    phase: 2,
    provides: ["ai-cost-compute"],
    dependsOn: ["core-economics"],
  },
  {
    id: "feature-registry",
    status: "active",
    phase: 3,
    provides: ["plugin-registration"],
    dependsOn: [],
  },
  {
    id: "mcp-tooling",
    status: "active",
    phase: 3,
    provides: ["mcp-tool-registry", "economics-tools"],
    dependsOn: ["feature-registry", "core-economics", "ai-token-economics", "health-score", "recommendation-module"],
  },
];

const PHASE_TAGS: Record<number, string> = {
  0: "Phase 0 — baseline",
  1: "Phase 1 — economics kernel",
  2: "Phase 2 — module hardening",
  3: "Phase 3 — registry & tooling",
};

const ADR_ENTRIES = [
  { id: "ADR-0001", title: "D3-first chart rendering policy", status: "accepted" },
  { id: "ADR-0002", title: "Decimal.js for all monetary arithmetic", status: "accepted" },
  { id: "ADR-0003", title: "ForexRateProvider as injected named dependency", status: "accepted" },
  { id: "ADR-0004", title: "Formula registry for cost computation traceability", status: "accepted" },
];

export function ArchitectPanel({ context }: Props) {
  return (
    <div className="panel-stack">
      {/* ── Context trace ────────────────────────────────────────── */}
      <section className="panel" aria-label="Context trace">
        <h2>Context Trace</h2>
        <ul className="status-list">
          <li>
            <span className="label">Workspace</span>
            <code>{context.workspaceId}</code>
          </li>
          <li>
            <span className="label">Period</span>
            <span>{context.startDate} → {context.endDate}</span>
          </li>
          <li>
            <span className="label">Currency</span>
            <code>{context.currency}</code>
          </li>
          <li>
            <span className="label">Contract version</span>
            <code>mcp=2.0 / feature-catalog=1.3.0</code>
          </li>
          <li>
            <span className="label">Phase exit tags</span>
            <span>v2.0.0-phase-0-exit · v2.0.0-phase-1-exit · v2.0.0-phase-2-exit</span>
          </li>
        </ul>
      </section>

      {/* ── Package graph ─────────────────────────────────────────── */}
      <section className="panel" aria-label="Package dependency graph">
        <h2>Package Graph</h2>
        {Object.entries(PHASE_TAGS).map(([phase, label]) => {
          const pkgs = PACKAGE_GRAPH.filter((p) => p.phase === Number(phase));
          if (pkgs.length === 0) return null;
          return (
            <div key={phase} className="phase-group">
              <h3 className="phase-label">{label}</h3>
              <ul className="pkg-list">
                {pkgs.map((pkg) => (
                  <li key={pkg.id} className="pkg-item">
                    <div className="pkg-header">
                      <code className="pkg-id">{pkg.id}</code>
                      <span className="status-dot status-dot--active" aria-label="active" />
                    </div>
                    <div className="pkg-meta">
                      <span>Provides: {pkg.provides.join(", ")}</span>
                      {pkg.dependsOn.length > 0 && (
                        <span>Depends on: {pkg.dependsOn.join(", ")}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* ── ADRs ──────────────────────────────────────────────────── */}
      <section className="panel" aria-label="Architecture decision records">
        <h2>Architecture Decisions</h2>
        <ul className="adr-list">
          {ADR_ENTRIES.map((adr) => (
            <li key={adr.id} className="adr-item">
              <code>{adr.id}</code>
              <span>{adr.title}</span>
              <span className="adr-status">{adr.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
