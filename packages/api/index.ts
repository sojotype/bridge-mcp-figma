/**
 * Shared API package — single entry.
 * Import: import { ... } from "@bridge-mcp-figma/api"
 */
// biome-ignore lint/performance/noBarrelFile: package main entry
export * from "./tools/declarative";
export * from "./tools/imperative";
export * from "./tools/types";
