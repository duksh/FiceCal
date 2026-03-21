// ─── BillingRegistry ───────────────────────────────────────────────────────────
//
// Manages plugin-contributed billing fixtures and adapters.

import type { BillingFixtureContribution, BillingAdapterContribution } from "./types.js";
import { PluginRegistrationError } from "./types.js";

export class BillingRegistry {
  private readonly fixtures = new Map<string, BillingFixtureContribution>();
  private readonly adapters = new Map<string, BillingAdapterContribution>();

  registerFixture(fixture: BillingFixtureContribution, pluginId = "unknown"): void {
    if (this.fixtures.has(fixture.provider)) {
      throw new PluginRegistrationError(
        "DUPLICATE_BILLING_FIXTURE",
        `Billing fixture for provider "${fixture.provider}" is already registered.`,
        pluginId,
      );
    }
    this.fixtures.set(fixture.provider, fixture);
  }

  registerAdapter(adapter: BillingAdapterContribution, pluginId = "unknown"): void {
    if (this.adapters.has(adapter.provider)) {
      throw new PluginRegistrationError(
        "DUPLICATE_BILLING_ADAPTER",
        `Billing adapter for provider "${adapter.provider}" is already registered.`,
        pluginId,
      );
    }
    this.adapters.set(adapter.provider, adapter);
  }

  getFixture(provider: string): BillingFixtureContribution | undefined {
    return this.fixtures.get(provider);
  }

  getAdapter(provider: string): BillingAdapterContribution | undefined {
    return this.adapters.get(provider);
  }

  listFixtures(): BillingFixtureContribution[] {
    return [...this.fixtures.values()];
  }

  listAdapters(): BillingAdapterContribution[] {
    return [...this.adapters.values()];
  }

  /** Providers for which both a fixture and adapter are registered. */
  get readyProviders(): string[] {
    return [...this.fixtures.keys()].filter((p) => this.adapters.has(p));
  }
}
