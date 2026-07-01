import type { Question } from '../../content/types'

export const isCorrect = (q: Question, choice: number) => q.answerIndex === choice

export const nextScore = (score: number, correct: boolean) =>
  correct ? score + 1 : score

/** Stars out of 3 based on the fraction of correct answers. */
export function stars(score: number, total: number): number {
  if (total === 0) return 0
  const ratio = score / total
  if (ratio >= 0.9) return 3
  if (ratio >= 0.6) return 2
  if (ratio >= 0.3) return 1
  return 0
}
