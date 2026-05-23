import { describe, it, expect } from 'vitest'
import { formatTime } from '../../src/lib/formatTime'

describe('formatTime', () => {
  it('formats 0ms as 0:00:00.000', () => {
    expect(formatTime(0)).toBe('0:00:00.000')
  })

  it('formats 999ms as 0:00:00.999', () => {
    expect(formatTime(999)).toBe('0:00:00.999')
  })

  it('formats 1000ms as 0:00:01.000', () => {
    expect(formatTime(1000)).toBe('0:00:01.000')
  })

  it('formats 59999ms as 0:00:59.999', () => {
    expect(formatTime(59999)).toBe('0:00:59.999')
  })

  it('formats 3600000ms as 1:00:00.000', () => {
    expect(formatTime(3600000)).toBe('1:00:00.000')
  })

  it('formats 3661000ms as 1:01:01.000', () => {
    expect(formatTime(3661000)).toBe('1:01:01.000')
  })

  it('formats 60000ms as 0:01:00.000', () => {
    expect(formatTime(60000)).toBe('0:01:00.000')
  })

  it('formats 7200000ms as 2:00:00.000', () => {
    expect(formatTime(7200000)).toBe('2:00:00.000')
  })

  it('formats 86399000ms as 23:59:59.000', () => {
    expect(formatTime(86399000)).toBe('23:59:59.000')
  })

  it('pads minutes and seconds with two digits', () => {
    expect(formatTime(61000)).toBe('0:01:01.000')
  })

  it('handles partial seconds by flooring seconds and keeping millis', () => {
    expect(formatTime(1500)).toBe('0:00:01.500')
  })

  it('pads milliseconds with three digits', () => {
    expect(formatTime(1005)).toBe('0:00:01.005')
  })
})
