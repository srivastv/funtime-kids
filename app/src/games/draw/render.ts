import type { DrawShape } from '../../content/types'

/** Stroke one guide shape onto a canvas context. Coordinates are 0..1 * size. */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  s: DrawShape,
  size: number,
) {
  ctx.beginPath()
  switch (s.kind) {
    case 'circle':
      ctx.arc(s.cx * size, s.cy * size, s.r * size, 0, Math.PI * 2)
      break
    case 'ellipse':
      ctx.ellipse(s.cx * size, s.cy * size, s.rx * size, s.ry * size, 0, 0, Math.PI * 2)
      break
    case 'line':
      ctx.moveTo(s.x1 * size, s.y1 * size)
      ctx.lineTo(s.x2 * size, s.y2 * size)
      break
    case 'rect':
      ctx.rect(s.x * size, s.y * size, s.w * size, s.h * size)
      break
    case 'poly': {
      const p = s.points
      if (p.length === 0) break
      ctx.moveTo(p[0][0] * size, p[0][1] * size)
      for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0] * size, p[i][1] * size)
      if (s.close !== false) ctx.closePath()
      break
    }
    case 'curve':
      ctx.moveTo(s.x1 * size, s.y1 * size)
      ctx.quadraticCurveTo(s.cx * size, s.cy * size, s.x2 * size, s.y2 * size)
      break
  }
  ctx.stroke()
}
