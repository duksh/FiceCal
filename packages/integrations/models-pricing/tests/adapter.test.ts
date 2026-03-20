/**
 * duksh-models-adapter — fixture-based unit tests
 *
 * All tests use deterministic fixture data (no live network calls).
 * Tests must pass in CI without any credentials or external access.
 */

import { strict as assert } from "assert";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { ingestModelCatalog } from "../src/index.js";
import { computeSourceVersion, parseSourceVersion, sourceVersionAgeInDays } from "../src/snapshot.js";
import { APPROVED_BENCHMARKS } from "../../../schemas/model-catalog/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, "fixtures", "sample-data.json");
const fixtureContent = readFileSync(FIXTURE_PATH, "utf-8");
const FIXED_DATE = "2026-03-20T10:00:00.000Z";

// ─── Snapshot versioning ─────────────────────────────────────────────────────

{
  const version = computeSourceVersion(fixtureContent, new Date(FIXED_DATE));
  assert.match(version, /^[0-9a-f]{12}@2026-03-20$/, "sourceVersion matches expected format");

  const parsed = parseSourceVersion(version);
  assert.ok(parsed, "sourceVersion is parseable");
  assert.equal(parsed!.date, "2026-03-20");
  assert.equal(parsed!.hash.length, 12);

  const age = sourceVersionAgeInDays(version, new Date(FIXED_DATE));
  assert.equal(age, 0, "age is 0 on day of creation");

  // Determinism: same content → same hash
  const version2 = computeSourceVersion(fixtureContent, new Date(FIXED_DATE));
  assert.equal(version, version2, "sourceVersion is deterministic");

  console.log("✓ snapshot versioning");
}

// ─── Ingestion — token models ────────────────────────────────────────────────

{
  const result = await ingestModelCatalog({
    dataJsonContent: fixtureContent,
    ingestedAt: FIXED_DATE,
  });

  assert.ok(result.records.length > 0, "produces records");
  assert.equal(result.skippedCount, 0, "no skipped records in valid fixture");

  const gpt4o = result.records.find((r) => r.modelId === "gpt-4o");
  assert.ok(gpt4o, "gpt-4o record present");
  assert.equal(gpt4o!.pricingUnit, "1M_tokens");
  assert.equal(gpt4o!.pricingSourceType, "dynamic");
  assert.equal(gpt4o!.vendorRef, "openai");
  assert.equal(gpt4o!.regionCode, "global");
  assert.equal(gpt4o!.inputTokenCost, 0.0000025);
  assert.equal(gpt4o!.outputTokenCost, 0.00001);
  assert.equal(gpt4o!.cachedInputTokenCost, undefined);
  assert.equal(gpt4o!.sourceCatalog, "duksh-models");
  assert.match(gpt4o!.sourceVersion, /^[0-9a-f]{12}@2026-03-20$/);

  // Cached pricing
  const claude = result.records.find((r) => r.modelId === "claude-3-5-sonnet-20241022");
  assert.ok(claude, "claude record present");
  assert.equal(claude!.cachedInputTokenCost, 0.0000003);
  assert.equal(claude!.cachedOutputTokenCost, undefined);

  console.log("✓ token model ingestion");
}

// ─── Ingestion — image models ────────────────────────────────────────────────

{
  const result = await ingestModelCatalog({
    dataJsonContent: fixtureContent,
    ingestedAt: FIXED_DATE,
  });

  const imageRecords = result.records.filter((r) => r.pricingUnit === "per_image");
  assert.ok(imageRecords.length >= 2, "image model records present (one per resolution)");

  const dalle1024 = imageRecords.find((r) => r.resolution === "1024x1024");
  assert.ok(dalle1024, "DALL-E 3 1024x1024 record present");
  assert.equal(dalle1024!.pricingSourceType, "hardcoded");
  assert.equal(dalle1024!.priceVerifiedAt, "2026-03-20");
  assert.equal(dalle1024!.imageOutputCost, 0.04);
  assert.equal(dalle1024!.inputTokenCost, undefined, "no token costs on image record");
  assert.equal(dalle1024!.outputTokenCost, undefined, "no token costs on image record");

  console.log("✓ image model ingestion");
}

// ─── Benchmark stripping ─────────────────────────────────────────────────────

{
  const result = await ingestModelCatalog({
    dataJsonContent: fixtureContent,
    ingestedAt: FIXED_DATE,
  });

  const gpt4o = result.records.find((r) => r.modelId === "gpt-4o");
  if (gpt4o?.benchmarkScores) {
    const keys = Object.keys(gpt4o.benchmarkScores);
    for (const key of keys) {
      assert.ok(
        (APPROVED_BENCHMARKS as readonly string[]).includes(key),
        `benchmark key "${key}" must be in APPROVED_BENCHMARKS`
      );
    }
  }

  console.log("✓ benchmark key enforcement");
}

// ─── Source version consistency ───────────────────────────────────────────────

{
  const result = await ingestModelCatalog({
    dataJsonContent: fixtureContent,
    ingestedAt: FIXED_DATE,
  });

  for (const record of result.records) {
    assert.equal(
      record.sourceVersion,
      result.sourceVersion,
      `every record carries the same sourceVersion`
    );
    assert.equal(record.effectiveAt, "2026-03-20", "effectiveAt derived from ingestedAt");
  }

  console.log("✓ sourceVersion consistency across all records");
}

console.log("\n✅ All duksh-models-adapter tests passed.");
