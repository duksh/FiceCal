// ─── MCP Transport Context ────────────────────────────────────────────────────
//
// Builds a McpRequestContext from incoming HTTP headers + body fields.
// Generates a requestId when none is provided by the caller.

import { randomUUID } from "node:crypto";
import type { McpRequestContext } from "@ficecal/mcp-tooling";

interface InboundHeaders {
  "x-request-id"?: string;
  "x-trace-id"?: string;
  "x-workspace-id"?: string;
  "x-mcp-mode"?: string;
  "x-mcp-actor"?: string;
}

export function buildRequestContext(
  headers: InboundHeaders,
  body: {
    timeRange?: { start?: string; end?: string; tz?: string };
    featureFlags?: string[];
    contractVersions?: { mcp?: string; tool?: string; fixture?: string };
  } = {}
): McpRequestContext {
  const requestId = headers["x-request-id"] ?? randomUUID();
  const traceId = headers["x-trace-id"] ?? requestId;
  const workspaceId = headers["x-workspace-id"] ?? "default";
  const mode = (headers["x-mcp-mode"] ?? "operator") as McpRequestContext["mode"];
  const actor = (headers["x-mcp-actor"] ?? "human") as McpRequestContext["actor"];

  return {
    requestId,
    traceId,
    mode,
    workspaceId,
    actor,
    timeRange: {
      start: body.timeRange?.start ?? new Date().toISOString().slice(0, 10),
      end: body.timeRange?.end ?? new Date().toISOString().slice(0, 10),
      tz: body.timeRange?.tz ?? "UTC",
    },
    contractVersions: {
      mcp: body.contractVersions?.mcp ?? "2.0",
      tool: body.contractVersions?.tool ?? "1.0",
      fixture: body.contractVersions?.fixture ?? "1.0",
    },
    featureFlags: body.featureFlags ?? [],
  };
}
