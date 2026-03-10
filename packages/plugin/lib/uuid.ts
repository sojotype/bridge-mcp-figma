/**
 * UUID v4 generator without crypto.randomUUID()
 * Works in Figma plugin sandbox
 */
export function generateUUID(): string {
  // biome-ignore lint/suspicious/noBitwiseOperators: xorshift algorithm
  let seed = Date.now() ^ ((Math.random() * 0xff_ff_ff_ff) | 0);

  function rand(): number {
    // biome-ignore lint/suspicious/noBitwiseOperators: xorshift algorithm
    seed ^= seed << 13;
    // biome-ignore lint/suspicious/noBitwiseOperators: xorshift algorithm
    seed ^= seed >> 17;
    // biome-ignore lint/suspicious/noBitwiseOperators: xorshift algorithm
    seed ^= seed << 5;
    // biome-ignore lint/suspicious/noBitwiseOperators: normalize to unsigned
    return (seed >>> 0) / 0xff_ff_ff_ff;
  }

  function hex(count: number): string {
    let result = "";
    for (let i = 0; i < count; i++) {
      result += Math.floor(rand() * 16).toString(16);
    }
    return result;
  }

  // UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const a = hex(8);
  const b = hex(4);
  const c = `4${hex(3)}`;
  const d = `${(8 + Math.floor(rand() * 4)).toString(16)}${hex(3)}`;
  const e = hex(12);

  return `${a}-${b}-${c}-${d}-${e}`;
}
