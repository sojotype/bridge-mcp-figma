import type { z } from "zod";
import type { DECLARATIVE_SCHEMAS } from "./declarative";
import type { IMPERATIVE_SCHEMAS } from "./imperative";

export type ToolsParams = {
  [K in
    | keyof typeof IMPERATIVE_SCHEMAS
    | keyof typeof DECLARATIVE_SCHEMAS]: z.infer<
    | (K extends keyof typeof IMPERATIVE_SCHEMAS
        ? (typeof IMPERATIVE_SCHEMAS)[K]
        : never)
    | (K extends keyof typeof DECLARATIVE_SCHEMAS
        ? (typeof DECLARATIVE_SCHEMAS)[K]
        : never)
  >;
};
