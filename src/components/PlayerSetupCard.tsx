import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Player } from '../types'
import { PLAYER_COLORS } from '../lib/colors'

const DEFAULT_NAME_RE = /^Player \d+$/

interface PlayerSetupCardProps {
  player: Player
  onChange: (name: string) => void
  onRemove: () => void
  onColorChange: (color: string) => void
  showRemove: boolean
}

export function PlayerSetupCard({ player, onChange, onRemove, onColorChange, showRemove }: PlayerSetupCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: player.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Close popover on click outside
  useEffect(() => {
    if (!pickerOpen) return
    function handleClickOutside(ev: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(ev.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside as EventListener)
    return () => document.removeEventListener('mousedown', handleClickOutside as EventListener)
  }, [pickerOpen])

  function handleFocus() {
    if (DEFAULT_NAME_RE.test(player.name)) {
      onChange('')
    }
  }

  function handleColorSelect(color: string) {
    onColorChange(color)
    setPickerOpen(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="shrink-0 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </button>

      {/* Color swatch button + popover */}
      <div className="relative shrink-0" ref={pickerRef}>
        <button
          type="button"
          className="h-6 w-6 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: player.color }}
          aria-label={`Player color: ${player.color}. Click to change.`}
          onClick={() => setPickerOpen((open: boolean) => !open)}
        />
        {pickerOpen && (
          <div className="absolute left-0 top-8 z-10 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
            <div className="grid grid-cols-4 gap-1">
              {PLAYER_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className="h-6 w-6 rounded border border-transparent hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Name input */}
      <input
        type="text"
        value={player.name}
        onChange={e => onChange(e.target.value)}
        onFocus={handleFocus}
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
