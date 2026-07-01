import { describe, it, expect } from 'vitest'
import { accuracy, wpm, correctChars } from './stats'

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
})
