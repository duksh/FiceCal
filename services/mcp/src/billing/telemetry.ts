import { McpRequestContext } from "../mcp";
import { BillingAdapterId, BillingCanonicalHandoff } from "./types";

export type BillingTelemetryEventName = "billing.run" | "billing.mapping.summary";

export type BillingTelemetryEvent = {
  eventName: BillingTelemetryEventName;
  timestamp: string;
  adapterId: BillingAdapterId;
  integrationRunId: string;
  requestId: string;
  traceId: string;
  workspaceId: string;
  mode: McpRequestContext["mode"];
  status?: "success" | "failed";
  durationMs?: number;
  usedFallback?: boolean;
  errorCode?: string;
  mappingSummary?: {
    infraTotal: number;
    cudPct: number;
    budgetCap: number;
    nRef: number;
    mappingConfidence: BillingCanonicalHandoff["provenance"]["mappingConfidence"];
    coveragePct: number;
  };
};

const telemetryStore: BillingTelemetryEvent[] = [];

export function emitBillingTelemetryEvent(event: BillingTelemetryEvent): void {
  telemetryStore.push(event);
}

export function listBillingTelemetryEvents(): BillingTelemetryEvent[] {
  return [...telemetryStore];
}

export function resetBillingTelemetryEvents(): void {
  telemetryStore.length = 0;
}
