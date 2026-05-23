import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTileLayout } from '../../src/hooks/useTileLayout'

// We need to mock ResizeObserver since jsdom doesn't implement it.
// We also need to control getBoundingClientRect so we can simulate container sizes.

type ResizeCallback = (entries: Array<{ contentRect: { width: number; height: number } }>) => void

let resizeCallback: ResizeCallback | null = null
let mockObserve: ReturnType<typeof vi.fn>
let mockDisconnect: ReturnType<typeof vi.fn>

const GAP = 10

function setupMockResizeObserver(initialWidth: number, initialHeight: number) {
  mockObserve = vi.fn()
  mockDisconnect = vi.fn()

  vi.stubGlobal(
    'ResizeObserver',
    vi.fn((cb: ResizeCallback) => {
      resizeCallback = cb
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: vi.fn(),
      }
    }),
  )

  // Mock getBoundingClientRect to return the initial container size
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: initialWidth,
    height: initialHeight,
    top: 0,
    left: 0,
    bottom: initialHeight,
    right: initialWidth,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })) as unknown as typeof Element.prototype.getBoundingClientRect
}

// Helper: simulate a resize event
function triggerResize(width: number, height: number) {
  act(() => {
    resizeCallback?.([{ contentRect: { width, height } }])
  })
}

// Helper: create a containerRef pointing at a real DOM div so the hook's
// `containerRef.current` is non-null.
function makeContainerRef() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const ref = { current: div }
  return ref
}

// Helper: compute expected tile dimensions with gap-aware algorithm
function expectedLayout(w: number, h: number, n: number): { cols: number; tileWidth: number; tileHeight: number } {
  let bestCols = 1
  let bestMinDimension = 0
  for (let c = 1; c <= n; c++) {
    const rows = Math.ceil(n / c)
    const tileW = (w - GAP * (c - 1)) / c
    const tileH = (h - GAP * (rows - 1)) / rows
    const minDim = Math.min(tileW, tileH)
    if (minDim > bestMinDimension) {
      bestMinDimension = minDim
      bestCols = c
    }
  }
  const bestRows = Math.ceil(n / bestCols)
  return {
    cols: bestCols,
    tileWidth: (w - GAP * (bestCols - 1)) / bestCols,
    tileHeight: (h - GAP * (bestRows - 1)) / bestRows,
  }
}

describe('useTileLayout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    resizeCallback = null
    document.body.replaceChildren()
  })

  describe('initial layout computation', () => {
    it('returns cols=1 for 1 player in 800x600 container', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(1, containerRef as React.RefObject<HTMLElement>))

      expect(result.current.cols).toBe(1)
      expect(result.current.tileWidth).toBe(800)
      expect(result.current.tileHeight).toBe(600)
    })

    it('returns cols=2 for 2 players in 800x600 container', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(2, containerRef as React.RefObject<HTMLElement>))

      const expected = expectedLayout(800, 600, 2)
      expect(result.current.cols).toBe(expected.cols)
      expect(result.current.tileWidth).toBeCloseTo(expected.tileWidth)
      expect(result.current.tileHeight).toBeCloseTo(expected.tileHeight)
    })

    it('returns cols=2 for 4 players in 800x600 container', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(4, containerRef as React.RefObject<HTMLElement>))

      const expected = expectedLayout(800, 600, 4)
      expect(result.current.cols).toBe(expected.cols)
      expect(result.current.tileWidth).toBeCloseTo(expected.tileWidth)
      expect(result.current.tileHeight).toBeCloseTo(expected.tileHeight)
    })

    it('returns cols=3 for 6 players in 1200x600 container', () => {
      setupMockResizeObserver(1200, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(6, containerRef as React.RefObject<HTMLElement>))

      const expected = expectedLayout(1200, 600, 6)
      expect(result.current.cols).toBe(expected.cols)
      expect(result.current.tileWidth).toBeCloseTo(expected.tileWidth)
      expect(result.current.tileHeight).toBeCloseTo(expected.tileHeight)
    })

    it('returns correct layout for 9 players in 900x600 container', () => {
      setupMockResizeObserver(900, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(9, containerRef as React.RefObject<HTMLElement>))

      const expected = expectedLayout(900, 600, 9)
      expect(result.current.cols).toBe(expected.cols)
      expect(result.current.tileWidth).toBeCloseTo(expected.tileWidth)
      expect(result.current.tileHeight).toBeCloseTo(expected.tileHeight)
    })

    it('returns correct layout for 12 players in 1200x900 container', () => {
      setupMockResizeObserver(1200, 900)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(12, containerRef as React.RefObject<HTMLElement>))

      const expected = expectedLayout(1200, 900, 12)
      expect(result.current.cols).toBe(expected.cols)
      expect(result.current.tileWidth).toBeCloseTo(expected.tileWidth)
      expect(result.current.tileHeight).toBeCloseTo(expected.tileHeight)
    })
  })

  describe('resize triggers recompute', () => {
    it('updates layout when container is resized', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(4, containerRef as React.RefObject<HTMLElement>))

      // Initial: cols=2
      expect(result.current.cols).toBe(2)

      // Simulate resize to very wide container — now 4 columns should win
      triggerResize(2000, 600)

      const expected = expectedLayout(2000, 600, 4)
      expect(result.current.cols).toBe(expected.cols)
      expect(result.current.tileWidth).toBeCloseTo(expected.tileWidth)
      expect(result.current.tileHeight).toBeCloseTo(expected.tileHeight)
    })

    it('updates layout when container resizes to tall/narrow shape', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(4, containerRef as React.RefObject<HTMLElement>))

      // Simulate narrow tall container: 400x1200
      triggerResize(400, 1200)

      const expected = expectedLayout(400, 1200, 4)
      expect(result.current.cols).toBe(expected.cols)
      expect(result.current.tileWidth).toBeCloseTo(expected.tileWidth)
      expect(result.current.tileHeight).toBeCloseTo(expected.tileHeight)
    })
  })

  describe('edge cases', () => {
    it('returns default layout when playerCount is 0', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(0, containerRef as React.RefObject<HTMLElement>))

      expect(result.current.cols).toBe(1)
    })

    it('connects ResizeObserver to the container element', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      renderHook(() => useTileLayout(2, containerRef as React.RefObject<HTMLElement>))

      expect(mockObserve).toHaveBeenCalledWith(containerRef.current)
    })

    it('disconnects ResizeObserver on unmount', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { unmount } = renderHook(() => useTileLayout(2, containerRef as React.RefObject<HTMLElement>))
      unmount()

      expect(mockDisconnect).toHaveBeenCalled()
    })
  })
})
