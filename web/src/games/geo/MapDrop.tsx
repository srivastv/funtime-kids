import { useMemo, useRef, useState } from 'react'
import { geoEqualEarth, geoPath, type GeoProjection } from 'd3-geo'
import { feature } from 'topojson-client'
import worldTopo from 'world-atlas/countries-110m.json'
import type { GeoMapItem } from '../../content/types'
import { sound } from '../../lib/sound'

// Real country outlines (Natural Earth 110m), decoded once at module load.
const WORLD = feature(
  worldTopo as never,
  (worldTopo as { objects: { countries: never } }).objects.countries,
) as unknown as { features: unknown[] }
const COUNTRIES = WORLD.features

// SVG drawing surface. Equal Earth is projected into this box per question.
const W = 800
const H = 500
// Inset the fit box so the candidates occupy the centre ~64% of the frame,
// leaving margin so neighbouring countries provide context.
const INSET = 0.18

type Dot = { xPct: number; yPct: number; name: string; flagEmoji?: string }

/** Build an Equal-Earth projection framed to the candidate countries (with margin). */
function buildView(items: GeoMapItem[]): { paths: string[]; dots: Dot[] } {
  // Fit to the candidate points (a MultiPoint has unambiguous bounds — a hand-built
  // lat/lon Polygon does not, and d3 would treat it as the whole globe).
  const points = {
    type: 'MultiPoint' as const,
    coordinates: items.map((it) => [it.lon, it.lat]),
  }

  const projection: GeoProjection = geoEqualEarth().fitExtent(
    [[W * INSET, H * INSET], [W * (1 - INSET), H * (1 - INSET)]],
    points,
  )
  const path = geoPath(projection)

  const paths: string[] = []
  for (const f of COUNTRIES) {
    const d = path(f as never)
    if (d) paths.push(d)
  }

  // Raw projected pixel positions (geographically exact).
  const pts = items.map((it) => {
    const p = projection([it.lon, it.lat])
    return { x: p?.[0] ?? W / 2, y: p?.[1] ?? H / 2 }
  })

  // Declutter: nearby countries (e.g. UK constituents) would project onto each
  // other. Push overlapping dots apart along their connecting line so they stay
  // as close to true position as possible while remaining tappable/droppable.
  // Separation is in the 800×500 virtual space; keep it generous so dots stay
  // apart once the map scales down to a phone-width container.
  const MIN_SEP = 90
  const M = 44 // keep dots off the frame edge
  for (let iter = 0; iter < 30; iter++) {
    let moved = false
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x
        let dy = pts[j].y - pts[i].y
        let dist = Math.hypot(dx, dy)
        if (dist < MIN_SEP) {
          if (dist < 0.01) { dx = 1; dy = 0; dist = 1 } // coincident: pick an axis
          const push = (MIN_SEP - dist) / 2
          const ux = (dx / dist) * push
          const uy = (dy / dist) * push
          pts[i].x -= ux; pts[i].y -= uy
          pts[j].x += ux; pts[j].y += uy
          moved = true
        }
      }
    }
    for (const p of pts) {
      p.x = Math.max(M, Math.min(W - M, p.x))
      p.y = Math.max(M, Math.min(H - M, p.y))
    }
    if (!moved) break
  }

  const dots: Dot[] = items.map((it, i) => ({
    xPct: (pts[i].x / W) * 100,
    yPct: (pts[i].y / H) * 100,
    name: it.name,
    flagEmoji: it.flagEmoji,
  }))

  return { paths, dots }
}

type Props = {
  items: GeoMapItem[]
  /** Emoji shown on the draggable token — a flag (Map Drop) or a pin (Landmark Hunt). */
  tokenEmoji?: string
  feedback?: { chosen: number; correct: number } | null
  onAnswer: (index: number) => void
}

const HOME = { xPct: 50, yPct: 88 }

export default function MapDrop({ items, tokenEmoji, feedback, onAnswer }: Props) {
  const { paths, dots } = useMemo(() => buildView(items), [items])
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [pos, setPos] = useState(HOME)
  const locked = !!feedback

  function pointToPct(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      xPct: ((clientX - rect.left) / rect.width) * 100,
      yPct: ((clientY - rect.top) / rect.height) * 100,
      rect,
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (locked) return
    ;(e.target as Element).setPointerCapture(e.pointerId)
    setDragging(true)
    const { xPct, yPct } = pointToPct(e.clientX, e.clientY)
    setPos({ xPct, yPct })
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return
    const { xPct, yPct } = pointToPct(e.clientX, e.clientY)
    setPos({ xPct, yPct })
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return
    setDragging(false)
    const rect = containerRef.current!.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    let best = -1
    let bestDist = Infinity
    dots.forEach((d, i) => {
      const dx = px - (d.xPct / 100) * rect.width
      const dy = py - (d.yPct / 100) * rect.height
      const dist = Math.hypot(dx, dy)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    const threshold = rect.width * 0.1 // forgiving for small fingers
    if (best >= 0 && bestDist <= threshold) {
      sound.click()
      onAnswer(best)
    } else {
      sound.boing()
      setPos(HOME)
    }
  }

  return (
    <div className="mb-6 space-y-3">
      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border-[3px] border-sky-300 bg-gradient-to-b from-sky-200 to-cyan-100 shadow-inner"
        style={{ aspectRatio: `${W} / ${H}`, touchAction: 'none' }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
          <rect x={0} y={0} width={W} height={H} fill="#bde7fb" />
          <g>
            {paths.map((d, i) => (
              <path key={i} d={d} fill="#bfe3a8" stroke="#ffffff" strokeWidth={0.7} strokeLinejoin="round" />
            ))}
          </g>
        </svg>

        {/* candidate location dots */}
        {dots.map((dot, i) => {
          const isCorrect = feedback?.correct === i
          const isChosen = feedback?.chosen === i
          let cls = 'bg-sky-500 hover:bg-sky-600 hover:scale-110 animate-pulse'
          if (locked) {
            if (isCorrect) cls = 'bg-green-500 scale-125'
            else if (isChosen) cls = 'bg-red-500'
            else cls = 'bg-slate-400 scale-90 opacity-60'
          }
          return (
            <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${dot.xPct}%`, top: `${dot.yPct}%` }}>
              <button
                type="button"
                disabled={locked}
                onClick={() => { if (!locked) { sound.click(); onAnswer(i) } }}
                className={`h-9 w-9 md:h-11 md:w-11 rounded-full border-[3px] border-white shadow-xl transition-all flex items-center justify-center text-white font-black ${cls}`}
                aria-label={locked ? dot.name : `Location ${i + 1}`}
                title={locked ? dot.name : `Location ${i + 1}`}
              >
                {locked ? (dot.flagEmoji || dot.name.charAt(0)) : i + 1}
              </button>
              {locked && (isCorrect || isChosen) && (
                <div className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold shadow ${isCorrect ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
                  {dot.name}
                </div>
              )}
            </div>
          )
        })}

        {/* draggable flag token */}
        {!locked && (
          <button
            type="button"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl border-2 border-white bg-white/90 text-3xl md:text-4xl shadow-xl transition-transform ${dragging ? 'scale-110 cursor-grabbing ring-4 ring-amber-300' : 'cursor-grab animate-bounce'}`}
            style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%`, touchAction: 'none' }}
            aria-label="Drag this flag to the correct country"
          >
            {tokenEmoji || '📍'}
          </button>
        )}

        {!locked && (
          <div className="pointer-events-none absolute top-3 right-3 rounded-full border-2 border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 shadow">
            Drag the flag! 🚩
          </div>
        )}
      </div>
    </div>
  )
}
