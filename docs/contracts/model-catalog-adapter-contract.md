# Model Catalog Adapter Contract

**Contract ID:** `integrations.duksh-models-adapter`
**Version:** 0.1.0
**Status:** Experimental
**Owner:** @duksh
**Last updated:** 2026-03-20

---

## Purpose

The `duksh-models-adapter` normalises AI model pricing data from the
[ficecal-model-lens](https://github.com/duksh/ficecal-model-lens) upstream catalog
into canonical `ModelPricingReference` records for consumption by FiceCal v2's
economics and recommendation modules.

---

## Source

| Property | Value |
|---|---|
| Upstream repo | `github.com/duksh/ficecal-model-lens` |
| Source artifact | `public/data.json` (refreshed daily by scraper) |
| Schema type | `DataFormat` (defined in `src/dataFormat.d.ts` of upstream) |
| Ingestion method | URL fetch or direct content injection (for tests) |

---

## Output contract

One `ModelPricingReference` record is emitted per **model × vendor × region × resolution**.

```typescript
ModelPricingReference {
  // Identity
  modelId: string          // slug, e.g. "gpt-4o"
  cleanName: string        // display, e.g. "GPT-4o"
  company: string          // e.g. "OpenAI"
  companyCountryCode: string
  vendorRef: string        // e.g. "openai", "aws", "azure", "gcp"
  regionCode: string       // e.g. "global", "us-east-1", "eastus"

  // Provenance
  sourceCatalog: "duksh-models"
  sourceVersion: string    // sha256(data.json)[0:12]@YYYY-MM-DD
  effectiveAt: string      // YYYY-MM-DD

  // Pricing
  pricingUnit: "1M_tokens" | "per_image"
  pricingSourceType: "dynamic" | "hardcoded" | "verified"
  priceVerifiedAt?: string // only on hardcoded image records

  // Token pricing (pricingUnit !== "per_image")
  inputTokenCost?: number
  outputTokenCost?: number
  cachedInputTokenCost?: number | null
  cachedOutputTokenCost?: number | null

  // Image pricing (pricingUnit === "per_image")
  imageOutputCost?: number
  resolution?: string

  // Capabilities
  maxInputTokens?: number
  maxOutputTokens?: number
  reasoning: boolean
  selfhostable: boolean

  // Benchmarks (approved keys only)
  benchmarkScores?: Partial<Record<ApprovedBenchmarkKey, number>>
}
```

---

## Transformation rules

### Source type mapping

| `priceSource` (upstream) | `pricingSourceType` (canonical) |
|---|---|
| `scraped` | `dynamic` |
| `litellm` | `dynamic` |
| `hardcoded` | `hardcoded` |

### Benchmark key gate

Only keys listed in `APPROVED_BENCHMARKS` pass through. All others are silently
stripped and counted in `strippedBenchmarkCount`. The approved list is:

- `swe_bench_verified`
- `mmlu`
- `humaneval`
- `gpqa_diamond`
- `math_500`
- `aime_2024`

Adding a key requires a PR to `packages/schemas/model-catalog/index.ts`.

### Image models

- Token cost fields (`inputTokenCost`, `outputTokenCost`, etc.) **must be absent**
- `imageOutputCost` and `resolution` **must be present**
- One record is emitted **per resolution tier** per vendor × region

### Skipped records

Records are skipped (counted in `skippedCount`) when:
- Token model: `inputTokenCost` or `outputTokenCost` is zero/missing
- Image model: `pricePerImage` is zero/missing

A warning string is appended to `warnings[]` for each skipped record.

---

## Snapshot versioning

```
sourceVersion = sha256(data.json content)[0:12] + "@" + YYYY-MM-DD
```

- Hash is content-addressed: identical content → identical version
- Callers may skip re-ingestion if `sourceVersion` matches the last processed snapshot
- Parse with `parseSourceVersion(version)` from `src/snapshot.ts`
- Staleness check: `sourceVersionAgeInDays(version)` — warn if > 7 days

---

## Failure posture

| Condition | Behaviour |
|---|---|
| URL fetch fails (non-2xx) | Throws with HTTP status in message |
| JSON parse error | Throws with parse error detail |
| Missing pricing fields | Record skipped, counted in `skippedCount`, warning appended |
| Unapproved benchmark key | Key stripped, counted in `strippedBenchmarkCount` |
| Empty `data.json` (no models) | Returns empty `records[]`, no error |

---

## Consumer guidance

- `ai-token-economics`: dispatch on `pricingUnit`; use `inputTokenCost` / `outputTokenCost` for token records, `imageOutputCost` for image records
- `recommendation-module`: when comparing records of mixed `pricingSourceType`, surface the reliability difference to the user — never silently rank `hardcoded` against `dynamic`
- UI badge rules:
  - `dynamic` → "↻ Live pricing"
  - `hardcoded` + fresh (`priceVerifiedAt` < 30 days) → "⚠ Manually maintained · Verified [date]"
  - `hardcoded` + stale (≥ 30 days) → "⚠ Unverified (N days old)"
  - `verified` → "✓ Verified [date]"

---

## Files

| Path | Purpose |
|---|---|
| `packages/schemas/model-catalog/index.ts` | Canonical type definitions |
| `packages/integrations/models-pricing/src/index.ts` | Adapter entry point |
| `packages/integrations/models-pricing/src/transform.ts` | DataFormat → ModelPricingReference |
| `packages/integrations/models-pricing/src/snapshot.ts` | Version computation |
| `packages/integrations/models-pricing/tests/adapter.test.ts` | Fixture-based tests |
| `packages/integrations/models-pricing/tests/fixtures/sample-data.json` | Test fixture |
