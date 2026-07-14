/** Percentage of typed characters that match the target (0–100). */
export function accuracy(typed: string, target: string): number {
  if (typed.length === 0) return 100
  let correct = 0
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) correct++
  }
  return Math.round((correct / typed.length) * 100)
}

/** Words per minute, using the standard 5-characters-per-word convention. */
export function wpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  const minutes = elapsedMs / 60000
  return Math.round(correctChars / 5 / minutes)
}

/** Count of positions where `typed` matches `target` (used for WPM). */
export function correctChars(typed: string, target: string): number {
  let n = 0
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) n++
  }
  return n
}

/** Length of the leading run of correct characters — the racer's position. */
export function correctPrefix(typed: string, target: string): number {
  let n = 0
  while (n < typed.length && typed[n] === target[n]) n++
  return n
}

/** How far a pace-bot typing at `botWpm` has progressed (0..1) after `elapsedMs`. */
export function botProgress(botWpm: number, elapsedMs: number, targetLen: number): number {
  if (targetLen <= 0) return 1
  const chars = (botWpm * 5 * elapsedMs) / 60000
  return Math.max(0, Math.min(1, chars / targetLen))
}
