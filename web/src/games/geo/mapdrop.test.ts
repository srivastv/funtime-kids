import { describe, it, expect } from 'vitest'
import { buildQuestionPool } from './engine'
import type { GeoItem } from '../../content/types'

const items: GeoItem[] = [
  { id: 'a', name: 'Aland', capital: 'A City', continent: 'Asia', flagEmoji: '🇦', landmarkClues: ['clue'], funFact: 'fact', latitude: 35, longitude: 139, difficulty: 1 },
  { id: 'b', name: 'Bland', capital: 'B City', continent: 'Asia', flagEmoji: '🇧', landmarkClues: ['clue'], funFact: 'fact', latitude: 20, longitude: 78, difficulty: 1 },
  { id: 'c', name: 'Cland', capital: 'C City', continent: 'Asia', flagEmoji: '🇨', landmarkClues: ['clue'], funFact: 'fact', latitude: 16, longitude: 108, difficulty: 1 },
  { id: 'd', name: 'Dland', capital: 'D City', continent: 'Asia', flagEmoji: '🇩', landmarkClues: ['clue'], funFact: 'fact', latitude: 27, longitude: 90, difficulty: 1 },
]

describe('landmark hunt generator', () => {
  it('produces landmarkmap questions with geo-located candidates and a clue prompt', () => {
    const pool = buildQuestionPool(items, 'landmarkmap', 1)
    expect(pool.length).toBe(10)
    expect(pool.every((q) => q.type === 'landmarkmap')).toBe(true)
    for (const q of pool) {
      expect(q.mapItems?.length).toBe(4)
      expect(q.mapItems!.every((m) => typeof m.lat === 'number')).toBe(true)
      expect(q.prompt.length).toBeGreaterThan(0)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.mapItems![q.answerIndex].name).toBe(q.choices[q.answerIndex])
    }
  })
})

describe('capital match generator', () => {
  it('produces capitalmatch rounds with 4 country/capital pairs', () => {
    const pool = buildQuestionPool(items, 'capitalmatch', 1)
    expect(pool.length).toBe(10)
    expect(pool.every((q) => q.type === 'capitalmatch')).toBe(true)
    for (const q of pool) {
      expect(q.pairs?.length).toBe(4)
      expect(q.pairs!.every((p) => p.country && p.capital)).toBe(true)
      // no duplicate countries or capitals within a round
      expect(new Set(q.pairs!.map((p) => p.country)).size).toBe(4)
      expect(new Set(q.pairs!.map((p) => p.capital)).size).toBe(4)
    }
  })
})

describe('map drop generator', () => {
  it('produces map questions with 4 geo-located candidates', () => {
    const pool = buildQuestionPool(items, 'maps', 1)
    expect(pool.length).toBe(10)
    expect(pool.every((q) => q.type === 'map')).toBe(true)
    for (const q of pool) {
      expect(q.mapItems).toBeDefined()
      expect(q.mapItems!.length).toBe(4)
      // every candidate carries real coordinates
      expect(q.mapItems!.every((m) => typeof m.lat === 'number' && typeof m.lon === 'number')).toBe(true)
      // the flag to drag is the correct candidate's flag
      expect(q.visual?.flagEmoji).toBe(q.mapItems![q.answerIndex].flagEmoji)
      // the correct candidate matches the item being asked
      expect(q.mapItems![q.answerIndex].name).toBe(q.choices[q.answerIndex])
    }
  })
})
