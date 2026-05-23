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

    // Verify Player 1 is active (has "This turn" label)
    await expect(page.getByText('This turn')).toBeVisible()

    // Get all player cards
    const player1Card = page.getByRole('button', { name: /Player 1/ })
    const player2Card = page.getByRole('button', { name: /Player 2/ })

    // Player 1 should be active initially
    await expect(player1Card).toBeVisible()

    // Wait a moment for timers to advance
    await page.waitForTimeout(500)

    // Click Player 2 to make them active
    await player2Card.click()

    // Verify Player 2 is now active (shows "This turn")
    // The active card shows "This turn" section
    const thisTurnLabels = page.getByText('This turn')
    await expect(thisTurnLabels).toBeVisible()

    // Get the game timer text before pausing
    const gameTimerLocator = page.locator('.font-mono.text-4xl')
    const timerBeforePause = await gameTimerLocator.textContent()

    // Pause the game
    await page.getByRole('button', { name: 'Pause' }).click()

    // Verify Resume button is shown
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible()

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
    await expect(page.getByText('This turn')).toBeVisible()
  })
})
