import { useState, useEffect, RefObject } from 'react'

interface TileLayout {
  tileWidth: number
  tileHeight: number
  cols: number
}

const GAP = 10

function computeLayout(playerCount: number, containerWidth: number, containerHeight: number): TileLayout {
  if (playerCount <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return { tileWidth: containerWidth, tileHeight: containerHeight, cols: 1 }
  }

  let bestCols = 1
  let bestMinDimension = 0

  for (let c = 1; c <= playerCount; c++) {
    const rows = Math.ceil(playerCount / c)
    const tileW = (containerWidth - GAP * (c - 1)) / c
    const tileH = (containerHeight - GAP * (rows - 1)) / rows
    const minDim = Math.min(tileW, tileH)
    if (minDim > bestMinDimension) {
      bestMinDimension = minDim
      bestCols = c
    }
  }

  const bestRows = Math.ceil(playerCount / bestCols)
  return {
    tileWidth: (containerWidth - GAP * (bestCols - 1)) / bestCols,
    tileHeight: (containerHeight - GAP * (bestRows - 1)) / bestRows,
    cols: bestCols,
  }
}

export function useTileLayout(
  playerCount: number,
  containerRef: RefObject<HTMLElement>
): TileLayout {
  const [layout, setLayout] = useState<TileLayout>({ tileWidth: 0, tileHeight: 0, cols: 1 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setLayout(computeLayout(playerCount, width, height))
      }
    })

    observer.observe(el)

    // Initial measurement
    const { width, height } = el.getBoundingClientRect()
    setLayout(computeLayout(playerCount, width, height))

    return () => {
      observer.disconnect()
    }
  }, [playerCount, containerRef])

  return layout
}
