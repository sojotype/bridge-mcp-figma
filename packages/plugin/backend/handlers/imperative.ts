import type { ToolsParams } from "@bridge-mcp-figma/api";
import { getCollection } from "../utils/tools";

const HANDLERS = {
  async createVariable(params: ToolsParams["createVariable"]) {
    const collection = await getCollection(
      params.collection.id,
      params.collection.name
    );
    if (!collection) {
      throw new Error(
        `Collection not found: ${params.collection.id} ${params.collection.name}`
      );
    }
    return figma.variables.createVariable(
      params.name,
      collection,
      params.resolvedType
    );
  },
  createVariableCollection(params: ToolsParams["createVariableCollection"]) {
    return figma.variables.createVariableCollection(params.name);
  },
  getVariableByIdAsync(params: ToolsParams["getVariableByIdAsync"]) {
    return figma.variables.getVariableByIdAsync(params.id);
  },
} satisfies { [K in keyof ToolsParams]: (params: ToolsParams[K]) => unknown };

export function handleMessage<K extends keyof ToolsParams>(
  method: K,
  params: ToolsParams[K]
): unknown {
  const fn = HANDLERS[method] as (params: ToolsParams[K]) => unknown;
  return fn(params);
}
