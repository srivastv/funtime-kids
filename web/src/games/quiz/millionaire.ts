import type { Question } from '../../content/types'
import { shuffle } from '../../lib/shuffle'

/** Classic 15-rung money ladder, £100 -> £1,000,000. */
export const LADDER_AMOUNTS = [
  100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000,
  250000, 500000, 1000000,
]

/** Guaranteed milestones (0-based rung indices): £1,000 and £32,000. */
export const SAFE_HAVEN_INDICES = [4, 9]

export const LADDER_SIZE = LADDER_AMOUNTS.length

export function formatMoney(amount: number): string {
  return '£' + amount.toLocaleString('en-GB')
}

export function isSafeHaven(index: number): boolean {
  return SAFE_HAVEN_INDICES.includes(index)
}

/** Winnings banked if the player walks away before answering rung `index`. */
export function walkAwayAmount(index: number): number {
  return index <= 0 ? 0 : LADDER_AMOUNTS[index - 1]
}

/** Winnings kept if the player answers rung `index` wrong (drops to safe haven). */
export function fallbackAmount(index: number): number {
  const lastAnswered = index - 1
  let amount = 0
  for (const haven of SAFE_HAVEN_INDICES) {
    if (haven <= lastAnswered) amount = LADDER_AMOUNTS[haven]
  }
  return amount
}

/**
 * Build a 15-question ladder ordered easy -> hard. Difficulty tiers map to
 * rungs 1-5 (easy), 6-10 (medium), 11-15 (hard). Questions from `category`
 * are preferred; when a tier is short it borrows from other tiers so the
 * ladder always fills.
 */
export function buildLadder(pool: Question[], category: string): Question[] {
  const perTier = 5
  const used = new Set<string>()

  const tierPool = (d: 1 | 2 | 3): Question[] => {
    const all = pool.filter((q) => q.difficulty === d)
    if (category === 'mixed') return shuffle(all)
    const preferred = all.filter((q) => q.category === category)
    const rest = all.filter((q) => q.category !== category)
    return [...shuffle(preferred), ...shuffle(rest)]
  }

  const tiers = [tierPool(1), tierPool(2), tierPool(3)]

  const take = (arr: Question[], n: number): Question[] => {
    const out: Question[] = []
    for (const q of arr) {
      if (out.length >= n) break
      if (!used.has(q.id)) {
        out.push(q)
        used.add(q.id)
      }
    }
    return out
  }

  const ladder: Question[] = []
  for (let d = 0; d < 3; d++) {
    let picked = take(tiers[d], perTier)
    if (picked.length < perTier) {
      // Borrow from any remaining questions to guarantee a full ladder.
      const fallback = shuffle(pool)
      picked = [...picked, ...take(fallback, perTier - picked.length)]
    }
    ladder.push(...picked)
  }
  return ladder.slice(0, LADDER_SIZE)
}

/** Two wrong-answer indices to remove for the 50:50 lifeline. */
export function fiftyFifty(q: Question, rnd: () => number = Math.random): number[] {
  const wrong = q.choices
    .map((_, i) => i)
    .filter((i) => i !== q.answerIndex)
  return shuffleWith(wrong, rnd).slice(0, 2)
}

/**
 * Audience vote percentages per choice (sum to 100), weighted toward the
 * correct answer so the "audience" is usually — but not always — right.
 */
export function audienceVotes(q: Question, rnd: () => number = Math.random): number[] {
  const n = q.choices.length
  const votes = new Array<number>(n).fill(0)
  const correctShare = 55 + Math.floor(rnd() * 25) // 55–79%
  votes[q.answerIndex] = correctShare

  const others = q.choices.map((_, i) => i).filter((i) => i !== q.answerIndex)
  let remaining = 100 - correctShare
  others.forEach((idx, k) => {
    if (k === others.length - 1) {
      votes[idx] = remaining
    } else {
      const v = Math.floor(rnd() * (remaining + 1))
      votes[idx] = v
      remaining -= v
    }
  })
  return votes
}

/** Pick a replacement question for the swap lifeline (same difficulty if possible). */
export function swapQuestion(
  pool: Question[],
  current: Question,
  usedIds: Set<string>,
): Question | null {
  const available = pool.filter((q) => q.id !== current.id && !usedIds.has(q.id))
  const sameDiff = available.filter((q) => q.difficulty === current.difficulty)
  const candidates = sameDiff.length > 0 ? sameDiff : available
  if (candidates.length === 0) return null
  return shuffle(candidates)[0]
}

function shuffleWith<T>(arr: readonly T[], rnd: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
