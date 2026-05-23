import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameTimer } from '../../src/components/GameTimer'

describe('GameTimer', () => {
  it('displays elapsed time in H:MM:SS.mmm format', () => {
    render(<GameTimer elapsedMs={3661000} isPaused={false} onTogglePause={() => undefined} />)
    expect(screen.getByText('1:01:01.000')).toBeInTheDocument()
  })

  it('displays 0:00:00.000 for 0ms', () => {
    render(<GameTimer elapsedMs={0} isPaused={false} onTogglePause={() => undefined} />)
    expect(screen.getByText('0:00:00.000')).toBeInTheDocument()
  })

  it('shows Pause button when not paused', () => {
    render(<GameTimer elapsedMs={0} isPaused={false} onTogglePause={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('shows Resume button when paused', () => {
    render(<GameTimer elapsedMs={0} isPaused={true} onTogglePause={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()
  })

  it('calls onTogglePause when button is clicked', () => {
    const onTogglePause = vi.fn()
    render(<GameTimer elapsedMs={0} isPaused={false} onTogglePause={onTogglePause} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(onTogglePause).toHaveBeenCalledOnce()
  })
})
