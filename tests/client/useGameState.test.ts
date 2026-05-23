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
    turnHistory: [],
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

  describe('player switch behavior (turnMs reset and totalMs accumulation)', () => {
    it('outgoing player totalMs increases by their elapsed turn time on switch', () => {
      const players = makePlayers(2)
      const { result } = renderHook(() => useGameState(players))

      // Advance time by 5 seconds while player 1 is active
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.setActivePlayer('player-2')
      })

      const player1 = result.current.players.find(p => p.id === 'player-1')
      expect(player1?.totalMs).toBeGreaterThanOrEqual(5000)
    })

    it('outgoing player totalMs reflects exactly the elapsed turn duration', () => {
      const players = makePlayers(2)
      const { result } = renderHook(() => useGameState(players))

      // Advance exactly 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      act(() => {
        result.current.setActivePlayer('player-2')
      })

      const player1 = result.current.players.find(p => p.id === 'player-1')
      // Should have accumulated ~3000ms (fake timers make this precise)
      expect(player1?.totalMs).toBeGreaterThanOrEqual(3000)
      // Should not be much more than 3000ms
      expect(player1?.totalMs).toBeLessThan(3500)
    })

    it('incoming player starts with currentTurnMs at 0 after switch', () => {
      const players = makePlayers(2)
      const { result } = renderHook(() => useGameState(players))

      // Advance time while player 1 is active
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.setActivePlayer('player-2')
      })

      // After switching, the new active player's turn should start from 0
      // currentTurnMs is close to 0 immediately after the switch
      expect(result.current.currentTurnMs).toBeLessThan(500)
    })

    it('outgoing player "This turn" resets to 0 (currentTurnMs=0 passed for inactive players)', () => {
      const players = makePlayers(2)
      const { result } = renderHook(() => useGameState(players))

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.setActivePlayer('player-2')
      })

      // GamePage passes currentTurnMs=0 to inactive players.
      // Here we verify the hook's activePlayerId changed, meaning the outgoing player
      // is now inactive and would receive currentTurnMs=0 in GamePage.
      expect(result.current.activePlayerId).toBe('player-2')
    })

    it('outgoing player totalMs accumulates across multiple turns', () => {
      const players = makePlayers(3)
      const { result } = renderHook(() => useGameState(players))

      // Player 1 gets 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      // Switch to player 2
      act(() => {
        result.current.setActivePlayer('player-2')
      })

      // Player 2 gets 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Switch back to player 1
      act(() => {
        result.current.setActivePlayer('player-1')
      })

      // Player 1 gets another 4 seconds
      act(() => {
        vi.advanceTimersByTime(4000)
      })

      // Switch to player 3
      act(() => {
        result.current.setActivePlayer('player-3')
      })

      const player1 = result.current.players.find(p => p.id === 'player-1')
      // Player 1 had: first turn (~3000ms) + second turn (~4000ms) = ~7000ms
      expect(player1?.totalMs).toBeGreaterThanOrEqual(7000)
    })

    it('incoming player totalMs is unchanged on switch', () => {
      const players = makePlayers(2)
      const { result } = renderHook(() => useGameState(players))

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.setActivePlayer('player-2')
      })

      // Player 2 was inactive and should still have 0 totalMs before any time passes
      const player2 = result.current.players.find(p => p.id === 'player-2')
      expect(player2?.totalMs).toBe(0)
    })
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

  describe('turnHistory tracking', () => {
    it('starts all players with empty turnHistory', () => {
      const players = makePlayers(3)
      const { result } = renderHook(() => useGameState(players))
      result.current.players.forEach(p => {
        expect(p.turnHistory).toEqual([])
      })
    })

    it('prepends elapsed turn to outgoing player turnHistory on switch', () => {
      const players = makePlayers(2)
      const { result } = renderHook(() => useGameState(players))

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      act(() => {
        result.current.setActivePlayer('player-2')
      })

      const player1 = result.current.players.find(p => p.id === 'player-1')
      expect(player1?.turnHistory).toHaveLength(1)
      expect(player1?.turnHistory[0]).toBeGreaterThanOrEqual(3000)
    })

    it('accumulates multiple turns in turnHistory, most-recent first', () => {
      const players = makePlayers(3)
      const { result } = renderHook(() => useGameState(players))

      // Player 1 gets 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000)
      })
      act(() => {
        result.current.setActivePlayer('player-2')
      })

      // Player 2 gets 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      act(() => {
        result.current.setActivePlayer('player-1')
      })

      // Player 1 gets another 4 seconds
      act(() => {
        vi.advanceTimersByTime(4000)
      })
      act(() => {
        result.current.setActivePlayer('player-3')
      })

      const player1 = result.current.players.find(p => p.id === 'player-1')
      // player1 should have 2 history entries (most recent first)
      expect(player1?.turnHistory).toHaveLength(2)
      // Most recent turn (~4000ms) should come first
      expect(player1?.turnHistory[0]).toBeGreaterThanOrEqual(4000)
      // First turn (~3000ms) should be second
      expect(player1?.turnHistory[1]).toBeGreaterThanOrEqual(3000)
      expect(player1?.turnHistory[1]).toBeLessThan(4000)
    })

    it('pause/resume does NOT add to turnHistory', () => {
      const players = makePlayers(2)
      const { result } = renderHook(() => useGameState(players))

      act(() => {
        vi.advanceTimersByTime(2000)
      })
      act(() => {
        result.current.togglePause()
      })
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      act(() => {
        result.current.togglePause()
      })

      // No player switch happened, so no turnHistory entries
      const player1 = result.current.players.find(p => p.id === 'player-1')
      expect(player1?.turnHistory).toHaveLength(0)
    })

    it('incoming player turnHistory is unchanged on switch', () => {
      const players = makePlayers(2)
      const { result } = renderHook(() => useGameState(players))

      act(() => {
        vi.advanceTimersByTime(5000)
      })
      act(() => {
        result.current.setActivePlayer('player-2')
      })

      const player2 = result.current.players.find(p => p.id === 'player-2')
      expect(player2?.turnHistory).toEqual([])
    })
  })
})
