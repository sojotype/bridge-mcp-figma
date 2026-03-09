const BASE_FONT_SIZE = 16;
const PX_SUFFIX = /px$/;

/**
 * Converts a numeric value (e.g. 14 or "14px") to rem using base font size.
 * Outputs a plain length (e.g. 0.875rem) so it works in Figma plugin iframe and all browsers.
 * In CSS use: rem(14) or rem(14px) → 0.875rem
 */
function rem(value) {
  const num = Number.parseFloat(String(value).replace(PX_SUFFIX, ""), 10);
  if (Number.isNaN(num)) {
    return value;
  }
  const remValue = num / BASE_FONT_SIZE;
  return `${remValue}rem`;
}

export default {
  plugins: {
    "postcss-functions": {
      functions: { rem },
    },
  },
};
