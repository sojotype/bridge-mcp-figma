import type { TV } from "tailwind-variants";
import { createTV } from "tailwind-variants";

/**
 * Custom font-size tokens from @theme (text-title, text-body, etc.).
 * Without this, tailwind-merge treats them as text-color and drops one when merging with text-neutral-12.
 */
const twMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [{ text: ["title", "body", "caption", "label"] }],
    },
  },
};

export const tv: TV = createTV({ twMergeConfig });
