import type { DrawShape, DrawStep } from '../../content/types'

export type Pt = { x: number; y: number }

/** Sample points along a straight segment, roughly one every `step` pixels. */
function segment(ax: number, ay: number, bx: number, by: number, step = 8): Pt[] {
  const len = Math.hypot(bx - ax, by - ay)
  const n = Math.max(1, Math.round(len / step))
  const pts: Pt[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    pts.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t })
  }
  return pts
}

/** Sample one drawing shape into points, in canvas pixel coords (shapes are 0..1). */
export function sampleShape(shape: DrawShape, size: number): Pt[] {
  const S = (v: number) => v * size
  switch (shape.kind) {
    case 'line':
      return segment(S(shape.x1), S(shape.y1), S(shape.x2), S(shape.y2))
    case 'rect': {
      const x = S(shape.x), y = S(shape.y), w = S(shape.w), h = S(shape.h)
      return [
        ...segment(x, y, x + w, y),
        ...segment(x + w, y, x + w, y + h),
        ...segment(x + w, y + h, x, y + h),
        ...segment(x, y + h, x, y),
      ]
    }
    case 'poly': {
      const pts: Pt[] = []
      const p = shape.points
      for (let i = 0; i < p.length - 1; i++) {
        pts.push(...segment(S(p[i][0]), S(p[i][1]), S(p[i + 1][0]), S(p[i + 1][1])))
      }
      if (shape.close && p.length > 1) {
        pts.push(...segment(S(p[p.length - 1][0]), S(p[p.length - 1][1]), S(p[0][0]), S(p[0][1])))
      }
      return pts
    }
    case 'circle':
    case 'ellipse': {
      const cx = S(shape.cx), cy = S(shape.cy)
      const rx = S(shape.kind === 'circle' ? shape.r : shape.rx)
      const ry = S(shape.kind === 'circle' ? shape.r : shape.ry)
      const circumference = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)))
      const n = Math.max(8, Math.round(circumference / 8))
      const pts: Pt[] = []
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry })
      }
      return pts
    }
    case 'curve': {
      // Quadratic Bézier sampled at a fixed resolution.
      const x1 = S(shape.x1), y1 = S(shape.y1)
      const cx = S(shape.cx), cy = S(shape.cy)
      const x2 = S(shape.x2), y2 = S(shape.y2)
      const n = 24
      const pts: Pt[] = []
      for (let i = 0; i <= n; i++) {
        const t = i / n
        const mt = 1 - t
        pts.push({
          x: mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
          y: mt * mt * y1 + 2 * mt * t * cy + t * t * y2,
        })
      }
      return pts
    }
  }
}

/** All guide points for an entire lesson (every step's shapes). */
export function sampleLesson(steps: DrawStep[], size: number): Pt[] {
  const pts: Pt[] = []
  for (const step of steps) for (const shape of step.shapes) pts.push(...sampleShape(shape, size))
  return pts
}

export type TraceScore = {
  coverage: number // 0..1 — how much of the guide was traced
  neatness: number // 0..1 — how much of the drawing stayed on the guide
  score: number // 0..100
  stars: 0 | 1 | 2 | 3
}

function anyWithin(p: Pt, arr: Pt[], tolSq: number): boolean {
  for (const q of arr) {
    const dx = q.x - p.x
    const dy = q.y - p.y
    if (dx * dx + dy * dy <= tolSq) return true
  }
  return false
}

/**
 * Score a traced drawing against the guide.
 * - coverage: fraction of guide points that have a stroke point nearby (did they cover the shape?)
 * - neatness: fraction of stroke points that are near the guide (did they stay on the lines?)
 */
export function scoreTrace(guide: Pt[], strokes: Pt[][], tol: number): TraceScore {
  const tolSq = tol * tol
  if (guide.length === 0) return { coverage: 0, neatness: 0, score: 0, stars: 0 }
  const all = strokes.flat()

  let covered = 0
  for (const g of guide) if (anyWithin(g, all, tolSq)) covered++
  const coverage = covered / guide.length

  let neat = 0
  for (const p of all) if (anyWithin(p, guide, tolSq)) neat++
  const neatness = all.length ? neat / all.length : 0

  const score = Math.round(100 * (0.7 * coverage + 0.3 * neatness))
  const stars: 0 | 1 | 2 | 3 = score >= 70 ? 3 : score >= 50 ? 2 : score >= 30 ? 1 : 0
  return { coverage, neatness, score, stars }
}
