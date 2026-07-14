export type Move = 'U' | 'D' | 'L' | 'R'
export type Pos = { x: number; y: number }

export type Level = {
  id: string
  cols: number
  rows: number
  start: Pos
  goal: Pos
  walls: Pos[]
  gems: Pos[]
  /** Level-2 levels let the player repeat the whole pattern N times. */
  allowRepeat?: boolean
  maxBlocks?: number
  hint?: string
  /** Debug It! only: the almost-right program the player must fix. */
  buggy?: { commands: Move[]; repeat?: number }
}

export type RunResult = {
  path: Pos[] // positions including the start, one per executed step (for animation)
  reachedGoal: boolean
  collectedAll: boolean
  crashed: boolean // ran into a wall or off the grid
  crashAt?: number // index in `path` of the last good cell before a crash
}

const DELTA: Record<Move, Pos> = {
  U: { x: 0, y: -1 },
  D: { x: 0, y: 1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 },
}

const MAX_STEPS = 200

const key = (p: Pos) => `${p.x},${p.y}`

/** Expand a pattern repeated `repeat` times into a flat move list (guarded). */
export function expand(commands: Move[], repeat = 1): Move[] {
  const r = Math.max(1, Math.min(Math.floor(repeat), 20))
  const out: Move[] = []
  for (let i = 0; i < r; i++) out.push(...commands)
  return out.slice(0, MAX_STEPS)
}

/** Simulate a program on a level, returning the path and whether it wins. */
export function runProgram(level: Level, commands: Move[], repeat = 1): RunResult {
  const seq = expand(commands, level.allowRepeat ? repeat : 1)
  const walls = new Set(level.walls.map(key))
  const gemsLeft = new Set(level.gems.map(key))
  let pos = { ...level.start }
  const path: Pos[] = [{ ...pos }]
  gemsLeft.delete(key(pos))

  let crashed = false
  let crashAt: number | undefined
  for (const move of seq) {
    const d = DELTA[move]
    const next = { x: pos.x + d.x, y: pos.y + d.y }
    const offGrid = next.x < 0 || next.y < 0 || next.x >= level.cols || next.y >= level.rows
    if (offGrid || walls.has(key(next))) {
      crashed = true
      crashAt = path.length - 1
      break
    }
    pos = next
    path.push({ ...pos })
    gemsLeft.delete(key(pos))
  }

  return {
    path,
    reachedGoal: pos.x === level.goal.x && pos.y === level.goal.y,
    collectedAll: gemsLeft.size === 0,
    crashed,
    crashAt,
  }
}

/** A win is a clean run that reaches the goal and collects every gem. */
export function isWin(r: RunResult): boolean {
  return !r.crashed && r.reachedGoal && r.collectedAll
}
