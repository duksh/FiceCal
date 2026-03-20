/**
 * Transform duksh-models DataFormat → ModelPricingReference[]
 *
 * Rules enforced here:
 * - Token cost fields are omitted on image records
 * - imageOutputCost is only set on image records
 * - Only APPROVED_BENCHMARKS keys pass through
 * - priceSource "scraped"|"litellm" → pricingSourceType "dynamic"
 * - priceSource "hardcoded" → pricingSourceType "hardcoded"
 * - Records missing required pricing fields are skipped (counted)
 */

import {
  APPROVED_BENCHMARKS,
  type ModelPricingReference,
  type PricingSourceType,
} from "../.././../schemas/model-catalog/index.js";

// ─── Minimal DataFormat types (mirrors duksh/ficecal-model-lens) ─────────────

type RawImagePricingTier = {
  resolution: string;
  pricePerImage: number;
};

type RawImageVendor = {
  vendorRef: string;
  regionPricing: Record<string, RawImagePricingTier[]>;
  latencyMs: number;
  lowCapacity: boolean;
  priceSource: string;
  priceVerifiedAt?: string;
};

type RawImageModel = {
  cleanName: string;
  company: string;
  companyCountryCode: string;
  vendors: RawImageVendor[];
  selfhostable: boolean;
  supportedResolutions: string[];
  supportsNegativePrompts: boolean;
};

type RawVendor = {
  vendorRef: string;
  regionPricing: Record<string, [number, number, number | null, number | null]>;
  latencyMs: number;
  tokensPerSecond: number;
  lowCapacity: boolean;
  priceSource: string;
};

type RawModel = {
  cleanName: string;
  company: string;
  companyCountryCode: string;
  vendors: RawVendor[];
  selfhostable: boolean;
  reasoning: boolean;
  maxInputTokens?: number;
  maxOutputTokens?: number;
  humanitysLastExamPercentage?: number;
  sweBenchResolvedPercentage?: number;
  skatebenchScore?: number;
};

export type RawDataFormat = {
  scrapedAt: string;
  models: Record<string, RawModel>;
  imageModels?: Record<string, RawImageModel>;
};

// ─── Source type mapping ──────────────────────────────────────────────────────

function mapPricingSourceType(priceSource: string): PricingSourceType {
  if (priceSource === "hardcoded") return "hardcoded";
  return "dynamic"; // "scraped" | "litellm" | anything else
}

// ─── Benchmark stripping ──────────────────────────────────────────────────────

function extractBenchmarks(
  raw: RawModel
): { scores: Partial<Record<string, number>>; strippedCount: number } {
  const candidates: Record<string, number | undefined> = {
    swe_bench_verified: raw.sweBenchResolvedPercentage,
    humanitys_last_exam: raw.humanitysLastExamPercentage,
    skatebench: raw.skatebenchScore,
  };

  let strippedCount = 0;
  const scores: Partial<Record<string, number>> = {};

  for (const [key, value] of Object.entries(candidates)) {
    if (value == null) continue;
    if ((APPROVED_BENCHMARKS as readonly string[]).includes(key)) {
      scores[key] = value;
    } else {
      strippedCount++;
    }
  }

  return { scores, strippedCount };
}

// ─── Transform result ────────────────────────────────────────────────────────

export type TransformResult = {
  records: ModelPricingReference[];
  skippedCount: number;
  strippedBenchmarkCount: number;
  warnings: string[];
};

// ─── Main transform ──────────────────────────────────────────────────────────

export function transformDataFormat(
  raw: RawDataFormat,
  sourceVersion: string,
  ingestedAt: string
): TransformResult {
  const records: ModelPricingReference[] = [];
  let skippedCount = 0;
  let strippedBenchmarkCount = 0;
  const warnings: string[] = [];
  const effectiveAt = ingestedAt.slice(0, 10);

  // ── LLM / text models ────────────────────────────────────────────────────
  for (const [modelId, model] of Object.entries(raw.models ?? {})) {
    const { scores, strippedCount } = extractBenchmarks(model);
    strippedBenchmarkCount += strippedCount;

    for (const vendor of model.vendors) {
      for (const [regionCode, pricing] of Object.entries(vendor.regionPricing)) {
        const [inputTokenCost, outputTokenCost, cachedInput, cachedOutput] = pricing;

        if (!inputTokenCost || !outputTokenCost) {
          skippedCount++;
          warnings.push(
            `Skipped ${modelId}@${vendor.vendorRef}/${regionCode}: missing token costs`
          );
          continue;
        }

        records.push({
          modelId,
          cleanName: model.cleanName,
          company: model.company,
          companyCountryCode: model.companyCountryCode,
          vendorRef: vendor.vendorRef,
          regionCode,
          sourceCatalog: "duksh-models",
          sourceVersion,
          effectiveAt,
          pricingUnit: "1M_tokens",
          pricingSourceType: mapPricingSourceType(vendor.priceSource),
          inputTokenCost,
          outputTokenCost,
          cachedInputTokenCost: cachedInput ?? undefined,
          cachedOutputTokenCost: cachedOutput ?? undefined,
          maxInputTokens: model.maxInputTokens,
          maxOutputTokens: model.maxOutputTokens,
          reasoning: model.reasoning,
          selfhostable: model.selfhostable,
          benchmarkScores:
            Object.keys(scores).length > 0
              ? (scores as Partial<Record<import("../.././../schemas/model-catalog/index.js").ApprovedBenchmarkKey, number>>)
              : undefined,
        });
      }
    }
  }

  // ── Image models ─────────────────────────────────────────────────────────
  for (const [modelId, model] of Object.entries(raw.imageModels ?? {})) {
    for (const vendor of model.vendors) {
      for (const [regionCode, tiers] of Object.entries(vendor.regionPricing)) {
        for (const tier of tiers) {
          if (!tier.pricePerImage) {
            skippedCount++;
            warnings.push(
              `Skipped image ${modelId}@${vendor.vendorRef}/${regionCode}/${tier.resolution}: missing pricePerImage`
            );
            continue;
          }

          records.push({
            modelId,
            cleanName: model.cleanName,
            company: model.company,
            companyCountryCode: model.companyCountryCode,
            vendorRef: vendor.vendorRef,
            regionCode,
            sourceCatalog: "duksh-models",
            sourceVersion,
            effectiveAt,
            pricingUnit: "per_image",
            pricingSourceType: mapPricingSourceType(vendor.priceSource),
            priceVerifiedAt: vendor.priceVerifiedAt,
            imageOutputCost: tier.pricePerImage,
            resolution: tier.resolution,
            reasoning: false,
            selfhostable: model.selfhostable,
          });
        }
      }
    }
  }

  return { records, skippedCount, strippedBenchmarkCount, warnings };
}
