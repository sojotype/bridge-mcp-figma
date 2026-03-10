import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  userHashes: string[];
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getUserHashes(): string[] {
  return requestContext.getStore()?.userHashes ?? [];
}
