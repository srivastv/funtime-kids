/** Convert a fraction to a whole-number percent (e.g. 3/4 → 75). */
export function fractionToPercent(num: number, den: number): number {
  return Math.round((num / den) * 100)
}

/** Is `value` within `tol` of `target`? (used to check a poured level). */
export function within(value: number, target: number, tol: number): boolean {
  return Math.abs(value - target) <= tol
}
