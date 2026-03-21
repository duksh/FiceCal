import { FeatureRegistry, FeatureRegistryError } from "@ficecal/feature-registry";
import type { McpCapabilitiesManifest, McpToolDescriptor } from "./types.js";

/**
 * Registry for MCP tool descriptors.
 *
 * Wraps FeatureRegistry for dependency tracking and adds tool-specific
 * operations: lookup by namespace, capabilities manifest generation.
 */
export class McpToolRegistry {
  private readonly tools = new Map<string, McpToolDescriptor>();
  private readonly featureRegistry = new FeatureRegistry();

  /**
   * Register an MCP tool descriptor.
   * @throws {FeatureRegistryError} DUPLICATE_ID if the tool id is already registered.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(tool: McpToolDescriptor<any, any>): void {
    if (this.tools.has(tool.id)) {
      throw new FeatureRegistryError(
        `MCP tool '${tool.id}' is already registered`,
        "DUPLICATE_ID",
        tool.id,
      );
    }
    if (!tool.id || !tool.namespace || !tool.name) {
      throw new FeatureRegistryError(
        `Tool descriptor must have id, namespace, and name`,
        "INVALID_DESCRIPTOR",
        tool.id,
      );
    }

    this.tools.set(tool.id, tool);

    // Also register with the underlying FeatureRegistry for dependency tracking
    this.featureRegistry.register({
      id: tool.id,
      version: "1.0.0",
      dependsOn: [],
      provides: [`mcp-tool:${tool.namespace}`],
      metadata: { namespace: tool.namespace, stability: tool.stability },
    });
  }

  /** Returns the tool descriptor or `undefined`. */
  lookup(id: string): McpToolDescriptor | undefined {
    return this.tools.get(id);
  }

  /**
   * Returns the tool descriptor.
   * @throws {FeatureRegistryError} NOT_FOUND if not registered.
   */
  require(id: string): McpToolDescriptor {
    const tool = this.tools.get(id);
    if (tool === undefined) {
      throw new FeatureRegistryError(
        `MCP tool '${id}' is not registered`,
        "NOT_FOUND",
        id,
      );
    }
    return tool;
  }

  /** Returns all registered tool descriptors. */
  list(): McpToolDescriptor[] {
    return [...this.tools.values()];
  }

  /** Returns all tools in a given namespace. */
  listByNamespace(namespace: string): McpToolDescriptor[] {
    return [...this.tools.values()].filter((t) => t.namespace === namespace);
  }

  /** Returns all registered namespaces. */
  namespaces(): string[] {
    return [...new Set([...this.tools.values()].map((t) => t.namespace))];
  }

  /**
   * Generate the MCP capabilities manifest for the current tool set.
   * Groups tools by namespace and surfaces stability information.
   */
  getCapabilities(options?: {
    mcpVersion?: string;
    schemaVersion?: string;
    legacyAliasesEnabled?: boolean;
  }): McpCapabilitiesManifest {
    const {
      mcpVersion = "2.0",
      schemaVersion = new Date().toISOString().slice(0, 10),
      legacyAliasesEnabled = true,
    } = options ?? {};

    const nsByName = new Map<string, McpToolDescriptor[]>();
    for (const tool of this.tools.values()) {
      const group = nsByName.get(tool.namespace) ?? [];
      group.push(tool);
      nsByName.set(tool.namespace, group);
    }

    const toolNamespaces = [...nsByName.entries()].map(([ns, tools]) => ({
      namespace: ns,
      version: "1.0",
      tools: tools.map((t) => t.id),
      ownerTeam: "ficecal-core",
      stability: tools.some((t) => t.stability === "experimental")
        ? "experimental"
        : tools.some((t) => t.stability === "beta")
          ? "beta"
          : "stable",
    }));

    return {
      mcpVersion,
      schemaVersion,
      toolNamespaces,
      compatibility: {
        legacyAliasesEnabled,
        aliasNamespace: "finops",
        parityFixtureVersion: "1.0",
      },
      featureFlags: ["mcp_v2", "ficecal_economics_tools"],
    };
  }
}
