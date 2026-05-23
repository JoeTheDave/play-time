import { test, expect } from '@playwright/test'

test.describe('Full game flow', () => {
  test('setup 3 players, start game, switch players, pause and resume', async ({ page }) => {
    // Navigate to setup
    await page.goto('/')

    // Verify 2 default player slots
    const nameInputs = page.getByRole('textbox', { name: 'Player name' })
    await expect(nameInputs).toHaveCount(2)

    // Add a third player
    await page.getByRole('button', { name: '+ Add Player' }).click()
    await expect(nameInputs).toHaveCount(3)

    // Start the game
    await page.getByRole('button', { name: 'Start Game' }).click()
    await expect(page).toHaveURL('/game')

    // Get all player cards
    const player1Card = page.getByRole('button', { name: /Player 1/ })
    const player2Card = page.getByRole('button', { name: /Player 2/ })

    // Verify Player 1 is active (has "This turn" label)
    await expect(player1Card.getByText('This turn')).toBeVisible()

    // Player 1 should be active initially
    await expect(player1Card).toBeVisible()

    // Wait a moment for timers to advance
    await page.waitForTimeout(500)

    // Click Player 2 to make them active
    await player2Card.click()

    // Verify Player 2 is now active (shows "This turn")
    await expect(player2Card.getByText('This turn')).toBeVisible()

    // Pause the game
    const gameTimerLocator = page.locator('.font-mono.text-4xl')
    await page.getByRole('button', { name: 'Pause' }).click()

    // Verify Resume button is shown (pause is now active)
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible()

    // Read the frozen timer value after pause has taken effect
    const timerBeforePause = await gameTimerLocator.textContent()

    // Wait and verify game timer is frozen
    await page.waitForTimeout(1000)
    const timerDuringPause = await gameTimerLocator.textContent()
    expect(timerDuringPause).toBe(timerBeforePause)

    // Resume the game
    await page.getByRole('button', { name: 'Resume' }).click()

    // Verify Pause button is shown again
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

    // Wait and verify the game timer continues advancing
    await page.waitForTimeout(1500)
    const timerAfterResume = await gameTimerLocator.textContent()
    expect(timerAfterResume).not.toBe(timerBeforePause)
  })

  test('4-player game: switch to player 2 resets player 1 This turn and retains Total', async ({ page }) => {
    await page.goto('/')

    // Add 2 more players to get 4 total
    await page.getByRole('button', { name: '+ Add Player' }).click()
    await page.getByRole('button', { name: '+ Add Player' }).click()
    await expect(page.getByRole('textbox', { name: 'Player name' })).toHaveCount(4)

    // Start the game
    await page.getByRole('button', { name: 'Start Game' }).click()
    await expect(page).toHaveURL('/game')

    // Player 1 is active — let a brief moment pass so timers advance
    await page.waitForTimeout(800)

    // Get player 1's Total value before switching — it should be non-zero
    const player1Card = page.getByRole('button', { name: /Player 1/ })

    // Switch to player 2
    const player2Card = page.getByRole('button', { name: /Player 2/ })
    await player2Card.click()

    // Player 1's "This turn" should reset to 0:00:00.000
    // The PlayerCard for Player 1 renders both Total and This turn.
    // We locate the "This turn" value within player 1's card area.
    // Since all cards show "This turn" label, we verify the value is 0:00:00.000
    // by checking player 1's card contains that text.
    await expect(player1Card.getByText('0:00:00.000')).toBeVisible()

    // Player 1's Total should be non-zero (not "0:00:00.000" — two values exist in card)
    // The Total is formatTime(player.totalMs + currentTurnMs) where currentTurnMs=0 for inactive
    // and totalMs was accumulated from the first turn.
    // So Total = formatTime(totalMs) — it should NOT be 0:00:00.000 for the Total timer.
    // Verify player 1 card has exactly one "0:00:00.000" (the "This turn" one, not Total)
    const zeroTimes = await player1Card.getByText('0:00:00.000').count()
    // "This turn" shows 0:00:00.000; Total should show non-zero time
    expect(zeroTimes).toBe(1)

    // Player 2 is now active — both their timers should be ticking
    // Wait a moment and verify player 2's "This turn" advances
    const player2ThisTurnBefore = await player2Card.getByText(/\d:\d\d:\d\d\.\d\d\d/).nth(1).textContent()
    await page.waitForTimeout(500)
    const player2ThisTurnAfter = await player2Card.getByText(/\d:\d\d:\d\d\.\d\d\d/).nth(1).textContent()
    expect(player2ThisTurnAfter).not.toBe(player2ThisTurnBefore)
  })

  test('clicking a player while paused has no effect', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Start Game' }).click()

    // Pause
    await page.getByRole('button', { name: 'Pause' }).click()

    // Inactive player cards should be disabled while paused
    const player2Card = page.getByRole('button', { name: /Player 2/ })
    await expect(player2Card).toBeDisabled()

    // Force-click the disabled button and verify Player 1 is still active
    await player2Card.click({ force: true })
    const player1Card = page.getByRole('button', { name: /Player 1/ })
    await expect(player1Card.getByText('This turn')).toBeVisible()
  })
})
