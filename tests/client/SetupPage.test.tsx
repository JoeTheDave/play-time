import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SetupPage } from '../../src/pages/SetupPage'
import { GameProvider } from '../../src/context/GameContext'
import { PLAYER_COLORS } from '../../src/lib/colors'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderSetupPage() {
  return render(
    <GameProvider>
      <MemoryRouter>
        <SetupPage />
      </MemoryRouter>
    </GameProvider>
  )
}

describe('SetupPage', () => {
  it('renders 2 default player slots', () => {
    renderSetupPage()
    const inputs = screen.getAllByRole('textbox', { name: 'Player name' })
    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toHaveValue('Player 1')
    expect(inputs[1]).toHaveValue('Player 2')
  })

  it('does not show remove buttons when only 2 players', () => {
    renderSetupPage()
    expect(screen.queryByRole('button', { name: 'Remove player' })).not.toBeInTheDocument()
  })

  it('shows Add Player button', () => {
    renderSetupPage()
    expect(screen.getByRole('button', { name: '+ Add Player' })).toBeInTheDocument()
  })

  it('adds a player when Add Player is clicked', () => {
    renderSetupPage()
    fireEvent.click(screen.getByRole('button', { name: '+ Add Player' }))
    const inputs = screen.getAllByRole('textbox', { name: 'Player name' })
    expect(inputs).toHaveLength(3)
  })

  it('shows remove buttons when more than 2 players', () => {
    renderSetupPage()
    fireEvent.click(screen.getByRole('button', { name: '+ Add Player' }))
    const removeButtons = screen.getAllByRole('button', { name: 'Remove player' })
    expect(removeButtons.length).toBeGreaterThan(0)
  })

  it('removes a player when remove button is clicked', () => {
    renderSetupPage()
    fireEvent.click(screen.getByRole('button', { name: '+ Add Player' }))
    const removeButtons = screen.getAllByRole('button', { name: 'Remove player' })
    fireEvent.click(removeButtons[0]!)
    const inputs = screen.getAllByRole('textbox', { name: 'Player name' })
    expect(inputs).toHaveLength(2)
  })

  it('hides Add Player button at 12 players', () => {
    renderSetupPage()
    // Add 10 more players (start with 2, need 10 more to reach 12)
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByRole('button', { name: '+ Add Player' }))
    }
    expect(screen.queryByRole('button', { name: '+ Add Player' })).not.toBeInTheDocument()
  })

  it('allows name editing', () => {
    renderSetupPage()
    const inputs = screen.getAllByRole('textbox', { name: 'Player name' })
    fireEvent.change(inputs[0]!, { target: { value: 'Alice' } })
    expect(inputs[0]).toHaveValue('Alice')
  })

  it('navigates to /game when Start Game is clicked', () => {
    renderSetupPage()
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))
    expect(mockNavigate).toHaveBeenCalledWith('/game')
  })

  describe('Add Player color assignment', () => {
    it('assigns first unused color (not color-by-index) when adding a player', () => {
      renderSetupPage()
      // Default: player 1 has PLAYER_COLORS[0], player 2 has PLAYER_COLORS[1]
      // Add player 3 — should get PLAYER_COLORS[2]
      fireEvent.click(screen.getByRole('button', { name: '+ Add Player' }))
      const swatches = screen.getAllByRole('button', { name: /Player color/i })
      // Third swatch should have PLAYER_COLORS[2] color
      expect(swatches[2]).toHaveStyle({ backgroundColor: PLAYER_COLORS[2] })
    })
  })

  describe('color picker', () => {
    it('shows color picker popover when swatch is clicked', () => {
      renderSetupPage()
      const swatches = screen.getAllByRole('button', { name: /Player color/i })
      fireEvent.click(swatches[0]!)
      const colorOptions = screen.getAllByRole('button', { name: /Select color/i })
      expect(colorOptions).toHaveLength(12)
    })

    it('swaps colors when selecting a color already used by another player', () => {
      renderSetupPage()
      // Player 1: PLAYER_COLORS[0], Player 2: PLAYER_COLORS[1]
      const swatches = screen.getAllByRole('button', { name: /Player color/i })

      // Click player 1's swatch to open picker
      fireEvent.click(swatches[0]!)
      // Select Player 2's color (PLAYER_COLORS[1])
      const player2Color = PLAYER_COLORS[1]!
      fireEvent.click(screen.getByRole('button', { name: `Select color ${player2Color}` }))

      // Player 1 should now have PLAYER_COLORS[1] and player 2 should have PLAYER_COLORS[0]
      const updatedSwatches = screen.getAllByRole('button', { name: /Player color/i })
      expect(updatedSwatches[0]).toHaveStyle({ backgroundColor: PLAYER_COLORS[1] })
      expect(updatedSwatches[1]).toHaveStyle({ backgroundColor: PLAYER_COLORS[0] })
    })
  })
})
