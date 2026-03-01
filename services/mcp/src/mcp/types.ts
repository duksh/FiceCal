export type McpMode = "quick" | "operator" | "architect";

export type McpActor = "human" | "agent" | "system";

export type McpTimeRange = {
  start: string;
  end: string;
  tz: string;
};

export type McpContractVersions = {
  mcp: string;
  tool: string;
  fixture: string;
};

export type McpRequestContext = {
  requestId: string;
  traceId: string;
  mode: McpMode;
  workspaceId: string;
  actor: McpActor;
  timeRange: McpTimeRange;
  contractVersions: McpContractVersions;
  featureFlags: string[];
};

export type McpToolEnvelope<TInput> = {
  context: McpRequestContext;
  input: TInput;
};

export type McpCapabilitiesNamespace = {
  namespace: string;
  version: string;
  tools: string[];
  ownerTeam: string;
  stability: string;
};

export type McpCapabilitiesResponse = {
  mcpVersion: string;
  schemaVersion: string;
  toolNamespaces: McpCapabilitiesNamespace[];
  compatibility: {
    legacyAliasesEnabled: boolean;
    aliasNamespace: string;
    parityFixtureVersion: string;
  };
  featureFlags: string[];
};
