import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Player } from '../types'

interface GameContextValue {
  setupPlayers: Player[]
  setSetupPlayers: (players: Player[]) => void
}

export const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [setupPlayers, setSetupPlayers] = useState<Player[]>([])

  return (
    <GameContext.Provider value={{ setupPlayers, setSetupPlayers }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext)
  if (ctx === null) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return ctx
}
