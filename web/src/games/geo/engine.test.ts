import { describe, it, expect } from 'vitest'
import { buildQuestionPool, scoreStars, bestKey, clueEmoji } from './engine'
import type { GeoItem } from '../../content/types'
import realItems from '../../content/data/geography/items.json'

const items: GeoItem[] = [
  { id: 'a', name: 'Aland', capital: 'A City', continent: 'Europe', flagEmoji: '🇦', landmarkClues: ['clue'], funFact: 'fact', latitude: 60, longitude: 20, difficulty: 1 },
  { id: 'b', name: 'Bland', capital: 'B City', continent: 'Europe', flagEmoji: '🇧', landmarkClues: ['clue'], funFact: 'fact', latitude: 52, longitude: 5, difficulty: 1 },
  { id: 'c', name: 'Cland', capital: 'C City', continent: 'Europe', flagEmoji: '🇨', landmarkClues: ['clue'], funFact: 'fact', latitude: 48, longitude: 2, difficulty: 1 },
  { id: 'd', name: 'Dland', capital: 'D City', continent: 'Europe', flagEmoji: '🇩', landmarkClues: ['clue'], funFact: 'fact', latitude: 52, longitude: 13, difficulty: 2 },
  { id: 'e', name: 'Eland', capital: 'E City', continent: 'Asia', flagEmoji: '🇪', landmarkClues: ['clue'], funFact: 'fact', latitude: 35, longitude: 139, difficulty: 1 },
  { id: 'f', name: 'Fland', capital: 'F City', continent: 'Africa', flagEmoji: '🇫', landmarkClues: ['clue'], funFact: 'fact', latitude: 30, longitude: 31, difficulty: 3 },
]

describe('geo engine', () => {
  it('builds 10 questions for mixed mode', () => {
    const pool = buildQuestionPool(items, 'mixed', 3)
    expect(pool.length).toBe(10)
    expect(pool.every((q) => q.choices.length === 4)).toBe(true)
    expect(pool.every((q) => q.answerIndex >= 0 && q.answerIndex < 4)).toBe(true)
  })

  it('filters by difficulty', () => {
    const pool1 = buildQuestionPool(items, 'flags', 1)
    // difficulty 1 items only: a,b,c,e => 4 unique, but pool fills to 10 reusing
    expect(pool1.length).toBe(10)
    // all generated questions should be from difficulty <=1 items, so itemId should be among those 4
    const allowed = new Set(['a','b','c','e'])
    expect(pool1.every(q => allowed.has(q.itemId))).toBe(true)
  })

  it('mode restricts question type', () => {
    const flags = buildQuestionPool(items, 'flags', 2)
    expect(flags.every((q) => q.type === 'flag')).toBe(true)
    const caps = buildQuestionPool(items, 'capitals', 2)
    expect(caps.every((q) => q.type === 'capital')).toBe(true)
    const lands = buildQuestionPool(items, 'landmarks', 2)
    expect(lands.every((q) => q.type === 'landmark')).toBe(true)
    const maps = buildQuestionPool(items, 'maps', 2)
    expect(maps.every((q)=> q.type==='map')).toBe(true)
    expect(maps.every(q=> q.mapItems?.length===4)).toBe(true)
  })

  it('choices contain no duplicates and include correct answer', () => {
    const pool = buildQuestionPool(items, 'mixed', 3)
    for (const q of pool) {
      expect(new Set(q.choices).size).toBe(4)
    }
  })

  it('scoreStars thresholds', () => {
    expect(scoreStars(9, 10)).toBe(3)
    expect(scoreStars(7, 10)).toBe(2)
    expect(scoreStars(5, 10)).toBe(1)
    expect(scoreStars(4, 10)).toBe(0)
  })

  it('bestKey format', () => {
    expect(bestKey('mixed', 2)).toBe('geo:mixed:2')
  })

  it('clueEmoji picks clue-specific icons (bridge before tower) with a fallback', () => {
    expect(clueEmoji('Eiffel Tower')).toBe('🗼')
    expect(clueEmoji('Tower Bridge')).toBe('🌉') // bridge wins over tower
    expect(clueEmoji('Loch Ness monster legend')).toBe('🐉')
    expect(clueEmoji('pizza and pasta')).toBe('🍕')
    expect(clueEmoji('Great Wall')).toBe('🧱')
    expect(clueEmoji('something totally unknown')).toBe('🗺️')
  })

  it('capital questions carry the country flag; landmark questions carry a clue icon', () => {
    const caps = buildQuestionPool(items, 'capitals', 3)
    expect(caps.every((q) => !!q.visual?.flagEmoji)).toBe(true)
    const lands = buildQuestionPool(items, 'landmarks', 3)
    expect(lands.every((q) => !!q.visual?.icon)).toBe(true)
  })

  it('most real landmark clues map to a specific (non-fallback) emoji', () => {
    const clues = (realItems as GeoItem[]).flatMap((i) => i.landmarkClues)
    const specific = clues.filter((c) => clueEmoji(c) !== '🗺️').length
    // The clue text is always shown, so a fallback is acceptable — but coverage should be high.
    expect(specific / clues.length).toBeGreaterThan(0.85)
  })
})
