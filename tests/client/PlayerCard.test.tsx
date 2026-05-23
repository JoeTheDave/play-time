import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerCard } from '../../src/components/PlayerCard'
import { lightenColor } from '../../src/lib/colors'
import type { Player } from '../../src/types'

const mockPlayer: Player = {
  id: 'player-1',
  name: 'Alice',
  color: '#E63946',
  totalMs: 60000,
  isActive: false,
  turnHistory: [],
}

describe('PlayerCard', () => {
  it('renders player name', () => {
    render(
      <PlayerCard
        player={mockPlayer}
        currentTurnMs={0}
        isActive={false}
        isPaused={false}
        turnHistory={[]}
        onClick={() => undefined}
      />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders player color as backgroundColor inline style', () => {
    render(
      <PlayerCard
        player={mockPlayer}
        currentTurnMs={0}
        isActive={false}
        isPaused={false}
        turnHistory={[]}
        onClick={() => undefined}
      />
    )
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ backgroundColor: '#E63946' })
  })

  it('always applies backgroundColor regardless of active state', () => {
    const { rerender } = render(
      <PlayerCard
        player={mockPlayer}
        currentTurnMs={0}
        isActive={true}
        isPaused={false}
        turnHistory={[]}
        onClick={() => undefined}
      />
    )
    expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#E63946' })

    rerender(
      <PlayerCard
        player={mockPlayer}
        currentTurnMs={0}
        isActive={false}
        isPaused={false}
        turnHistory={[]}
        onClick={() => undefined}
      />
    )
    expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#E63946' })
  })

  describe('active state', () => {
    it('applies lightened border when active', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={5000}
          isActive={true}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      const button = screen.getByRole('button')
      const expectedBorder = `8px solid ${lightenColor(mockPlayer.color)}`
      expect(button).toHaveStyle({ border: expectedBorder })
    })

    it('does not have ring-4 class when active', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={5000}
          isActive={true}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      const button = screen.getByRole('button')
      expect(button.className).not.toContain('ring-4')
    })

    it('does not apply brightness filter when active', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={5000}
          isActive={true}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      const button = screen.getByRole('button')
      expect(button).not.toHaveStyle({ filter: 'brightness(1.35)' })
    })

    it('has aria-label indicating active', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={true}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByRole('button', { name: /Alice.*active/i })).toBeInTheDocument()
    })
  })

  describe('inactive state', () => {
    it('does not apply a solid lightened border when inactive', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      const button = screen.getByRole('button')
      // Inactive: no 8px solid lightened border (the active-state border)
      expect(button.style.borderWidth).not.toBe('8px')
    })

    it('does not have ring-4 class when inactive', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      const button = screen.getByRole('button')
      expect(button.className).not.toContain('ring-4')
    })

    it('does not have active aria-label when inactive', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.queryByRole('button', { name: /active/i })).not.toBeInTheDocument()
    })
  })

  describe('timer labels and values', () => {
    it('renders "Total" label', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByText('Total')).toBeInTheDocument()
    })

    it('renders "This turn" label', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByText('This turn')).toBeInTheDocument()
    })

    it('renders total time as player.totalMs + currentTurnMs in H:MM:SS.mmm format', () => {
      // mockPlayer.totalMs=60000 + currentTurnMs=5000 = 65000ms = 0:01:05.000
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={5000}
          isActive={true}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByText('0:01:05.000')).toBeInTheDocument()
    })

    it('shows 0:00:00.000 for "This turn" when inactive (currentTurnMs=0)', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByText('0:00:00.000')).toBeInTheDocument()
    })

    it('shows non-zero "This turn" time when active with currentTurnMs > 0', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={5000}
          isActive={true}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByText('0:00:05.000')).toBeInTheDocument()
    })

    it('total display uses H:MM:SS.mmm format with milliseconds', () => {
      render(
        <PlayerCard
          player={{ ...mockPlayer, totalMs: 0 }}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      // Both timers show 0:00:00.000 — there should be two of them
      const zeroTimes = screen.getAllByText('0:00:00.000')
      expect(zeroTimes).toHaveLength(2)
    })

    it('timer values have WebkitTextStroke style applied', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      // Both total and this-turn timer elements should have text-stroke
      const timerElements = document.querySelectorAll('[style*="webkit-text-stroke"]')
      expect(timerElements.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Recent turns column', () => {
    it('renders "Recent" label', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByText('Recent')).toBeInTheDocument()
    })

    it('renders empty Recent column when turnHistory is empty', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByText('Recent')).toBeInTheDocument()
      // No turn history entries
      expect(screen.queryByText('+0 more')).not.toBeInTheDocument()
    })

    it('renders turn history entries formatted with formatTime', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[5000, 10000, 3000]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByText('0:00:05.000')).toBeInTheDocument()
      expect(screen.getByText('0:00:10.000')).toBeInTheDocument()
      expect(screen.getByText('0:00:03.000')).toBeInTheDocument()
    })

    it('shows at most 8 entries and "+N more" indicator for overflow', () => {
      const history = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={history}
          onClick={() => undefined}
        />
      )
      expect(screen.getByText('+2 more')).toBeInTheDocument()
    })

    it('shows exactly 8 entries without "+N more" when turnHistory has 8 entries', () => {
      const history = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000]
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={history}
          onClick={() => undefined}
        />
      )
      expect(screen.queryByText(/more/)).not.toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('calls onClick when clicked and not paused', () => {
      const onClick = vi.fn()
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          turnHistory={[]}
          onClick={onClick}
        />
      )
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('does not call onClick when paused and inactive (button is disabled)', () => {
      const onClick = vi.fn()
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={true}
          turnHistory={[]}
          onClick={onClick}
        />
      )
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('is disabled when paused and inactive', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={true}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is not disabled when active and paused', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={true}
          isPaused={true}
          turnHistory={[]}
          onClick={() => undefined}
        />
      )
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })
})
