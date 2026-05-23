import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from '../../src/hooks/useGameState'
import type { Player } from '../../src/types'

const makePlayers = (count: number): Player[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    color: '#000000',
    totalMs: 0,
    isActive: false,
  }))

describe('useGameState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with player 1 as active', () => {
    const players = makePlayers(3)
    const { result } = renderHook(() => useGameState(players))
    expect(result.current.activePlayerId).toBe('player-1')
    const activePlayer = result.current.players.find(p => p.isActive)
    expect(activePlayer?.id).toBe('player-1')
  })

  it('starts unpaused', () => {
    const players = makePlayers(2)
    const { result } = renderHook(() => useGameState(players))
    expect(result.current.gamePaused).toBe(false)
  })

  it('starts all players with 0 totalMs', () => {
    const players = makePlayers(3)
    const { result } = renderHook(() => useGameState(players))
    result.current.players.forEach(p => {
      expect(p.totalMs).toBe(0)
    })
  })

  it('togglePause pauses the game', () => {
    const players = makePlayers(2)
    const { result } = renderHook(() => useGameState(players))
    act(() => {
      result.current.togglePause()
    })
    expect(result.current.gamePaused).toBe(true)
  })

  it('togglePause resumes the game', () => {
    const players = makePlayers(2)
    const { result } = renderHook(() => useGameState(players))
    act(() => {
      result.current.togglePause()
    })
    act(() => {
      result.current.togglePause()
    })
    expect(result.current.gamePaused).toBe(false)
  })

  it('setActivePlayer changes the active player', () => {
    const players = makePlayers(3)
    const { result } = renderHook(() => useGameState(players))
    act(() => {
      result.current.setActivePlayer('player-2')
    })
    expect(result.current.activePlayerId).toBe('player-2')
    const activePlayer = result.current.players.find(p => p.isActive)
    expect(activePlayer?.id).toBe('player-2')
  })

  it('setActivePlayer accumulates elapsed time into outgoing player totalMs', () => {
    const players = makePlayers(2)
    const { result } = renderHook(() => useGameState(players))

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    act(() => {
      result.current.setActivePlayer('player-2')
    })

    const player1 = result.current.players.find(p => p.id === 'player-1')
    expect(player1?.totalMs).toBeGreaterThanOrEqual(5000)
  })

  it('setActivePlayer does nothing when game is paused', () => {
    const players = makePlayers(3)
    const { result } = renderHook(() => useGameState(players))

    act(() => {
      result.current.togglePause()
    })

    act(() => {
      result.current.setActivePlayer('player-2')
    })

    expect(result.current.activePlayerId).toBe('player-1')
  })

  it('setActivePlayer does nothing when clicking the already-active player', () => {
    const players = makePlayers(3)
    const { result } = renderHook(() => useGameState(players))
    const initialPlayers = result.current.players

    act(() => {
      result.current.setActivePlayer('player-1')
    })

    expect(result.current.players).toEqual(initialPlayers)
  })

  it('elapsedGameMs increases over time', () => {
    const players = makePlayers(2)
    const { result } = renderHook(() => useGameState(players))

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.elapsedGameMs).toBeGreaterThanOrEqual(3000)
  })

  it('currentTurnMs resets when active player changes', () => {
    const players = makePlayers(2)
    const { result } = renderHook(() => useGameState(players))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    act(() => {
      result.current.setActivePlayer('player-2')
    })

    // After switching, turn should start fresh (close to 0)
    expect(result.current.currentTurnMs).toBeLessThan(500)
  })
})
