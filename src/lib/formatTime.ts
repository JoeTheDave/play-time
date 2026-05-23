/**
 * Formats milliseconds as H:MM:SS
 * Hours can be 1+ digits; minutes and seconds are always 2 digits.
 * Examples: 0ms → "0:00:00", 3661000ms → "1:01:01"
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  return `${hours}:${mm}:${ss}`
}
