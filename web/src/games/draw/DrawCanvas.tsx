import { useEffect, useRef, useState } from 'react'
import type { DrawingLesson } from '../../content/types'
import { shapesUpTo } from './guide'
import { drawShape } from './render'
import { scoreTrace, type Pt, type TraceScore } from './trace'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import { recordResult } from '../../lib/rewards'

const SIZE = 400
const TRACE_TOL = 24 // pixels of wiggle room when matching a stroke to the guide
const COLORS = ['#1e293b', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#92400e', '#ec4899']
const BRUSHES = [4, 8, 14]

type Point = { x: number; y: number }
type Stroke = { color: string; size: number; points: Point[] }

type Props = {
  lesson: DrawingLesson
  stepIndex: number
  /** When set, the canvas is a Trace Challenge: shows a "Score" button and rates the trace. */
  trace?: { target: Pt[]; bestKey: string }
}

export default function DrawCanvas({ lesson, stepIndex, trace }: Props) {
  const guideRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<HTMLCanvasElement>(null)

  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(BRUSHES[1])
  const colorRef = useRef(color)
  const sizeRef = useRef(size)
  colorRef.current = color
  sizeRef.current = size

  const strokesRef = useRef<Stroke[]>([])
  const drawingRef = useRef(false)
  const [, force] = useState(0) // used to refresh undo/clear button state
  const [result, setResult] = useState<TraceScore | null>(null)

  // Redraw the guide layer whenever the lesson or step changes.
  useEffect(() => {
    const ctx = guideRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, SIZE, SIZE)
    const { done, current } = shapesUpTo(lesson.steps, stepIndex)

    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)'
    ctx.setLineDash([])
    for (const s of done) drawShape(ctx, s, SIZE)

    ctx.lineWidth = 3
    ctx.strokeStyle = '#38bdf8'
    ctx.setLineDash([6, 6])
    for (const s of current) drawShape(ctx, s, SIZE)
    ctx.setLineDash([])
  }, [lesson, stepIndex])

  function toCanvas(e: React.PointerEvent): Point {
    const canvas = drawRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (SIZE / rect.width),
      y: (e.clientY - rect.top) * (SIZE / rect.height),
    }
  }

  function pointerDown(e: React.PointerEvent) {
    drawRef.current?.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const p = toCanvas(e)
    strokesRef.current.push({ color: colorRef.current, size: sizeRef.current, points: [p] })
    force((n) => n + 1)
  }

  function pointerMove(e: React.PointerEvent) {
    if (!drawingRef.current) return
    const ctx = drawRef.current?.getContext('2d')
    if (!ctx) return
    const stroke = strokesRef.current[strokesRef.current.length - 1]
    const prev = stroke.points[stroke.points.length - 1]
    const p = toCanvas(e)
    stroke.points.push(p)
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  function pointerUp() {
    drawingRef.current = false
  }

  function redraw() {
    const ctx = drawRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, SIZE, SIZE)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const st of strokesRef.current) {
      if (st.points.length === 0) continue
      ctx.strokeStyle = st.color
      ctx.lineWidth = st.size
      ctx.beginPath()
      ctx.moveTo(st.points[0].x, st.points[0].y)
      for (let i = 1; i < st.points.length; i++) ctx.lineTo(st.points[i].x, st.points[i].y)
      ctx.stroke()
    }
  }

  function undo() {
    strokesRef.current.pop()
    redraw()
    sound.click()
    force((n) => n + 1)
  }

  function clear() {
    strokesRef.current = []
    redraw()
    setResult(null)
    sound.click()
    force((n) => n + 1)
  }

  function scoreNow() {
    if (!trace) return
    const strokes = strokesRef.current.map((s) => s.points)
    const r = scoreTrace(trace.target, strokes, TRACE_TOL)
    setResult(r)
    if (r.stars >= 2) sound.correct()
    else if (r.stars === 1) sound.click()
    else sound.wrong()
    const isNewBest = r.score > loadBest(trace.bestKey)
    if (isNewBest) saveBest(trace.bestKey, r.score)
    recordResult({ gameId: 'draw', stars: r.stars, isNewBest })
  }

  function save() {
    sound.click()
    // Composite white background + guide + the child's drawing into one image.
    const out = document.createElement('canvas')
    out.width = SIZE
    out.height = SIZE
    const ctx = out.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, SIZE, SIZE)
    if (guideRef.current) ctx.drawImage(guideRef.current, 0, 0)
    if (drawRef.current) ctx.drawImage(drawRef.current, 0, 0)
    const link = document.createElement('a')
    link.download = `funtime-${lesson.id}.png`
    link.href = out.toDataURL('image/png')
    link.click()
  }

  const hasStrokes = strokesRef.current.length > 0

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative aspect-square w-full max-w-[400px] touch-none rounded-3xl border-2 border-sky-200 bg-white shadow-lg"
      >
        <canvas
          ref={guideRef}
          width={SIZE}
          height={SIZE}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <canvas
          ref={drawRef}
          width={SIZE}
          height={SIZE}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerLeave={pointerUp}
        />
      </div>

      {/* Trace Challenge: score button + result */}
      {trace && (
        <div className="mt-4 w-full max-w-[400px]">
          {!result ? (
            <button
              type="button"
              onClick={scoreNow}
              disabled={!hasStrokes}
              className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 py-3 text-lg font-extrabold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-30"
            >
              ✨ Score my drawing!
            </button>
          ) : (
            <div className="rounded-3xl border-2 border-pink-200 bg-pink-50 p-4 text-center">
              <div className="text-3xl">{'⭐'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}</div>
              <div className="mt-1 text-2xl font-black text-pink-700">{result.score}%</div>
              <div className="mt-1 text-sm font-semibold text-pink-900">
                {result.stars === 3 ? 'Amazing tracing! 🎉' : result.stars === 2 ? 'Great job! 👏' : result.stars === 1 ? 'Good start — try to stay on the lines!' : 'Keep tracing over the dotted shape!'}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Best: {Math.max(result.score, loadBest(trace.bestKey))}%
              </div>
              <button
                type="button"
                onClick={clear}
                className="mt-3 rounded-full bg-white px-6 py-2 text-sm font-bold text-pink-700 shadow"
              >
                ↺ Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Colors */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            className={`h-8 w-8 rounded-full border-2 transition ${
              color === c ? 'scale-110 border-slate-800' : 'border-white'
            }`}
            style={{ background: c }}
          />
        ))}
      </div>

      {/* Brush sizes + actions */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {BRUSHES.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setSize(b)}
            aria-label={`Brush size ${b}`}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
              size === b ? 'border-sky-500 bg-sky-100' : 'border-slate-200 bg-white'
            }`}
          >
            <span className="rounded-full bg-slate-700" style={{ width: b, height: b }} />
          </button>
        ))}

        <button
          type="button"
          onClick={undo}
          disabled={!hasStrokes}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow disabled:opacity-40"
        >
          ↩︎ Undo
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={!hasStrokes}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow disabled:opacity-40"
        >
          🗑️ Clear
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
        >
          💾 Save
        </button>
      </div>
    </div>
  )
}
