import type { ForexRateProvider, ForexRates } from "./types.js";

export class StaticForexAdapter implements ForexRateProvider {
  private readonly fixture: ForexRates;

  constructor(fixture: ForexRates) {
    this.fixture = fixture;
  }

  async getRates(_baseCurrency: string, _asOf?: Date): Promise<ForexRates> {
    return this.fixture;
  }

  getAgeInDays(relativeTo?: Date): number | null {
    const ref = relativeTo ?? new Date();
    const fixtureDate = new Date(this.fixture.asOf);
    const diffMs = ref.getTime() - fixtureDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
