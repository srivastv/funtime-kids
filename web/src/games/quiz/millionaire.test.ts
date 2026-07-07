import { describe, it, expect } from 'vitest'
import {
  LADDER_AMOUNTS,
  LADDER_SIZE,
  SAFE_HAVEN_INDICES,
  formatMoney,
  isSafeHaven,
  walkAwayAmount,
  fallbackAmount,
  buildLadder,
  fiftyFifty,
  audienceVotes,
  swapQuestion,
} from './millionaire'
import type { Question } from '../../content/types'

function makePool(): Question[] {
  const pool: Question[] = []
  const cats = ['animals', 'space', 'maths']
  for (const cat of cats) {
    for (const d of [1, 2, 3] as const) {
      for (let n = 0; n < 3; n++) {
        pool.push({
          id: `${cat}-${d}-${n}`,
          category: cat,
          prompt: 'q',
          choices: ['a', 'b', 'c', 'd'],
          answerIndex: 1,
          difficulty: d,
        })
      }
    }
  }
  return pool
}

describe('money ladder', () => {
  it('has 15 rungs ending at £1,000,000', () => {
    expect(LADDER_SIZE).toBe(15)
    expect(LADDER_AMOUNTS[14]).toBe(1000000)
  })

  it('formats money with commas and £', () => {
    expect(formatMoney(1000000)).toBe('£1,000,000')
    expect(formatMoney(100)).toBe('£100')
  })

  it('marks safe havens', () => {
    expect(SAFE_HAVEN_INDICES).toEqual([4, 9])
    expect(isSafeHaven(4)).toBe(true)
    expect(isSafeHaven(3)).toBe(false)
  })

  it('walk-away banks the last answered rung', () => {
    expect(walkAwayAmount(0)).toBe(0)
    expect(walkAwayAmount(3)).toBe(LADDER_AMOUNTS[2])
  })

  it('wrong answer drops to the last passed safe haven', () => {
    expect(fallbackAmount(2)).toBe(0) // before first haven
    expect(fallbackAmount(6)).toBe(1000) // passed haven at index 4
    expect(fallbackAmount(12)).toBe(32000) // passed haven at index 9
  })
})

describe('buildLadder', () => {
  it('returns 15 unique questions ordered easy -> hard', () => {
    const ladder = buildLadder(makePool(), 'mixed')
    expect(ladder).toHaveLength(15)
    const ids = new Set(ladder.map((q) => q.id))
    expect(ids.size).toBe(15)
    const diffs = ladder.map((q) => q.difficulty)
    const sorted = [...diffs].sort((a, b) => a - b)
    expect(diffs).toEqual(sorted)
  })

  it('prefers the chosen category early', () => {
    const ladder = buildLadder(makePool(), 'space')
    // The first (easy) rung should favour the chosen category.
    expect(ladder[0].category).toBe('space')
  })
})

describe('lifelines', () => {
  const q: Question = {
    id: 'x',
    category: 'test',
    prompt: 'q',
    choices: ['a', 'b', 'c', 'd'],
    answerIndex: 2,
    difficulty: 1,
  }

  it('50:50 removes two wrong answers only', () => {
    const removed = fiftyFifty(q, () => 0)
    expect(removed).toHaveLength(2)
    expect(removed).not.toContain(q.answerIndex)
  })

  it('audience votes sum to 100 and favour the correct answer', () => {
    const votes = audienceVotes(q, () => 0.5)
    expect(votes.reduce((a, b) => a + b, 0)).toBe(100)
    const maxIdx = votes.indexOf(Math.max(...votes))
    expect(maxIdx).toBe(q.answerIndex)
  })

  it('swap returns an unused question, preferring same difficulty', () => {
    const pool = makePool()
    const current = pool.find((p) => p.difficulty === 2)!
    const used = new Set<string>([current.id])
    const swapped = swapQuestion(pool, current, used)
    expect(swapped).not.toBeNull()
    expect(swapped!.id).not.toBe(current.id)
    expect(used.has(swapped!.id)).toBe(false)
    expect(swapped!.difficulty).toBe(2)
  })
})
