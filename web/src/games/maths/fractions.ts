export type Fraction = { num: number; den: number }

/** How many items make a fraction of a set, e.g. 1/4 of 12 = 3. */
export function fractionOfSet(f: Fraction, total: number): number {
  return (f.num / f.den) * total
}

/** SVG path for one equal sector of a circle (slice `index` of `count`), 12 o'clock start. */
export function sectorPath(cx: number, cy: number, r: number, index: number, count: number): string {
  const a0 = (index / count) * 2 * Math.PI - Math.PI / 2
  const a1 = ((index + 1) / count) * 2 * Math.PI - Math.PI / 2
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const large = a1 - a0 > Math.PI ? 1 : 0
  if (count === 1) return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
}
