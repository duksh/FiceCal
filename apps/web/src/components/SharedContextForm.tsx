import type { SharedContext } from "../types.js";

interface Props {
  context: SharedContext;
  onChange: (ctx: SharedContext) => void;
}

const CURRENCIES = ["USD", "EUR", "GBP", "MUR", "CAD", "AUD", "JPY", "CHF", "INR", "SGD"];

export function SharedContextForm({ context, onChange }: Props) {
  function update<K extends keyof SharedContext>(key: K, value: SharedContext[K]) {
    onChange({ ...context, [key]: value });
  }

  return (
    <section className="panel" aria-label="Shared context">
      <h2>Shared Context</h2>
      <form className="context-grid" noValidate onSubmit={(e) => e.preventDefault()}>
        <label>
          Workspace ID
          <input
            type="text"
            value={context.workspaceId}
            onChange={(e) => update("workspaceId", e.target.value)}
            required
          />
        </label>
        <label>
          Start date
          <input
            type="date"
            value={context.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            required
          />
        </label>
        <label>
          End date
          <input
            type="date"
            value={context.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            required
          />
        </label>
        <label>
          Currency
          <select
            value={context.currency}
            onChange={(e) => update("currency", e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </form>
    </section>
  );
}
