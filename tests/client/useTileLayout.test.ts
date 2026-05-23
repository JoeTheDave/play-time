import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRef } from 'react'
import { useTileLayout } from '../../src/hooks/useTileLayout'

// We need to mock ResizeObserver since jsdom doesn't implement it.
// We also need to control getBoundingClientRect so we can simulate container sizes.

type ResizeCallback = (entries: Array<{ contentRect: { width: number; height: number } }>) => void

let resizeCallback: ResizeCallback | null = null
let mockObserve: ReturnType<typeof vi.fn>
let mockDisconnect: ReturnType<typeof vi.fn>

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
  // renderHook gives us access to useRef — we build the ref manually here.
  const ref = { current: div }
  return ref
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

    it('returns cols=2 for 2 players in 800x600 container (tiles are 400x600)', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(2, containerRef as React.RefObject<HTMLElement>))

      // c=1: tileW=800, tileH=300, min=300
      // c=2: tileW=400, tileH=600, min=400 (winner)
      expect(result.current.cols).toBe(2)
      expect(result.current.tileWidth).toBe(400)
      expect(result.current.tileHeight).toBe(600)
    })

    it('returns cols=2 for 4 players in 800x600 container (tiles are 400x300)', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(4, containerRef as React.RefObject<HTMLElement>))

      // c=1: rows=4, tileW=800, tileH=150, min=150
      // c=2: rows=2, tileW=400, tileH=300, min=300 (winner)
      // c=3: rows=2, tileW=267, tileH=300, min=267
      // c=4: rows=1, tileW=200, tileH=600, min=200
      expect(result.current.cols).toBe(2)
      expect(result.current.tileWidth).toBe(400)
      expect(result.current.tileHeight).toBe(300)
    })

    it('returns cols=3 for 6 players in 1200x600 container', () => {
      setupMockResizeObserver(1200, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(6, containerRef as React.RefObject<HTMLElement>))

      // c=1: rows=6, tileW=1200, tileH=100, min=100
      // c=2: rows=3, tileW=600, tileH=200, min=200
      // c=3: rows=2, tileW=400, tileH=300, min=300 (winner)
      // c=4: rows=2, tileW=300, tileH=300, min=300 — ties c=3 but c=3 was first
      // c=5: rows=2, tileW=240, tileH=300, min=240
      // c=6: rows=1, tileW=200, tileH=600, min=200
      expect(result.current.cols).toBe(3)
      expect(result.current.tileWidth).toBe(400)
      expect(result.current.tileHeight).toBe(300)
    })

    it('returns correct layout for 9 players in 900x600 container', () => {
      setupMockResizeObserver(900, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(9, containerRef as React.RefObject<HTMLElement>))

      // c=3: rows=3, tileW=300, tileH=200, min=200
      // c=4: rows=3, tileW=225, tileH=200, min=200 (ties but c=3 wins by being first)
      // Let's verify c=3 is best:
      // c=1: min(900,67)=67; c=2: min(450,200)=200; c=3: min(300,200)=200;
      // c=4: min(225,200)=200; c=5: min(180,300)=180; ...
      // c=3 wins (first among ties)
      expect(result.current.cols).toBe(3)
      expect(result.current.tileWidth).toBeCloseTo(300)
      expect(result.current.tileHeight).toBeCloseTo(200)
    })

    it('returns correct layout for 12 players in 1200x900 container', () => {
      setupMockResizeObserver(1200, 900)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(12, containerRef as React.RefObject<HTMLElement>))

      // c=4: rows=3, tileW=300, tileH=300, min=300 (winner)
      expect(result.current.cols).toBe(4)
      expect(result.current.tileWidth).toBe(300)
      expect(result.current.tileHeight).toBe(300)
    })
  })

  describe('resize triggers recompute', () => {
    it('updates layout when container is resized', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(4, containerRef as React.RefObject<HTMLElement>))

      // Initial: cols=2, tileWidth=400, tileHeight=300
      expect(result.current.cols).toBe(2)

      // Simulate resize to very wide container — now 4 columns should win
      // 2000x600: c=4 → rows=1, tileW=500, tileH=600, min=500 vs c=2 → tileW=1000, tileH=300, min=300
      triggerResize(2000, 600)

      expect(result.current.cols).toBe(4)
      expect(result.current.tileWidth).toBe(500)
      expect(result.current.tileHeight).toBe(600)
    })

    it('updates layout when container resizes to tall/narrow shape', () => {
      setupMockResizeObserver(800, 600)
      const containerRef = makeContainerRef()

      const { result } = renderHook(() => useTileLayout(4, containerRef as React.RefObject<HTMLElement>))

      // Simulate narrow tall container: 400x1200
      // c=1: rows=4, tileW=400, tileH=300, min=300
      // c=2: rows=2, tileW=200, tileH=600, min=200
      // => cols=1 wins
      triggerResize(400, 1200)

      expect(result.current.cols).toBe(1)
      expect(result.current.tileWidth).toBe(400)
      expect(result.current.tileHeight).toBe(300)
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
