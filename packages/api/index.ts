/**
 * Shared API package — re-exports and main entry.
 * Import subpaths: @bridge-mcp-figma/api/tools/utilitarian, @bridge-mcp-figma/api/tools/declarative
 */
// biome-ignore lint/performance/noBarrelFile: package main entry
export * from "./tools/declarative.ts";
export * from "./tools/utilitarian.ts";
