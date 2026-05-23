import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { GameTimer } from '../components/GameTimer'
import { PlayerCard } from '../components/PlayerCard'
import { useGameContext } from '../context/GameContext'
import { useGameState } from '../hooks/useGameState'
import { useTileLayout } from '../hooks/useTileLayout'

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

  const containerRef = useRef<HTMLDivElement>(null)
  const { tileWidth, tileHeight, cols } = useTileLayout(players.length, containerRef)

  if (setupPlayers.length === 0) {
    return null
  }

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <div className="flex-shrink-0 p-3">
        <GameTimer
          elapsedMs={elapsedGameMs}
          isPaused={gamePaused}
          onTogglePause={togglePause}
        />
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: tileWidth > 0 ? `repeat(${cols}, ${tileWidth}px)` : undefined,
          gridAutoRows: tileHeight > 0 ? `${tileHeight}px` : undefined,
          gap: '10px',
        }}
      >
        {players.map(player => {
          const isActive = player.id === activePlayerId
          return (
            <PlayerCard
              key={player.id}
              player={player}
              currentTurnMs={isActive ? currentTurnMs : 0}
              isActive={isActive}
              isPaused={gamePaused}
              turnHistory={player.turnHistory}
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
  )
}

export function GamePage() {
  return (
    <ErrorBoundary>
      <GamePageInner />
    </ErrorBoundary>
  )
}
