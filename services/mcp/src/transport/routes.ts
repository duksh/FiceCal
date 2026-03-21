// ─── MCP Fastify Routes ───────────────────────────────────────────────────────
//
// Three route groups mounted at /mcp/v1:
//
//   GET  /mcp/v1/health                 → service liveness check
//   GET  /mcp/v1/capabilities           → tool manifest (per McpCapabilitiesManifest)
//   POST /mcp/v1/tools/:toolId/call     → tool invocation
//
// All tool calls carry the full McpToolEnvelope and return McpToolResult.

import type { FastifyInstance } from "fastify";
import { getToolRegistry } from "./registry.js";
import { buildRequestContext } from "./context.js";
import { makeError } from "./errors.js";

export async function registerMcpRoutes(app: FastifyInstance): Promise<void> {
  const BASE = "/mcp/v1";

  // ── Health ──────────────────────────────────────────────────────────────────

  app.get(`${BASE}/health`, async (_req, reply) => {
    const registry = getToolRegistry();
    return reply.code(200).send({
      status: "ok",
      service: "@ficecal/service-mcp",
      version: "0.6.0",
      phase: 6,
      toolCount: registry.list().length,
      namespaces: registry.namespaces(),
      timestamp: new Date().toISOString(),
    });
  });

  // ── Capabilities ────────────────────────────────────────────────────────────

  app.get(`${BASE}/capabilities`, async (_req, reply) => {
    const registry = getToolRegistry();
    const manifest = registry.getCapabilities({
      mcpVersion: "2.0",
      schemaVersion: new Date().toISOString().slice(0, 10),
      legacyAliasesEnabled: false,
    });
    return reply.code(200).send(manifest);
  });

  // ── Tool call ───────────────────────────────────────────────────────────────

  app.post<{
    Params: { toolId: string };
    Body: {
      input: unknown;
      timeRange?: { start?: string; end?: string; tz?: string };
      featureFlags?: string[];
      contractVersions?: { mcp?: string; tool?: string; fixture?: string };
    };
  }>(`${BASE}/tools/:toolId/call`, async (req, reply) => {
    const { toolId } = req.params;
    const registry = getToolRegistry();

    // Lookup tool
    const tool = registry.lookup(toolId);
    if (!tool) {
      return reply
        .code(404)
        .send(makeError("TOOL_NOT_FOUND", `Tool '${toolId}' is not registered`, { toolId }));
    }

    // Build context from request headers + body metadata
    const context = buildRequestContext(
      req.headers as Parameters<typeof buildRequestContext>[0],
      {
        timeRange: req.body?.timeRange,
        featureFlags: req.body?.featureFlags,
        contractVersions: req.body?.contractVersions,
      }
    );

    if (!req.body?.input || typeof req.body.input !== "object") {
      return reply.code(400).send(
        makeError("INVALID_REQUEST", "Request body must include an 'input' object", {
          toolId,
          requestId: context.requestId,
        })
      );
    }

    // Execute tool
    try {
      const result = await tool.handler({ context, input: req.body.input });
      return reply.code(200).send(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return reply.code(500).send(
        makeError("TOOL_EXECUTION_FAILED", message, {
          toolId,
          requestId: context.requestId,
          detail: err instanceof Error ? err.stack : undefined,
        })
      );
    }
  });
}
