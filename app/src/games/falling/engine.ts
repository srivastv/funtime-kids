import type { FallingWord } from '../../content/types'

/** A single word currently falling on screen. Positions are in percent. */
export type Faller = {
  id: number
  word: string
  xPct: number // 0 (left) .. 100 (right)
  yPct: number // 0 (top) .. 100 (bottom)
  speed: number // percent per second
}

export type FallingStatus = 'playing' | 'over'

export type FallingState = {
  fallers: Faller[]
  typed: string
  score: number
  lives: number
  status: FallingStatus
}

export const INITIAL_LIVES = 3

export function initState(lives: number = INITIAL_LIVES): FallingState {
  return { fallers: [], typed: '', score: 0, lives, status: 'playing' }
}

/** Fall speed (percent/second) grows with score, capped so it stays playable. */
export function fallSpeed(score: number): number {
  return 6 + Math.min(score, 40) * 0.4 // 6%/s -> ~22%/s
}

/** Milliseconds between spawns; shrinks with score, floored so it stays fair. */
export function spawnIntervalMs(score: number): number {
  return Math.max(700, 2000 - score * 25)
}

/** Longer words are worth more points. */
export function pointsFor(word: string): number {
  return word.length
}

/** Hardest word tier allowed at the current score. */
export function maxDifficultyForScore(score: number): 1 | 2 | 3 {
  if (score < 12) return 1
  if (score < 30) return 2
  return 3
}

/** Choose the next word to spawn, respecting the current difficulty tier. */
export function pickWord(
  words: FallingWord[],
  score: number,
  rnd: () => number = Math.random,
): string {
  const max = maxDifficultyForScore(score)
  const pool = words.filter((w) => w.difficulty <= max)
  const list = pool.length > 0 ? pool : words
  return list[Math.floor(rnd() * list.length)].word
}

export function addFaller(state: FallingState, faller: Faller): FallingState {
  return { ...state, fallers: [...state.fallers, faller] }
}

/**
 * Advance all fallers by dtMs. Any faller reaching the bottom is removed and
 * costs a life; when lives hit zero the game is over.
 */
export function tick(state: FallingState, dtMs: number): FallingState {
  if (state.status !== 'playing') return state
  const dt = dtMs / 1000
  const moved = state.fallers.map((f) => ({ ...f, yPct: f.yPct + f.speed * dt }))
  const landed = moved.filter((f) => f.yPct >= 100).length
  const remaining = moved.filter((f) => f.yPct < 100)
  const lives = Math.max(0, state.lives - landed)
  return {
    ...state,
    fallers: remaining,
    lives,
    status: lives <= 0 ? 'over' : 'playing',
  }
}

/**
 * Apply the current typed text. If it exactly matches a falling word, that word
 * pops (scores, and the input clears). Otherwise the typed text is retained.
 */
export function submitTyped(state: FallingState, typed: string): FallingState {
  const idx = state.fallers.findIndex((f) => f.word === typed)
  if (idx === -1) return { ...state, typed }
  const cleared = state.fallers[idx]
  return {
    ...state,
    fallers: state.fallers.filter((_, i) => i !== idx),
    score: state.score + pointsFor(cleared.word),
    typed: '',
  }
}
