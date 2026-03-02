const BASE_FONT_SIZE = 16;

/**
 * Converts a numeric value (e.g. 14 or "14px") to rem using --base-font-size.
 * In CSS use: rem(14) or rem(14px) → calc(14 / var(--base-font-size) * 1rem)
 */
function rem(value) {
  const num = Number.parseFloat(String(value).replace(/px$/, ""), 10);
  if (Number.isNaN(num)) {
    return value;
  }
  return `calc(${num} / var(--base-font-size) * 1rem)`;
}

export default {
  plugins: {
    "postcss-functions": {
      functions: { rem },
    },
  },
};
