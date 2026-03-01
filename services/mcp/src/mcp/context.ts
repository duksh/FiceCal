import { McpRequestContext } from "./types";

const DEFAULT_TZ = "UTC";
const DEFAULT_RANGE_START = "1970-01-01";
const DEFAULT_RANGE_END = "1970-01-01";

export function createDefaultMcpContext(seed?: {
  requestId?: string;
  traceId?: string;
}): McpRequestContext {
  const requestId = seed?.requestId?.trim() || "mcp-req-unknown";
  const traceId = seed?.traceId?.trim() || requestId;

  return {
    requestId,
    traceId,
    mode: "operator",
    workspaceId: "default",
    actor: "system",
    timeRange: {
      start: DEFAULT_RANGE_START,
      end: DEFAULT_RANGE_END,
      tz: DEFAULT_TZ,
    },
    contractVersions: {
      mcp: "2.0",
      tool: "1.0",
      fixture: "1.0",
    },
    featureFlags: [],
  };
}

export function validateMcpContext(context: McpRequestContext): McpRequestContext {
  if (!context.requestId || !context.traceId) {
    throw new Error("Invalid MCP context: requestId and traceId are required");
  }
  if (!context.workspaceId) {
    throw new Error("Invalid MCP context: workspaceId is required");
  }
  if (!context.timeRange?.start || !context.timeRange?.end || !context.timeRange?.tz) {
    throw new Error("Invalid MCP context: timeRange.start/end/tz are required");
  }
  if (!context.contractVersions?.mcp || !context.contractVersions?.tool || !context.contractVersions?.fixture) {
    throw new Error("Invalid MCP context: contractVersions.mcp/tool/fixture are required");
  }
  if (!Array.isArray(context.featureFlags)) {
    throw new Error("Invalid MCP context: featureFlags must be an array");
  }

  return context;
}
