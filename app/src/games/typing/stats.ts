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
