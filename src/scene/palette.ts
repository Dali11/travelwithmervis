export type RGB = [number, number, number];

export const hex = (h: number): RGB => [(h >> 16) & 255, (h >> 8) & 255, h & 255];

export const mix = (a: RGB, b: RGB, f: number): RGB => [
  a[0] + (b[0] - a[0]) * f,
  a[1] + (b[1] - a[1]) * f,
  a[2] + (b[2] - a[2]) * f,
];

export const rgbCss = (c: RGB): string => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;

export interface SkyState {
  top: RGB;
  bot: RGB;
  light: RGB;
  sunY: number;
}

// Sunrise -> morning -> midday -> afternoon -> golden hour -> dusk
const PALETTE: SkyState[] = [
  { top: hex(0x1d3a73), bot: hex(0xf4a37c), light: hex(0xffc58f), sunY: 7 },
  { top: hex(0x2563b8), bot: hex(0xa9d8f0), light: hex(0xfff1d6), sunY: 16 },
  { top: hex(0x1f78d1), bot: hex(0xbfe9f5), light: hex(0xffffff), sunY: 28 },
  { top: hex(0x2a6fc0), bot: hex(0xf2d3a0), light: hex(0xffe2b0), sunY: 18 },
  { top: hex(0x26427f), bot: hex(0xf59b86), light: hex(0xffb08a), sunY: 8 },
  { top: hex(0x101f4d), bot: hex(0xd8628b), light: hex(0xff9fb6), sunY: 4 },
];

/** Sky colours for scroll progress u (0 .. n-1). */
export function skyAt(u: number, n: number): SkyState {
  const span = PALETTE.length - 1;
  const x = n > 1 ? (u / (n - 1)) * span : 0;
  const i = Math.max(0, Math.min(Math.floor(x), span - 1));
  const f = Math.min(Math.max(x - i, 0), 1);
  const a = PALETTE[i];
  const b = PALETTE[i + 1];
  return {
    top: mix(a.top, b.top, f),
    bot: mix(a.bot, b.bot, f),
    light: mix(a.light, b.light, f),
    sunY: a.sunY + (b.sunY - a.sunY) * f,
  };
}
