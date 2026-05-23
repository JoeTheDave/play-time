import { formatTime } from '../lib/formatTime'

interface GameTimerProps {
  elapsedMs: number
  isPaused: boolean
  onTogglePause: () => void
}

export function GameTimer({ elapsedMs, isPaused, onTogglePause }: GameTimerProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-900 px-6 py-4">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Game Time</div>
        <div className="font-mono text-4xl font-bold tabular-nums text-white">
          {formatTime(elapsedMs)}
        </div>
      </div>

      <button
        onClick={onTogglePause}
        className={[
          'rounded-lg px-5 py-2 text-sm font-semibold transition-colors',
          isPaused
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500',
        ].join(' ')}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  )
}
