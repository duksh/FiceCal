/**
 * duksh-models-adapter
 *
 * Ingests a data.json snapshot from ficecal-model-lens and emits
 * canonical ModelPricingReference records for use in FiceCal v2
 * economics and recommendation modules.
 *
 * Usage:
 *   const result = await ingestModelCatalog({ dataJsonUrl: "..." })
 *   // or
 *   const result = await ingestModelCatalog({ dataJsonContent: rawString })
 */

import { type ModelCatalogIngestResult } from "../.././../schemas/model-catalog/index.js";
import { computeSourceVersion } from "./snapshot.js";
import { transformDataFormat, type RawDataFormat } from "./transform.js";

export type ModelCatalogIngestInput =
  | { dataJsonUrl: string; dataJsonContent?: never; ingestedAt?: string }
  | { dataJsonContent: string; dataJsonUrl?: never; ingestedAt?: string };

/**
 * Ingest a ficecal-model-lens data.json snapshot.
 *
 * Accepts either a URL (fetched at call time) or raw JSON string content
 * (useful for testing with fixture files).
 *
 * @throws if the URL fetch fails or the JSON cannot be parsed
 */
export async function ingestModelCatalog(
  input: ModelCatalogIngestInput
): Promise<ModelCatalogIngestResult> {
  const ingestedAt = input.ingestedAt ?? new Date().toISOString();

  // ── Resolve content ──────────────────────────────────────────────────────
  let content: string;
  if (input.dataJsonContent != null) {
    content = input.dataJsonContent;
  } else {
    const res = await fetch(input.dataJsonUrl);
    if (!res.ok) {
      throw new Error(
        `[duksh-models-adapter] Failed to fetch data.json: ${res.status} ${res.statusText} (url: ${input.dataJsonUrl})`
      );
    }
    content = await res.text();
  }

  // ── Parse ────────────────────────────────────────────────────────────────
  let raw: RawDataFormat;
  try {
    raw = JSON.parse(content) as RawDataFormat;
  } catch (err) {
    throw new Error(
      `[duksh-models-adapter] Failed to parse data.json: ${(err as Error).message}`
    );
  }

  // ── Version ──────────────────────────────────────────────────────────────
  const sourceVersion = computeSourceVersion(content, new Date(ingestedAt));

  // ── Transform ────────────────────────────────────────────────────────────
  const { records, skippedCount, strippedBenchmarkCount, warnings } = transformDataFormat(
    raw,
    sourceVersion,
    ingestedAt
  );

  return {
    sourceVersion,
    ingestedAt,
    records,
    skippedCount,
    strippedBenchmarkCount,
    warnings,
  };
}

// Re-export schema types for consumers
export type { ModelPricingReference, ModelCatalogIngestResult, ApprovedBenchmarkKey, PricingSourceType, PricingUnit } from "../.././../schemas/model-catalog/index.js";
export { APPROVED_BENCHMARKS } from "../.././../schemas/model-catalog/index.js";
export { computeSourceVersion, parseSourceVersion, sourceVersionAgeInDays } from "./snapshot.js";
