import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { PlayerSetupCard } from '../components/PlayerSetupCard'
import { useGameContext } from '../context/GameContext'
import { PLAYER_COLORS } from '../lib/colors'
import type { Player } from '../types'

const MAX_PLAYERS = 12
const MIN_PLAYERS = 2

function createDefaultPlayers(): Player[] {
  return [
    { id: uuid(), name: 'Player 1', color: PLAYER_COLORS[0] ?? '#E63946', totalMs: 0, isActive: false },
    { id: uuid(), name: 'Player 2', color: PLAYER_COLORS[1] ?? '#2196F3', totalMs: 0, isActive: false },
  ]
}

function SetupPageInner() {
  const navigate = useNavigate()
  const { setupPlayers, setSetupPlayers } = useGameContext()

  // Initialize with defaults on first load
  const players = setupPlayers.length > 0 ? setupPlayers : createDefaultPlayers()

  function ensureInitialized(fn: (current: Player[]) => Player[]) {
    const current = setupPlayers.length > 0 ? setupPlayers : createDefaultPlayers()
    setSetupPlayers(fn(current))
  }

  function handleNameChange(id: string, name: string) {
    ensureInitialized(current =>
      current.map(p => (p.id === id ? { ...p, name } : p))
    )
  }

  function handleRemove(id: string) {
    ensureInitialized(current => current.filter(p => p.id !== id))
  }

  function handleAddPlayer() {
    ensureInitialized(current => {
      if (current.length >= MAX_PLAYERS) return current
      const colorIndex = current.length
      const color = PLAYER_COLORS[colorIndex] ?? '#607D8B'
      const newPlayer: Player = {
        id: uuid(),
        name: `Player ${current.length + 1}`,
        color,
        totalMs: 0,
        isActive: false,
      }
      return [...current, newPlayer]
    })
  }

  function handleStart() {
    const current = setupPlayers.length > 0 ? setupPlayers : createDefaultPlayers()
    setSetupPlayers(current)
    void navigate('/game')
  }

  const canAddPlayer = players.length < MAX_PLAYERS
  const canRemovePlayer = players.length > MIN_PLAYERS

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">PlayTime</h1>
        <p className="mb-6 text-gray-500">Set up your players to get started.</p>

        <div className="mb-4 space-y-2">
          {players.map(player => (
            <PlayerSetupCard
              key={player.id}
              player={player}
              onChange={name => handleNameChange(player.id, name)}
              onRemove={() => handleRemove(player.id)}
              showRemove={canRemovePlayer}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {canAddPlayer && (
            <button
              onClick={handleAddPlayer}
              className="flex-1 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              + Add Player
            </button>
          )}

          <button
            onClick={handleStart}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Start Game
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          {players.length} / {MAX_PLAYERS} players
        </p>
      </div>
    </div>
  )
}

export function SetupPage() {
  return (
    <ErrorBoundary>
      <SetupPageInner />
    </ErrorBoundary>
  )
}
