import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { PlayerSetupCard } from '../components/PlayerSetupCard'
import { useGameContext } from '../context/GameContext'
import { PLAYER_COLORS, firstUnusedColor } from '../lib/colors'
import type { Player } from '../types'

const MAX_PLAYERS = 12
const MIN_PLAYERS = 2

function createDefaultPlayers(): Player[] {
  return [
    { id: uuid(), name: 'Player 1', color: PLAYER_COLORS[0] ?? '#E63946', totalMs: 0, isActive: false, turnHistory: [] },
    { id: uuid(), name: 'Player 2', color: PLAYER_COLORS[1] ?? '#2196F3', totalMs: 0, isActive: false, turnHistory: [] },
  ]
}

function SetupPageInner() {
  const navigate = useNavigate()
  const { setupPlayers, setSetupPlayers } = useGameContext()

  // Initialize with defaults on first load
  const players = setupPlayers.length > 0 ? setupPlayers : createDefaultPlayers()

  function ensureInitialized(fn: (current: Player[]) => Player[]) {
    // Use the same 'players' variable (consistent UUIDs within this render cycle)
    setSetupPlayers(fn(players))
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
      const color = firstUnusedColor(current.map(p => p.color))
      const newPlayer: Player = {
        id: uuid(),
        name: `Player ${current.length + 1}`,
        color,
        totalMs: 0,
        isActive: false,
        turnHistory: [],
      }
      return [...current, newPlayer]
    })
  }

  function handleColorChange(id: string, color: string) {
    ensureInitialized(current => {
      const conflictPlayer = current.find(p => p.color === color && p.id !== id)
      if (conflictPlayer) {
        // Swap colors
        const targetPlayer = current.find(p => p.id === id)
        if (!targetPlayer) return current
        const oldColor = targetPlayer.color
        return current.map(p => {
          if (p.id === id) return { ...p, color }
          if (p.id === conflictPlayer.id) return { ...p, color: oldColor }
          return p
        })
      }
      return current.map(p => (p.id === id ? { ...p, color } : p))
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    ensureInitialized(current => {
      const oldIndex = current.findIndex(p => p.id === active.id)
      const newIndex = current.findIndex(p => p.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return current
      return arrayMove(current, oldIndex, newIndex)
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

        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={players.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="mb-4 space-y-2">
              {players.map(player => (
                <PlayerSetupCard
                  key={player.id}
                  player={player}
                  onChange={name => handleNameChange(player.id, name)}
                  onRemove={() => handleRemove(player.id)}
                  onColorChange={color => handleColorChange(player.id, color)}
                  showRemove={canRemovePlayer}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

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
