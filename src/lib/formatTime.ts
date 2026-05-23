/**
 * Formats milliseconds as H:MM:SS.mmm
 * Hours can be 1+ digits; minutes and seconds are always 2 digits; milliseconds are always 3 digits.
 * Examples: 0ms → "0:00:00.000", 3661000ms → "1:01:01.000"
 */
export function formatTime(ms: number): string {
  ms = Math.max(0, ms)
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const millis = ms % 1000

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  const mmm = String(millis).padStart(3, '0')

  return `${hours}:${mm}:${ss}.${mmm}`
}
