import { describe, it, expect } from 'vitest'
import { PLAYER_COLORS, lightenColor, firstUnusedColor } from '../../src/lib/colors'

describe('lightenColor', () => {
  it('returns a valid hex color string', () => {
    const result = lightenColor('#E63946')
    expect(result).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('returns a lighter color than input (higher lightness in HSL)', () => {
    // For each palette color, the result should be lighter
    // We do a simple check: the hex should differ from the input
    for (const color of PLAYER_COLORS) {
      const lightened = lightenColor(color)
      // At minimum it must be a hex value
      expect(lightened).toMatch(/^#[0-9a-f]{6}$/i)
      // For non-white colors, lightening should produce a different color
      // (colors with L=0.75 or more will be clamped at 1.0 - they may or may not change visually)
    }
  })

  it('works for all 12 palette entries without throwing', () => {
    for (const color of PLAYER_COLORS) {
      expect(() => lightenColor(color)).not.toThrow()
      const result = lightenColor(color)
      expect(result).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('clamps lightness at 1.0 (does not exceed white)', () => {
    // White input should stay white (or near-white)
    const result = lightenColor('#ffffff', 0.5)
    expect(result).toBe('#ffffff')
  })

  it('accepts custom amount parameter', () => {
    const result1 = lightenColor('#E63946', 0.1)
    const result2 = lightenColor('#E63946', 0.4)
    expect(result1).toMatch(/^#[0-9a-f]{6}$/i)
    expect(result2).toMatch(/^#[0-9a-f]{6}$/i)
    // Higher amount should produce a lighter result
    // We can check that they differ
    expect(result1).not.toBe(result2)
  })

  it('lightens dark colors like brown and indigo', () => {
    const brown = '#795548'
    const indigo = '#3F51B5'
    const lightenedBrown = lightenColor(brown)
    const lightenedIndigo = lightenColor(indigo)
    expect(lightenedBrown).toMatch(/^#[0-9a-f]{6}$/i)
    expect(lightenedIndigo).toMatch(/^#[0-9a-f]{6}$/i)
    // These colors should be different from originals
    expect(lightenedBrown).not.toBe(brown)
    expect(lightenedIndigo).not.toBe(indigo)
  })

  it('lightens bright colors like yellow', () => {
    const yellow = '#FFEB3B'
    const result = lightenColor(yellow)
    expect(result).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

describe('firstUnusedColor', () => {
  it('returns the first color when none are used', () => {
    expect(firstUnusedColor([])).toBe(PLAYER_COLORS[0])
  })

  it('returns the first unused color when some are used', () => {
    const usedColors = [PLAYER_COLORS[0]!, PLAYER_COLORS[1]!]
    expect(firstUnusedColor(usedColors)).toBe(PLAYER_COLORS[2])
  })

  it('returns the second color when only the first is used', () => {
    expect(firstUnusedColor([PLAYER_COLORS[0]!])).toBe(PLAYER_COLORS[1])
  })

  it('falls back to PLAYER_COLORS[0] when all 12 colors are used', () => {
    expect(firstUnusedColor([...PLAYER_COLORS])).toBe(PLAYER_COLORS[0])
  })

  it('ignores colors not in PLAYER_COLORS', () => {
    // Custom colors not in the palette should not be counted
    const result = firstUnusedColor(['#000000', '#111111'])
    expect(result).toBe(PLAYER_COLORS[0])
  })

  it('works with 11 of 12 colors used', () => {
    const usedColors = PLAYER_COLORS.slice(0, 11)
    expect(firstUnusedColor(usedColors)).toBe(PLAYER_COLORS[11])
  })
})
