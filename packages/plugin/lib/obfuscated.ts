function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // biome-ignore lint/suspicious/noBitwiseOperators: djb2 hash algorithm
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    // biome-ignore lint/suspicious/noBitwiseOperators: keep in 32 bits
    hash &= 0xff_ff_ff_ff;
  }
  // biome-ignore lint/suspicious/noBitwiseOperators: unsigned 32-bit
  return hash >>> 0;
}

function toBase36(num: number): string {
  return num.toString(36).padStart(7, "0");
}

export function obfuscateId(id: string | number): string {
  const input = String(id);

  const h1 = hashString(`${input}:salt_alpha`);
  const h2 = hashString(`${input}:salt_beta${h1}`);
  // biome-ignore lint/suspicious/noBitwiseOperators: hash mixing
  const h3 = hashString(`${String(h1 ^ h2)}:gamma`);

  // biome-ignore lint/suspicious/noBitwiseOperators: hash mixing
  const mixed = ((h1 ^ (h2 << 3)) >>> 0) ^ h3;

  const part1 = toBase36(h1);
  const part2 = toBase36(h2);
  const part3 = toBase36(mixed);

  return `${part1}-${part2}-${part3}`;
}
