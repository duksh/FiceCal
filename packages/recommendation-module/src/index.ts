export type {
  Recommendation,
  RecommendationAudience,
  RecommendationPriority,
  RecommendationResult,
  RecommendationRule,
} from "./types.js";

export { RECOMMENDATION_RULES } from "./rules.js";
export { computeRecommendations } from "./engine.js";
export type { ComputeRecommendationsOptions } from "./engine.js";
