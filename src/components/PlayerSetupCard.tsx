import type { Player } from '../types'

interface PlayerSetupCardProps {
  player: Player
  onChange: (name: string) => void
  onRemove: () => void
  showRemove: boolean
}

export function PlayerSetupCard({ player, onChange, onRemove, showRemove }: PlayerSetupCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      {/* Color swatch */}
      <div
        className="h-6 w-6 shrink-0 rounded"
        style={{ backgroundColor: player.color }}
        aria-label={`Player color: ${player.color}`}
      />

      {/* Name input */}
      <input
        type="text"
        value={player.name}
        onChange={e => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Player name"
        maxLength={32}
      />

      {/* Remove button */}
      {showRemove && (
        <button
          onClick={onRemove}
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove player"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
