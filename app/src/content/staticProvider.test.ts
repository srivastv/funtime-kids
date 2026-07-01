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
})
