import { describe, it, expect } from 'vitest'
import { isCorrect, nextScore, stars } from './scoring'
import type { Question } from '../../content/types'

const q = (answerIndex: number): Question => ({
  id: 'x',
  category: 'test',
  prompt: '',
  choices: ['a', 'b', 'c', 'd'],
  answerIndex,
  difficulty: 1,
})

describe('quiz scoring', () => {
  it('detects correct answer', () => {
    expect(isCorrect(q(2), 2)).toBe(true)
    expect(isCorrect(q(2), 0)).toBe(false)
  })

  it('adds a point on correct only', () => {
    expect(nextScore(3, true)).toBe(4)
    expect(nextScore(3, false)).toBe(3)
  })

  it('awards stars by ratio', () => {
    expect(stars(10, 10)).toBe(3)
    expect(stars(6, 10)).toBe(2)
    expect(stars(3, 10)).toBe(1)
    expect(stars(1, 10)).toBe(0)
    expect(stars(0, 0)).toBe(0)
  })
})
