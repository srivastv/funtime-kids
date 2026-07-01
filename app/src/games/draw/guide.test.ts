import { describe, it, expect } from 'vitest'
import { shapesUpTo } from './guide'
import type { DrawStep } from '../../content/types'

const steps: DrawStep[] = [
  { instruction: 'a', shapes: [{ kind: 'circle', cx: 0.5, cy: 0.5, r: 0.2 }] },
  { instruction: 'b', shapes: [{ kind: 'line', x1: 0, y1: 0, x2: 1, y2: 1 }] },
  { instruction: 'c', shapes: [{ kind: 'rect', x: 0, y: 0, w: 1, h: 1 }] },
]

describe('shapesUpTo', () => {
  it('first step has nothing done and shows step 0 shapes', () => {
    const { done, current } = shapesUpTo(steps, 0)
    expect(done).toHaveLength(0)
    expect(current).toEqual(steps[0].shapes)
  })

  it('later step accumulates previous shapes as done', () => {
    const { done, current } = shapesUpTo(steps, 2)
    expect(done).toHaveLength(2) // steps 0 and 1
    expect(current).toEqual(steps[2].shapes)
  })

  it('index past the end has no current shapes', () => {
    const { done, current } = shapesUpTo(steps, 3)
    expect(done).toHaveLength(3)
    expect(current).toHaveLength(0)
  })
})
