import { describe, it, expect } from 'vitest'
import { staticProvider } from './staticProvider'

describe('staticProvider', () => {
  it('lists categories including Mixed', async () => {
    const cats = await staticProvider.getQuizCategories()
    expect(cats.some((c) => c.id === 'mixed')).toBe(true)
  })

  it('returns questions for a real category', async () => {
    const qs = await staticProvider.getQuizQuestions('animals')
    expect(qs.length).toBeGreaterThan(0)
    expect(qs.every((q) => q.category === 'animals')).toBe(true)
  })

  it('mixed returns questions from more than one category', async () => {
    const qs = await staticProvider.getQuizQuestions('mixed')
    const cats = new Set(qs.map((q) => q.category))
    expect(cats.size).toBeGreaterThan(1)
  })

  it('returns empty array for unknown category', async () => {
    const qs = await staticProvider.getQuizQuestions('nope')
    expect(qs).toEqual([])
  })

  it('returns typing lessons', async () => {
    const lessons = await staticProvider.getTypingLessons()
    expect(lessons.length).toBeGreaterThan(0)
  })

  it('returns geography items', async () => {
    const items = await staticProvider.getGeographyItems()
    expect(items.length).toBeGreaterThan(0)
    expect(items[0]).toHaveProperty('name')
    expect(items[0]).toHaveProperty('capital')
    expect(items[0]).toHaveProperty('continent')
  })

  it('returns odd experiments', async () => {
    const exps = await staticProvider.getOddExperiments()
    expect(exps.length).toBeGreaterThan(0)
    expect(exps[0]).toHaveProperty('topic')
    expect(exps[0]).toHaveProperty('prompt')
    expect(['plants','rocks','light','sound','forces','animals']).toContain(exps[0].topic)
  })

  it('returns number river levels', async () => {
    const levels = await staticProvider.getNumberRiverLevels()
    expect(levels.length).toBeGreaterThan(0)
    expect(levels[0]).toHaveProperty('target')
    expect(levels[0]).toHaveProperty('availableOps')
  })
})
