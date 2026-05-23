import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerSetupCard } from '../../src/components/PlayerSetupCard'
import { PLAYER_COLORS } from '../../src/lib/colors'
import type { Player } from '../../src/types'

// Mock @dnd-kit/sortable since we don't need actual DnD in unit tests
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}))

const mockPlayer: Player = {
  id: 'player-1',
  name: 'Player 1',
  color: '#E63946',
  totalMs: 0,
  isActive: false,
  turnHistory: [],
}

function renderCard(overrides: Partial<Player> = {}, handlers: { onChange?: (name: string) => void; onRemove?: () => void; onColorChange?: (color: string) => void } = {}) {
  const player = { ...mockPlayer, ...overrides }
  return render(
    <PlayerSetupCard
      player={player}
      onChange={handlers.onChange ?? vi.fn()}
      onRemove={handlers.onRemove ?? vi.fn()}
      onColorChange={handlers.onColorChange ?? vi.fn()}
      showRemove={false}
    />
  )
}

describe('PlayerSetupCard', () => {
  describe('name input focus behavior', () => {
    it('clears name on focus when value matches ^Player \\d+$', () => {
      const onChange = vi.fn()
      renderCard({ name: 'Player 1' }, { onChange })

      const input = screen.getByRole('textbox', { name: 'Player name' })
      fireEvent.focus(input)

      expect(onChange).toHaveBeenCalledWith('')
    })

    it('clears name on focus for any Player N pattern', () => {
      const onChange = vi.fn()
      renderCard({ name: 'Player 12' }, { onChange })

      const input = screen.getByRole('textbox', { name: 'Player name' })
      fireEvent.focus(input)

      expect(onChange).toHaveBeenCalledWith('')
    })

    it('does NOT clear name on focus when value is a custom name', () => {
      const onChange = vi.fn()
      renderCard({ name: 'Alice' }, { onChange })

      const input = screen.getByRole('textbox', { name: 'Player name' })
      fireEvent.focus(input)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('does NOT clear name on focus when value has been modified from default', () => {
      const onChange = vi.fn()
      renderCard({ name: 'Player 1!' }, { onChange })

      const input = screen.getByRole('textbox', { name: 'Player name' })
      fireEvent.focus(input)

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('color swatch / picker', () => {
    it('renders a color swatch button with the player color', () => {
      renderCard({ color: '#E63946' })

      const swatchButton = screen.getByRole('button', { name: /Player color.*Click to change/i })
      expect(swatchButton).toBeInTheDocument()
      expect(swatchButton).toHaveStyle({ backgroundColor: '#E63946' })
    })

    it('clicking color swatch opens the color picker popover', () => {
      renderCard()

      const swatchButton = screen.getByRole('button', { name: /Player color.*Click to change/i })
      fireEvent.click(swatchButton)

      // Popover with 12 color swatches should appear
      const colorButtons = screen.getAllByRole('button', { name: /Select color/i })
      expect(colorButtons).toHaveLength(12)
    })

    it('shows all 12 PLAYER_COLORS in the picker', () => {
      renderCard()

      const swatchButton = screen.getByRole('button', { name: /Player color.*Click to change/i })
      fireEvent.click(swatchButton)

      for (const color of PLAYER_COLORS) {
        expect(screen.getByRole('button', { name: `Select color ${color}` })).toBeInTheDocument()
      }
    })

    it('calls onColorChange with selected color when a swatch is clicked', () => {
      const onColorChange = vi.fn()
      renderCard({}, { onColorChange })

      const swatchButton = screen.getByRole('button', { name: /Player color.*Click to change/i })
      fireEvent.click(swatchButton)

      const blueButton = screen.getByRole('button', { name: `Select color ${PLAYER_COLORS[1]}` })
      fireEvent.click(blueButton)

      expect(onColorChange).toHaveBeenCalledWith(PLAYER_COLORS[1])
    })

    it('closes the picker after a color is selected', () => {
      renderCard()

      const swatchButton = screen.getByRole('button', { name: /Player color.*Click to change/i })
      fireEvent.click(swatchButton)

      const blueButton = screen.getByRole('button', { name: `Select color ${PLAYER_COLORS[1]}` })
      fireEvent.click(blueButton)

      // Picker should be closed
      expect(screen.queryByRole('button', { name: /Select color/i })).not.toBeInTheDocument()
    })
  })

  describe('drag handle', () => {
    it('renders a drag handle button', () => {
      renderCard()

      expect(screen.getByRole('button', { name: 'Drag to reorder' })).toBeInTheDocument()
    })
  })
})
