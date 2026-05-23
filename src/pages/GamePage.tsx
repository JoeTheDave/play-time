import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { GameTimer } from '../components/GameTimer'
import { PlayerCard } from '../components/PlayerCard'
import { useGameContext } from '../context/GameContext'
import { useGameState } from '../hooks/useGameState'

function getGridCols(count: number): string {
  if (count <= 2) return 'grid-cols-2'
  if (count <= 4) return 'grid-cols-2'
  if (count <= 6) return 'grid-cols-3'
  if (count <= 9) return 'grid-cols-3'
  return 'grid-cols-4'
}

function GamePageInner() {
  const navigate = useNavigate()
  const { setupPlayers } = useGameContext()

  // Redirect to setup if no players configured
  useEffect(() => {
    if (setupPlayers.length === 0) {
      void navigate('/')
    }
  }, [setupPlayers, navigate])

  const {
    players,
    gamePaused,
    activePlayerId,
    currentTurnMs,
    elapsedGameMs,
    setActivePlayer,
    togglePause,
  } = useGameState(setupPlayers)

  if (setupPlayers.length === 0) {
    return null
  }

  const gridCols = getGridCols(players.length)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <GameTimer
          elapsedMs={elapsedGameMs}
          isPaused={gamePaused}
          onTogglePause={togglePause}
        />

        <div className={`grid gap-3 ${gridCols}`}>
          {players.map(player => {
            const isActive = player.id === activePlayerId
            return (
              <PlayerCard
                key={player.id}
                player={player}
                currentTurnMs={isActive ? currentTurnMs : 0}
                isActive={isActive}
                isPaused={gamePaused}
                onClick={() => {
                  if (!gamePaused) {
                    setActivePlayer(player.id)
                  }
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function GamePage() {
  return (
    <ErrorBoundary>
      <GamePageInner />
    </ErrorBoundary>
  )
}
