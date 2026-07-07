import type { DrawStep, DrawShape } from '../../content/types'

/**
 * Split a lesson's shapes into those already completed (steps before `index`)
 * and the shapes revealed at the current step.
 */
export function shapesUpTo(
  steps: DrawStep[],
  index: number,
): { done: DrawShape[]; current: DrawShape[] } {
  const done: DrawShape[] = []
  for (let i = 0; i < index && i < steps.length; i++) {
    done.push(...steps[i].shapes)
  }
  const current = steps[index]?.shapes ?? []
  return { done, current }
}
