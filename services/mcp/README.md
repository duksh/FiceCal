# @ficecal/service-mcp — MCP Service Layer (Phase 5 scaffold)

**Status: scaffold** — Phase 5 implementation pending.

This package will house the Fastify + `@modelcontextprotocol/sdk` transport that exposes
`@ficecal/mcp-tooling` tools over HTTP/stdio to MCP-capable clients.

## Planned stack
- `fastify` — HTTP transport
- `@modelcontextprotocol/sdk` — MCP protocol handling
- `zod` — schema validation at transport boundary
- `@ficecal/mcp-tooling` — economics, health, and recommendation tools (already built)

## Phase 5 entry criteria
- `apps/web` production wiring complete (Phase 4)
- `mcp-tooling` contracts stable and fixture-tested
- ADR-0002 (Fastify MCP SDK stack) accepted ✅
