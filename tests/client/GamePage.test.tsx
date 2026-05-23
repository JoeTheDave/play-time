import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GamePage } from '../../src/pages/GamePage'
import { GameContext } from '../../src/context/GameContext'
import type { Player } from '../../src/types'

// Mock useTileLayout so we control the returned dimensions without ResizeObserver
vi.mock('../../src/hooks/useTileLayout', () => ({
  useTileLayout: vi.fn(() => ({ tileWidth: 400, tileHeight: 300, cols: 2 })),
}))

// Import after mock is set up
import { useTileLayout } from '../../src/hooks/useTileLayout'

const makePlayers = (count: number): Player[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    color: '#E63946',
    totalMs: 0,
    isActive: i === 0,
  }))

function renderWithPlayers(players: Player[]) {
  return render(
    <MemoryRouter initialEntries={['/game']}>
      <GameContext.Provider value={{ setupPlayers: players, setSetupPlayers: vi.fn() }}>
        <GamePage />
      </GameContext.Provider>
    </MemoryRouter>
  )
}

describe('GamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restore default mock return value
    vi.mocked(useTileLayout).mockReturnValue({ tileWidth: 400, tileHeight: 300, cols: 2 })
  })

  it('renders all player cards', () => {
    renderWithPlayers(makePlayers(4))
    expect(screen.getByText('Player 1')).toBeInTheDocument()
    expect(screen.getByText('Player 2')).toBeInTheDocument()
    expect(screen.getByText('Player 3')).toBeInTheDocument()
    expect(screen.getByText('Player 4')).toBeInTheDocument()
  })

  it('grid container has gridTemplateColumns set from useTileLayout', () => {
    renderWithPlayers(makePlayers(4))

    // useTileLayout returns cols=2, tileWidth=400 → "repeat(2, 400px)"
    const gridContainers = document.querySelectorAll('[style*="grid-template-columns"]')
    expect(gridContainers.length).toBeGreaterThan(0)

    const gridContainer = gridContainers[0] as HTMLElement
    expect(gridContainer.style.gridTemplateColumns).toBe('repeat(2, 400px)')
  })

  it('grid container has gridAutoRows set from useTileLayout', () => {
    renderWithPlayers(makePlayers(4))

    const gridContainers = document.querySelectorAll('[style*="grid-auto-rows"]')
    expect(gridContainers.length).toBeGreaterThan(0)

    const gridContainer = gridContainers[0] as HTMLElement
    expect(gridContainer.style.gridAutoRows).toBe('300px')
  })

  it('uses inline grid styles not Tailwind grid-cols-* classes', () => {
    renderWithPlayers(makePlayers(4))

    const gridContainer = document.querySelector('[style*="grid-template-columns"]') as HTMLElement
    expect(gridContainer.className).not.toMatch(/grid-cols-\d/)
  })

  it('calls useTileLayout with the player count', () => {
    renderWithPlayers(makePlayers(4))
    expect(useTileLayout).toHaveBeenCalledWith(
      4,
      expect.objectContaining({ current: expect.anything() })
    )
  })

  it('does not render gridTemplateColumns when tileWidth is 0', () => {
    vi.mocked(useTileLayout).mockReturnValue({ tileWidth: 0, tileHeight: 0, cols: 1 })

    renderWithPlayers(makePlayers(2))

    const gridContainers = document.querySelectorAll('[style*="grid-template-columns"]')
    expect(gridContainers.length).toBe(0)
  })

  it('all player tiles are sized the same via the grid layout', () => {
    renderWithPlayers(makePlayers(4))

    // With gridTemplateColumns: repeat(2, 400px) and gridAutoRows: 300px,
    // every child cell is constrained to 400x300. Verify the grid is correctly set.
    const gridContainer = document.querySelector('[style*="grid-template-columns"]') as HTMLElement
    expect(gridContainer.style.gridTemplateColumns).toBe('repeat(2, 400px)')
    expect(gridContainer.style.gridAutoRows).toBe('300px')
  })

  it('redirects when there are no players', () => {
    // With empty players list, GamePageInner navigates away and renders null
    renderWithPlayers([])
    // The page content (player cards) should not be present
    expect(screen.queryByText('Player 1')).not.toBeInTheDocument()
  })
})
