export interface Player {
  id: string
  name: string
  color: string
  totalMs: number
  isActive: boolean
}

export interface GameState {
  players: Player[]
  gamePaused: boolean
  gameStartedAt: number
  activePlayerId: string | null
  turnStartedAt: number | null
}
