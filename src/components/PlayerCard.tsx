import type { Player } from '../types'
import { formatTime } from '../lib/formatTime'

interface PlayerCardProps {
  player: Player
  currentTurnMs: number
  isActive: boolean
  isPaused: boolean
  onClick: () => void
}

export function PlayerCard({ player, currentTurnMs, isActive, isPaused, onClick }: PlayerCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={isPaused && !isActive}
      className={[
        'flex w-full flex-col items-center rounded-xl p-4 text-left transition-all',
        isActive
          ? 'shadow-lg'
          : 'border border-gray-200 bg-white text-gray-800 shadow-sm hover:shadow-md',
        isPaused && !isActive ? 'cursor-default opacity-70' : 'cursor-pointer',
      ].join(' ')}
      style={
        isActive
          ? {
              backgroundColor: `${player.color}22`,
              borderWidth: '4px',
              borderStyle: 'solid',
              borderColor: player.color,
            }
          : undefined
      }
      aria-label={`${player.name}${isActive ? ' (active)' : ''}`}
    >
      <div className="mb-2 w-full text-center">
        <span
          className="text-lg font-bold"
          style={isActive ? { color: player.color } : undefined}
        >
          {player.name}
        </span>
      </div>

      <div className="w-full text-center">
        <div className="text-sm text-gray-500">Total</div>
        <div className="font-mono text-2xl font-semibold tabular-nums">
          {formatTime(player.totalMs)}
        </div>
      </div>

      {isActive && (
        <div className="mt-3 w-full text-center">
          <div className="text-sm text-gray-500">This turn</div>
          <div
            className="font-mono text-xl font-semibold tabular-nums"
            style={{ color: player.color }}
          >
            {formatTime(currentTurnMs)}
          </div>
        </div>
      )}
    </button>
  )
}
