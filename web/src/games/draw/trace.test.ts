import { describe, it, expect } from 'vitest'
import { sampleShape, sampleLesson, scoreTrace } from './trace'
import type { DrawShape, DrawStep } from '../../content/types'

describe('sampleShape', () => {
  it('samples a line including both endpoints (in pixel coords)', () => {
    const line: DrawShape = { kind: 'line', x1: 0, y1: 0, x2: 1, y2: 0 }
    const pts = sampleShape(line, 100)
    expect(pts[0]).toEqual({ x: 0, y: 0 })
    expect(pts[pts.length - 1]).toEqual({ x: 100, y: 0 })
  })

  it('samples a circle as many points around the centre', () => {
    const c: DrawShape = { kind: 'circle', cx: 0.5, cy: 0.5, r: 0.25 }
    const pts = sampleShape(c, 400)
    expect(pts.length).toBeGreaterThanOrEqual(8)
    // every sampled point is ~r from the centre
    for (const p of pts) {
      const d = Math.hypot(p.x - 200, p.y - 200)
      expect(d).toBeCloseTo(100, 0)
    }
  })

  it('closes a polygon when close=true', () => {
    const openTri: DrawShape = { kind: 'poly', points: [[0, 0], [1, 0], [0.5, 1]], close: false }
    const closedTri: DrawShape = { kind: 'poly', points: [[0, 0], [1, 0], [0.5, 1]], close: true }
    expect(sampleShape(closedTri, 100).length).toBeGreaterThan(sampleShape(openTri, 100).length)
  })
})

describe('scoreTrace', () => {
  const guideSteps: DrawStep[] = [{ instruction: 'x', shapes: [{ kind: 'line', x1: 0, y1: 0, x2: 1, y2: 0 }] }]
  const guide = sampleLesson(guideSteps, 400)

  it('gives a perfect score when strokes cover the guide exactly', () => {
    const res = scoreTrace(guide, [guide], 20)
    expect(res.coverage).toBeCloseTo(1, 5)
    expect(res.neatness).toBeCloseTo(1, 5)
    expect(res.score).toBe(100)
    expect(res.stars).toBe(3)
  })

  it('scores zero for no strokes', () => {
    const res = scoreTrace(guide, [], 20)
    expect(res.score).toBe(0)
    expect(res.stars).toBe(0)
  })

  it('penalises scribbling far from the guide', () => {
    const scribble = [Array.from({ length: 40 }, (_, i) => ({ x: 350 + (i % 5), y: 350 + (i % 5) }))]
    const res = scoreTrace(guide, scribble, 20)
    expect(res.coverage).toBe(0)
    expect(res.neatness).toBe(0)
    expect(res.score).toBe(0)
  })

  it('partial trace gives partial coverage', () => {
    // trace only the left half of the line
    const half = guide.filter((p) => p.x <= 200)
    const res = scoreTrace(guide, [half], 12)
    expect(res.coverage).toBeGreaterThan(0.3)
    expect(res.coverage).toBeLessThan(0.75)
    expect(res.neatness).toBeCloseTo(1, 1) // what they drew was on the line
  })
})
