import { describe, it, expect } from 'vitest'
import { accuracy, wpm, correctChars, correctPrefix, botProgress } from './stats'

describe('typing stats', () => {
  it('computes accuracy %', () => {
    expect(accuracy('hello', 'hello')).toBe(100)
    expect(accuracy('hxllo', 'hello')).toBe(80)
    expect(accuracy('', 'hello')).toBe(100)
  })

  it('computes wpm (5 chars = 1 word)', () => {
    // 25 correct chars in 60s => 5 words / 1 min = 5 wpm
    expect(wpm(25, 60000)).toBe(5)
    expect(wpm(0, 0)).toBe(0)
  })

  it('counts matching positions', () => {
    expect(correctChars('hello', 'hello')).toBe(5)
    expect(correctChars('helXo', 'hello')).toBe(4)
    expect(correctChars('', 'hello')).toBe(0)
  })

  it('correctPrefix stops at the first mistake', () => {
    expect(correctPrefix('hello', 'hello')).toBe(5)
    expect(correctPrefix('helXo', 'hello')).toBe(3)
    expect(correctPrefix('Xello', 'hello')).toBe(0)
    expect(correctPrefix('hel', 'hello')).toBe(3)
  })

  it('botProgress advances with time and clamps to 0..1', () => {
    // 10 wpm = 50 chars/min. In 60s over a 50-char target => 100%.
    expect(botProgress(10, 60000, 50)).toBeCloseTo(1, 5)
    expect(botProgress(10, 30000, 50)).toBeCloseTo(0.5, 5)
    expect(botProgress(10, 0, 50)).toBe(0)
    expect(botProgress(10, 999999, 50)).toBe(1) // clamped
  })
})
