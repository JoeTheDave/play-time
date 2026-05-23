import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerCard } from '../../src/components/PlayerCard'
import type { Player } from '../../src/types'

const mockPlayer: Player = {
  id: 'player-1',
  name: 'Alice',
  color: '#E63946',
  totalMs: 60000,
  isActive: false,
}

describe('PlayerCard', () => {
  it('renders player name', () => {
    render(
      <PlayerCard
        player={mockPlayer}
        currentTurnMs={0}
        isActive={false}
        isPaused={false}
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
        onClick={() => undefined}
      />
    )
    expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#E63946' })
  })

  describe('active state', () => {
    it('applies brightness(1.35) filter when active', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={5000}
          isActive={true}
          isPaused={false}
          onClick={() => undefined}
        />
      )
      const button = screen.getByRole('button')
      expect(button).toHaveStyle({ filter: 'brightness(1.35)' })
    })

    it('has ring-4 class when active', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={5000}
          isActive={true}
          isPaused={false}
          onClick={() => undefined}
        />
      )
      const button = screen.getByRole('button')
      expect(button.className).toContain('ring-4')
    })

    it('has aria-label indicating active', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={true}
          isPaused={false}
          onClick={() => undefined}
        />
      )
      expect(screen.getByRole('button', { name: /Alice.*active/i })).toBeInTheDocument()
    })
  })

  describe('inactive state', () => {
    it('applies filter: none when inactive', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
          onClick={() => undefined}
        />
      )
      const button = screen.getByRole('button')
      expect(button).toHaveStyle({ filter: 'none' })
    })

    it('does not have ring-4 class when inactive', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={0}
          isActive={false}
          isPaused={false}
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
          onClick={() => undefined}
        />
      )
      // This turn timer shows formatTime(0) = "0:00:00.000"
      // Total timer shows formatTime(60000 + 0) = "0:01:00.000"
      // Both are in the document, check for "0:00:00.000" specifically
      expect(screen.getByText('0:00:00.000')).toBeInTheDocument()
    })

    it('shows non-zero "This turn" time when active with currentTurnMs > 0', () => {
      render(
        <PlayerCard
          player={mockPlayer}
          currentTurnMs={5000}
          isActive={true}
          isPaused={false}
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
          onClick={() => undefined}
        />
      )
      // Both timers show 0:00:00.000 — there should be two of them
      const zeroTimes = screen.getAllByText('0:00:00.000')
      expect(zeroTimes).toHaveLength(2)
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
          onClick={() => undefined}
        />
      )
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })
})
