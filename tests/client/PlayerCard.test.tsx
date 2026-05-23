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

  it('renders total time', () => {
    render(
      <PlayerCard
        player={mockPlayer}
        currentTurnMs={0}
        isActive={false}
        isPaused={false}
        onClick={() => undefined}
      />
    )
    expect(screen.getByText('0:01:00')).toBeInTheDocument()
  })

  it('shows current turn time when active', () => {
    render(
      <PlayerCard
        player={mockPlayer}
        currentTurnMs={5000}
        isActive={true}
        isPaused={false}
        onClick={() => undefined}
      />
    )
    expect(screen.getByText('0:00:05')).toBeInTheDocument()
  })

  it('does not show current turn time when inactive', () => {
    render(
      <PlayerCard
        player={mockPlayer}
        currentTurnMs={5000}
        isActive={false}
        isPaused={false}
        onClick={() => undefined}
      />
    )
    expect(screen.queryByText('This turn')).not.toBeInTheDocument()
  })

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

  it('does not call onClick when paused and inactive', () => {
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
})
