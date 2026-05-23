export const PLAYER_COLORS: string[] = [
  '#E63946', // red
  '#2196F3', // blue
  '#4CAF50', // green
  '#FF9800', // orange
  '#9C27B0', // purple
  '#00BCD4', // cyan
  '#FF5722', // deep orange
  '#8BC34A', // light green
  '#3F51B5', // indigo
  '#FFEB3B', // yellow
  '#795548', // brown
  '#607D8B', // blue grey
]

/** Convert a hex color string to [h, s, l] with h in [0,360), s and l in [0,1]. */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return [0, 0, l]
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h: number
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    default:
      h = ((r - g) / d + 4) / 6
  }

  return [h * 360, s, l]
}

/** Convert [h, s, l] (h in [0,360), s and l in [0,1]) to a hex color string. */
function hslToHex(h: number, s: number, l: number): string {
  const hNorm = h / 360

  function hue2rgb(p: number, q: number, t: number): number {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }

  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, hNorm + 1 / 3)
    g = hue2rgb(p, q, hNorm)
    b = hue2rgb(p, q, hNorm - 1 / 3)
  }

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Return a lightened version of a hex color by bumping the HSL lightness
 * by `amount` (default 0.25), clamped to 1.0.
 */
export function lightenColor(hex: string, amount = 0.25): string {
  const [h, s, l] = hexToHsl(hex)
  const newL = Math.min(1, l + amount)
  return hslToHex(h, s, newL)
}

/**
 * Return the first entry in PLAYER_COLORS that is not present in `usedColors`.
 * Falls back to PLAYER_COLORS[0] if all colors are taken.
 */
export function firstUnusedColor(usedColors: string[]): string {
  const used = new Set(usedColors)
  for (const color of PLAYER_COLORS) {
    if (!used.has(color)) return color
  }
  return PLAYER_COLORS[0]!
}
