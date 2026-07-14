import { describe, it, expect } from 'vitest'
import { runProgram, expand, isWin, type Level } from './robot'

const base: Level = {
  id: 't',
  cols: 3,
  rows: 3,
  start: { x: 0, y: 0 },
  goal: { x: 2, y: 2 },
  walls: [],
  gems: [],
}

describe('robot engine', () => {
  it('expands a repeated pattern (guarded)', () => {
    expect(expand(['R', 'D'], 3)).toEqual(['R', 'D', 'R', 'D', 'R', 'D'])
    expect(expand(['R'], 0)).toEqual(['R']) // min 1
    expect(expand(['R'], 999).length).toBeLessThanOrEqual(200)
  })

  it('reaches the goal with the right sequence', () => {
    const r = runProgram(base, ['R', 'R', 'D', 'D'])
    expect(r.reachedGoal).toBe(true)
    expect(r.crashed).toBe(false)
    expect(isWin(r)).toBe(true)
    expect(r.path[r.path.length - 1]).toEqual({ x: 2, y: 2 })
  })

  it('does not win when the goal is missed', () => {
    const r = runProgram(base, ['R', 'R'])
    expect(r.reachedGoal).toBe(false)
    expect(isWin(r)).toBe(false)
  })

  it('crashes off the grid and stops', () => {
    const r = runProgram(base, ['U'])
    expect(r.crashed).toBe(true)
    expect(r.crashAt).toBe(0)
    expect(r.path.length).toBe(1) // never left the start cell
  })

  it('crashes into a wall', () => {
    const level: Level = { ...base, walls: [{ x: 1, y: 0 }] }
    const r = runProgram(level, ['R'])
    expect(r.crashed).toBe(true)
  })

  it('requires all gems for a win', () => {
    const level: Level = { ...base, gems: [{ x: 1, y: 0 }] }
    const miss = runProgram(level, ['D', 'D', 'R', 'R'])
    expect(miss.reachedGoal).toBe(true)
    expect(miss.collectedAll).toBe(false)
    expect(isWin(miss)).toBe(false)
    const got = runProgram(level, ['R', 'D', 'D', 'R']) // via the gem
    expect(isWin(got)).toBe(true)
  })

  it('only repeats when the level allows it', () => {
    const noLoop = runProgram(base, ['R', 'D'], 2) // repeat ignored
    expect(noLoop.reachedGoal).toBe(false)
    const loopLevel: Level = { ...base, allowRepeat: true }
    const looped = runProgram(loopLevel, ['R', 'D'], 2) // R,D,R,D → (2,2)
    expect(isWin(looped)).toBe(true)
  })
})
