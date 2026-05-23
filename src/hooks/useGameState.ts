import { useState, useEffect, useRef, useCallback } from 'react'
import type { Player } from '../types'

interface GameStateHook {
  players: Player[]
  gamePaused: boolean
  activePlayerId: string | null
  currentTurnMs: number
  elapsedGameMs: number
  setActivePlayer: (id: string) => void
  togglePause: () => void
}

export function useGameState(initialPlayers: Player[]): GameStateHook {
  // Core game state
  const [players, setPlayers] = useState<Player[]>(() =>
    initialPlayers.map((p, i) => ({
      ...p,
      isActive: i === 0,
      totalMs: 0,
    }))
  )

  const [gamePaused, setGamePaused] = useState(false)
  const [activePlayerId, setActivePlayerId] = useState<string | null>(
    initialPlayers[0]?.id ?? null
  )

  // Tick state to force re-renders
  const [tick, setTick] = useState(0)

  // Time tracking refs — don't cause re-renders
  // gameStartedAt: wall-clock time when the current running segment started
  const gameStartedAt = useRef<number>(Date.now())
  // turnStartedAt: wall-clock time when current turn segment started
  const turnStartedAt = useRef<number>(Date.now())
  // pausedGameMs: accumulated game time before the current running segment
  const pausedGameMs = useRef<number>(0)
  // pausedTurnMs: accumulated turn time for active player before current segment
  const pausedTurnMs = useRef<number>(0)
  // gamePausedRef: mirrors gamePaused state for use in callbacks without stale closures
  const gamePausedRef = useRef<boolean>(false)

  // Keep gamePausedRef in sync
  useEffect(() => {
    gamePausedRef.current = gamePaused
  }, [gamePaused])

  // Interval ref
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start/stop interval based on pause state
  useEffect(() => {
    if (!gamePaused) {
      intervalRef.current = setInterval(() => {
        setTick(t => t + 1)
      }, 100)
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [gamePaused])

  // Computed values (recalculated on every render, driven by tick)
  const elapsedGameMs = gamePaused
    ? pausedGameMs.current
    : pausedGameMs.current + (Date.now() - gameStartedAt.current)

  const currentTurnMs = gamePaused
    ? pausedTurnMs.current
    : pausedTurnMs.current + (Date.now() - turnStartedAt.current)

  // Suppress unused tick warning — needed to drive re-renders
  void tick

  const setActivePlayer = useCallback((id: string) => {
    // Guard: do nothing if paused
    if (gamePausedRef.current) return

    setPlayers(prevPlayers => {
      const currentActive = prevPlayers.find(p => p.isActive)
      if (currentActive?.id === id) return prevPlayers

      // Accumulate elapsed time into the outgoing active player's total
      const elapsedTurn = pausedTurnMs.current + (Date.now() - turnStartedAt.current)

      const updated = prevPlayers.map(p => {
        if (p.isActive) {
          return { ...p, isActive: false, totalMs: p.totalMs + elapsedTurn }
        }
        if (p.id === id) {
          return { ...p, isActive: true }
        }
        return p
      })

      // Reset turn tracking for the new active player
      pausedTurnMs.current = 0
      turnStartedAt.current = Date.now()
      setActivePlayerId(id)

      return updated
    })
  }, [])

  const togglePause = useCallback(() => {
    const now = Date.now()
    const wasPaused = gamePausedRef.current
    if (wasPaused) {
      // Resuming: reset wall-clock origins; accumulated values remain
      gameStartedAt.current = now
      turnStartedAt.current = now
      gamePausedRef.current = false
      setGamePaused(false)
    } else {
      // Pausing: snapshot elapsed time into accumulators
      pausedGameMs.current = pausedGameMs.current + (now - gameStartedAt.current)
      pausedTurnMs.current = pausedTurnMs.current + (now - turnStartedAt.current)
      gamePausedRef.current = true
      setGamePaused(true)
    }
  }, [])

  return {
    players,
    gamePaused,
    activePlayerId,
    currentTurnMs,
    elapsedGameMs,
    setActivePlayer,
    togglePause,
  }
}
