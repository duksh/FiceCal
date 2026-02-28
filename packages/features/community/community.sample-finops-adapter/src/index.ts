export type SampleAdapterInput = {
  sourceProvider: string;
  sourcePayload: Array<{ service?: string; cost?: number }>;
};

export type SampleAdapterOutput = {
  normalizedLineItems: Array<{ service: string; cost: number }>;
  mappingCoveragePct: number;
};

export function normalizeSampleFinOpsPayload(input: SampleAdapterInput): SampleAdapterOutput {
  const rows = Array.isArray(input.sourcePayload) ? input.sourcePayload : [];

  const normalizedLineItems = rows
    .filter((row) => typeof row?.cost === "number" && Number.isFinite(row.cost))
    .map((row) => ({
      service: typeof row.service === "string" && row.service.trim() ? row.service : "unknown-service",
      cost: Number(row.cost),
    }));

  const mappingCoveragePct = rows.length === 0 ? 0 : Math.round((normalizedLineItems.length / rows.length) * 100);

  return {
    normalizedLineItems,
    mappingCoveragePct,
  };
}
