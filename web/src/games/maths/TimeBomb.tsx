import { useEffect, useRef, useState } from 'react'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import ResultScreen from '../../components/ResultScreen'
import { addMinutes, angleToHour, angleToMinute, hourAngle, minuteAngle, timeEquals, timeLabel, ROMAN, type Time } from './clock'

const BEST_KEY = 'maths:time'

type Round =
  | { kind: 'set'; h: number; m: number; roman?: boolean }
  | { kind: 'dur'; start: Time; delta: number; roman?: boolean }

const ROUNDS: Round[] = [
  { kind: 'set', h: 3, m: 0 },
  { kind: 'set', h: 6, m: 30 },
  { kind: 'set', h: 9, m: 15 },
  { kind: 'set', h: 12, m: 0 },
  { kind: 'set', h: 1, m: 45, roman: true },
  { kind: 'set', h: 4, m: 25, roman: true },
  { kind: 'set', h: 7, m: 5, roman: true },
  { kind: 'set', h: 11, m: 55 },
  { kind: 'dur', start: { h: 2, m: 0 }, delta: 30 },
  { kind: 'dur', start: { h: 7, m: 50 }, delta: 20 },
  { kind: 'dur', start: { h: 9, m: 15 }, delta: 45 },
  { kind: 'dur', start: { h: 11, m: 40 }, delta: 35 },
]

function targetTime(r: Round): Time {
  return r.kind === 'set' ? { h: r.h, m: r.m } : addMinutes(r.start, r.delta)
}

const pt = (angleDeg: number, len: number): [number, number] => {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return [100 + len * Math.cos(rad), 100 + len * Math.sin(rad)]
}

type Props = { onExit: () => void; onHome: () => void }

export default function TimeBomb({ onExit, onHome }: Props) {
  const [idx, setIdx] = useState(0)
  const [time, setTime] = useState<Time>({ h: 12, m: 0 })
  const [dragging, setDragging] = useState<'h' | 'm' | null>(null)
  const [lives, setLives] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const round = ROUNDS[idx]
  const roman = 'roman' in round && round.roman
  const goal = targetTime(round)

  useEffect(() => { setTime({ h: 12, m: 0 }); setFeedback(null); setDragging(null) }, [idx])

  function angleFromEvent(e: React.PointerEvent) {
    const rect = svgRef.current!.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI
  }

  function startDrag(hand: 'h' | 'm', e: React.PointerEvent) {
    if (feedback !== null) return
    ;(e.target as Element).setPointerCapture(e.pointerId)
    setDragging(hand)
  }
  function onMove(e: React.PointerEvent) {
    if (!dragging) return
    const a = angleFromEvent(e)
    if (dragging === 'm') setTime((t) => ({ ...t, m: angleToMinute(a) }))
    else setTime((t) => ({ ...t, h: angleToHour(a) }))
    sound.tick()
  }
  function endDrag() { setDragging(null) }

  function defuse() {
    if (feedback !== null) return
    const ok = timeEquals(time, goal)
    setFeedback(ok)
    if (ok) { sound.zap(); setCorrect((c) => c + 1) } else { sound.wrong(); setLives((l) => l - 1) }
    window.setTimeout(() => {
      setFeedback(null)
      const nextLives = ok ? lives : lives - 1
      if (nextLives <= 0 || idx + 1 >= ROUNDS.length) setFinished(true)
      else setIdx(idx + 1)
    }, 1700)
  }

  if (finished) {
    const stars = correct >= 10 ? 3 : correct >= 7 ? 2 : correct >= 4 ? 1 : 0
    const best = loadBest(BEST_KEY)
    const isNew = correct > best
    if (isNew) saveBest(BEST_KEY, correct)
    return (
      <ResultScreen
        title="Bombs defused! ⏰"
        lines={[`${correct} of ${ROUNDS.length} clocks set correctly`, `Lives left: ${Math.max(0, lives)}`]}
        starCount={stars}
        reward={{ gameId: 'maths', stars, isNewBest: isNew }}
        best={isNew ? `New best! Prev ${best}/${ROUNDS.length}` : best > 0 ? `Best ${best}/${ROUNDS.length}` : undefined}
        onPlayAgain={() => { setIdx(0); setLives(3); setCorrect(0); setFinished(false) }}
        onHome={onHome}
      />
    )
  }

  const [mx, my] = pt(minuteAngle(time.m), 72)
  const [hx, hy] = pt(hourAngle(time.h, time.m), 50)

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => { sound.click(); onExit() }} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-600 shadow">← Maths Lab</button>
        <h1 className="text-2xl font-extrabold text-sky-700">⏰ Time Bomb</h1>
        <span className="text-sm font-bold text-slate-500">{'♥'.repeat(lives)}{'♡'.repeat(Math.max(0, 3 - lives))}</span>
      </div>
      <div className="mb-1 text-center text-sm font-semibold text-slate-500">Clock {idx + 1} / {ROUNDS.length} &nbsp; ⭐ {correct}</div>

      <div className="mb-4 rounded-2xl bg-sky-100 px-4 py-3 text-center text-lg font-bold text-sky-800">
        💣 {round.kind === 'set'
          ? <>Set the clock to <b>{timeLabel(goal)}</b> to defuse!</>
          : <>It's <b>{timeLabel(round.start)}</b>. Set the clock <b>{round.delta} minutes later</b>!</>}
      </div>

      <svg ref={svgRef} viewBox="0 0 200 200" className="mx-auto block w-72 touch-none" style={{ touchAction: 'none' }}>
        <circle cx="100" cy="100" r="96" fill="#fff" stroke="#334155" strokeWidth="4" />
        {Array.from({ length: 12 }).map((_, i) => {
          const n = i + 1
          const [x, y] = pt(n * 30, 78)
          return <text key={n} x={x} y={y + 5} textAnchor="middle" className="fill-slate-700" fontSize="14" fontWeight="bold">{roman ? ROMAN[n] : n}</text>
        })}
        {/* hour hand */}
        <line x1="100" y1="100" x2={hx} y2={hy} stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
        {/* minute hand */}
        <line x1="100" y1="100" x2={mx} y2={my} stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="100" r="6" fill="#334155" />
        {/* draggable knobs */}
        <circle cx={hx} cy={hy} r="14" fill="#1e293b" opacity="0.001" style={{ cursor: 'grab' }}
          onPointerDown={(e) => startDrag('h', e)} onPointerMove={onMove} onPointerUp={endDrag} />
        <circle cx={mx} cy={my} r="14" fill="#0ea5e9" opacity="0.001" style={{ cursor: 'grab' }}
          onPointerDown={(e) => startDrag('m', e)} onPointerMove={onMove} onPointerUp={endDrag} />
        {/* visible grab dots */}
        <circle cx={hx} cy={hy} r="7" fill="#1e293b" pointerEvents="none" />
        <circle cx={mx} cy={my} r="7" fill="#0ea5e9" pointerEvents="none" />
      </svg>

      <p className="mt-1 text-center text-xs text-slate-400">Drag the <b className="text-slate-700">short</b> hand for hours and the <b className="text-sky-600">long</b> hand for minutes.</p>
      <div className="mt-1 text-center text-lg font-black text-slate-700">{timeLabel(time)}</div>

      <div className="mt-3 text-center">
        {feedback === null ? (
          <button onClick={defuse} className="rounded-full bg-sky-600 px-10 py-3 text-lg font-extrabold text-white shadow-lg hover:bg-sky-700">✂️ Defuse!</button>
        ) : (
          <div className={`inline-block rounded-xl px-5 py-2 font-bold ${feedback ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
            {feedback ? '🎉 Defused!' : `Boom! It should read ${timeLabel(goal)}.`}
          </div>
        )}
      </div>
    </div>
  )
}
