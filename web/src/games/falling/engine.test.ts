import { describe, it, expect } from 'vitest'
import {
  initState,
  fallSpeed,
  spawnIntervalMs,
  pointsFor,
  maxDifficultyForScore,
  pickWord,
  addFaller,
  tick,
  submitTyped,
  type Faller,
} from './engine'
import type { FallingWord } from '../../content/types'

const faller = (id: number, word: string, yPct = 0): Faller => ({
  id,
  word,
  xPct: 10,
  yPct,
  speed: 10,
})

describe('falling engine', () => {
  it('starts with 3 lives and no fallers', () => {
    const s = initState()
    expect(s.lives).toBe(3)
    expect(s.fallers).toEqual([])
    expect(s.status).toBe('playing')
  })

  it('speeds up and spawns faster as score climbs', () => {
    expect(fallSpeed(20)).toBeGreaterThan(fallSpeed(0))
    expect(spawnIntervalMs(20)).toBeLessThan(spawnIntervalMs(0))
    expect(spawnIntervalMs(1000)).toBeGreaterThanOrEqual(700) // floored
  })

  it('scores longer words higher', () => {
    expect(pointsFor('cat')).toBe(3)
    expect(pointsFor('rocket')).toBe(6)
  })

  it('gates word difficulty by score', () => {
    expect(maxDifficultyForScore(0)).toBe(1)
    expect(maxDifficultyForScore(20)).toBe(2)
    expect(maxDifficultyForScore(50)).toBe(3)
  })

  it('only picks words within the allowed difficulty', () => {
    const words: FallingWord[] = [
      { word: 'cat', difficulty: 1 },
      { word: 'rocket', difficulty: 3 },
    ]
    // score 0 -> only difficulty 1 allowed, regardless of rnd
    expect(pickWord(words, 0, () => 0)).toBe('cat')
    expect(pickWord(words, 0, () => 0.999)).toBe('cat')
  })

  it('moves fallers down and removes them at the bottom, costing a life', () => {
    let s = initState()
    s = addFaller(s, faller(1, 'cat', 95))
    s = tick(s, 1000) // 10%/s * 1s => yPct 105 -> landed
    expect(s.fallers).toHaveLength(0)
    expect(s.lives).toBe(2)
    expect(s.status).toBe('playing')
  })

  it('ends the game when lives run out', () => {
    let s = initState(1)
    s = addFaller(s, faller(1, 'cat', 99))
    s = tick(s, 1000)
    expect(s.lives).toBe(0)
    expect(s.status).toBe('over')
  })

  it('clears a matched word and scores it', () => {
    let s = initState()
    s = addFaller(s, faller(1, 'cat'))
    s = addFaller(s, faller(2, 'dog'))
    s = submitTyped(s, 'cat')
    expect(s.fallers.map((f) => f.word)).toEqual(['dog'])
    expect(s.score).toBe(3)
    expect(s.typed).toBe('')
  })

  it('retains typed text when no word matches', () => {
    let s = initState()
    s = addFaller(s, faller(1, 'cat'))
    s = submitTyped(s, 'ca')
    expect(s.fallers).toHaveLength(1)
    expect(s.score).toBe(0)
    expect(s.typed).toBe('ca')
  })
})
