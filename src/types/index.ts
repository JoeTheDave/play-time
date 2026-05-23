export interface Player {
  id: string
  name: string
  color: string
  totalMs: number
  isActive: boolean
  turnHistory: number[]
}

export interface GameState {
  players: Player[]
  gamePaused: boolean
  gameStartedAt: number
  activePlayerId: string | null
  turnStartedAt: number | null
}
