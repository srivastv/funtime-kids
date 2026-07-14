import { describe, it, expect } from 'vitest'
import { fractionOfSet } from './fractions'
import { fractionToPercent, within } from './potion'
import { addMinutes, angleToMinute, angleToHour, minuteAngle, hourAngle, timeEquals } from './clock'

describe('fractions', () => {
  it('fraction of a set', () => {
    expect(fractionOfSet({ num: 1, den: 4 }, 12)).toBe(3)
    expect(fractionOfSet({ num: 3, den: 8 }, 8)).toBe(3)
    expect(fractionOfSet({ num: 2, den: 3 }, 9)).toBe(6)
  })
})

describe('potion (fraction ↔ percent)', () => {
  it('converts fractions to percent', () => {
    expect(fractionToPercent(3, 4)).toBe(75)
    expect(fractionToPercent(1, 2)).toBe(50)
    expect(fractionToPercent(1, 10)).toBe(10)
    expect(fractionToPercent(1, 3)).toBe(33)
  })
  it('tolerance check', () => {
    expect(within(74, 75, 4)).toBe(true)
    expect(within(60, 75, 4)).toBe(false)
  })
})

describe('clock', () => {
  it('adds minutes with wraparound', () => {
    expect(addMinutes({ h: 3, m: 0 }, 25)).toEqual({ h: 3, m: 25 })
    expect(addMinutes({ h: 3, m: 50 }, 20)).toEqual({ h: 4, m: 10 })
    expect(addMinutes({ h: 12, m: 30 }, 40)).toEqual({ h: 1, m: 10 })
  })
  it('hand angles', () => {
    expect(minuteAngle(15)).toBe(90)
    expect(minuteAngle(30)).toBe(180)
    expect(hourAngle(3, 0)).toBe(90)
    expect(hourAngle(12, 0)).toBe(0)
    expect(hourAngle(6, 30)).toBe(195) // 180 + 15
  })
  it('angle → minute / hour (snapping)', () => {
    expect(angleToMinute(90)).toBe(15)
    expect(angleToMinute(0)).toBe(0)
    expect(angleToMinute(359)).toBe(0) // wraps to 12 o'clock
    expect(angleToHour(90)).toBe(3)
    expect(angleToHour(0)).toBe(12)
    expect(angleToHour(360)).toBe(12)
  })
  it('time equality', () => {
    expect(timeEquals({ h: 3, m: 25 }, { h: 3, m: 25 })).toBe(true)
    expect(timeEquals({ h: 3, m: 25 }, { h: 3, m: 30 })).toBe(false)
  })
})
