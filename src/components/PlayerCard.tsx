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
        'flex w-full h-full flex-col items-center justify-center text-white transition-all',
        isActive ? 'ring-4 ring-white ring-offset-2' : '',
        isPaused && !isActive ? 'cursor-default' : 'cursor-pointer',
      ].join(' ')}
      style={{
        backgroundColor: player.color,
        filter: isActive ? 'brightness(1.35)' : 'none',
      }}
      aria-label={`${player.name}${isActive ? ' (active)' : ''}`}
    >
      <div className="mb-3 w-full text-center">
        <span className="text-xl font-bold drop-shadow">
          {player.name}
        </span>
      </div>

      <div className="w-full text-center">
        <div className="text-sm font-medium uppercase tracking-wide opacity-80">Total</div>
        <div className="font-mono text-2xl font-semibold tabular-nums drop-shadow">
          {formatTime(player.totalMs + currentTurnMs)}
        </div>
      </div>

      <div className="mt-3 w-full text-center">
        <div className="text-sm font-medium uppercase tracking-wide opacity-80">This turn</div>
        <div className="font-mono text-xl font-semibold tabular-nums drop-shadow">
          {formatTime(currentTurnMs)}
        </div>
      </div>
    </button>
  )
}
