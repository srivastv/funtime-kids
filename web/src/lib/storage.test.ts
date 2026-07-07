import { describe, it, expect, beforeEach } from 'vitest'
import { loadBest, saveBest } from './storage'

describe('storage best-score helper', () => {
  beforeEach(() => localStorage.clear())

  it('returns 0 when nothing is stored', () => {
    expect(loadBest('quiz:animals')).toBe(0)
  })

  it('keeps the higher score', () => {
    saveBest('quiz:animals', 3)
    saveBest('quiz:animals', 2)
    expect(loadBest('quiz:animals')).toBe(3)
    saveBest('quiz:animals', 10)
    expect(loadBest('quiz:animals')).toBe(10)
  })

  it('survives corrupt values', () => {
    localStorage.setItem('funtime:best:quiz:x', 'not-a-number')
    expect(loadBest('quiz:x')).toBe(0)
  })
})
