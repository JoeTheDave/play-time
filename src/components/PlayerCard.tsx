import type { Player } from '../types'
import { formatTime } from '../lib/formatTime'
import { lightenColor } from '../lib/colors'

const TEXT_STROKE_STYLE = {
  WebkitTextStroke: '1.5px black',
  paintOrder: 'stroke fill' as const,
}

const MAX_RECENT = 8

interface PlayerCardProps {
  player: Player
  currentTurnMs: number
  isActive: boolean
  isPaused: boolean
  turnHistory: number[]
  onClick: () => void
}

export function PlayerCard({ player, currentTurnMs, isActive, isPaused, turnHistory, onClick }: PlayerCardProps) {
  const visibleHistory = turnHistory.slice(0, MAX_RECENT)
  const hiddenCount = turnHistory.length - visibleHistory.length

  return (
    <button
      onClick={onClick}
      disabled={isPaused && !isActive}
      className={[
        'flex w-full h-full text-white transition-all',
        isPaused && !isActive ? 'cursor-default' : 'cursor-pointer',
      ].join(' ')}
      style={{
        backgroundColor: player.color,
        border: isActive ? `8px solid ${lightenColor(player.color)}` : 'none',
      }}
      aria-label={`${player.name}${isActive ? ' (active)' : ''}`}
    >
      {/* Left column: name + timers */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-3 w-full text-center">
          <span className="text-xl font-bold drop-shadow">
            {player.name}
          </span>
        </div>

        <div className="w-full text-center">
          <div className="text-sm font-medium uppercase tracking-wide opacity-80">Total</div>
          <div
            className="font-mono text-4xl font-semibold tabular-nums"
            style={TEXT_STROKE_STYLE}
          >
            {formatTime(player.totalMs + currentTurnMs)}
          </div>
        </div>

        <div className="mt-3 w-full text-center">
          <div className="text-sm font-medium uppercase tracking-wide opacity-80">This turn</div>
          <div
            className="font-mono text-3xl font-semibold tabular-nums"
            style={TEXT_STROKE_STYLE}
          >
            {formatTime(currentTurnMs)}
          </div>
        </div>
      </div>

      {/* Right column: recent turn history */}
      <div className="flex w-28 flex-col items-center justify-center border-l border-white/20 px-2 py-2">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide opacity-80">Recent</div>
        <div className="flex flex-col items-center gap-0.5">
          {visibleHistory.map((ms, i) => (
            <div
              key={i}
              className="font-mono text-sm tabular-nums"
              style={TEXT_STROKE_STYLE}
            >
              {formatTime(ms)}
            </div>
          ))}
          {hiddenCount > 0 && (
            <div className="mt-1 text-xs opacity-60">+{hiddenCount} more</div>
          )}
        </div>
      </div>
    </button>
  )
}
