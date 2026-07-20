import { useEffect, useState } from 'react'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import ResultScreen from '../../components/ResultScreen'
import { fractionOfSet, sectorPath } from './fractions'

const BEST_KEY = 'maths:pizza'

type Order =
  | { kind: 'slice'; num: number; den: number }
  | { kind: 'set'; num: number; den: number; total: number; emoji: string; name: string }

const ORDERS: Order[] = [
  { kind: 'slice', num: 1, den: 2 },
  { kind: 'set', num: 1, den: 2, total: 4, emoji: '🍪', name: 'cookies' },
  { kind: 'slice', num: 1, den: 4 },
  { kind: 'set', num: 1, den: 4, total: 8, emoji: '🧁', name: 'cupcakes' },
  { kind: 'slice', num: 3, den: 4 },
  { kind: 'set', num: 3, den: 4, total: 12, emoji: '🍬', name: 'sweets' },
  { kind: 'slice', num: 1, den: 3 },
  { kind: 'set', num: 1, den: 3, total: 6, emoji: '🍓', name: 'strawberries' },
  { kind: 'slice', num: 2, den: 3 },
  { kind: 'set', num: 2, den: 3, total: 9, emoji: '🍇', name: 'grapes' },
  { kind: 'slice', num: 1, den: 5 },
  { kind: 'set', num: 2, den: 5, total: 10, emoji: '🍒', name: 'cherries' },
  { kind: 'slice', num: 3, den: 8 },
  { kind: 'set', num: 3, den: 8, total: 16, emoji: '🥕', name: 'carrots' },
  { kind: 'slice', num: 1, den: 10 },
  { kind: 'set', num: 7, den: 10, total: 20, emoji: '🍕', name: 'pizza slices' },
]

type Props = { onExit: () => void; onHome: () => void }

export default function PizzaParty({ onExit, onHome }: Props) {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [lives, setLives] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)

  const order = ORDERS[idx]
  useEffect(() => { setSelected(new Set()); setFeedback(null) }, [idx])

  function toggle(i: number) {
    if (feedback !== null) return
    sound.tick()
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function serve() {
    if (feedback !== null) return
    const want = order.kind === 'slice' ? order.num : fractionOfSet(order, order.total)
    const ok = selected.size === want
    setFeedback(ok)
    if (ok) { sound.correct(); setCorrect((c) => c + 1) } else { sound.wrong(); setLives((l) => l - 1) }
    window.setTimeout(() => {
      setFeedback(null)
      const nextLives = ok ? lives : lives - 1
      if (nextLives <= 0 || idx + 1 >= ORDERS.length) setFinished(true)
      else setIdx(idx + 1)
    }, 1600)
  }

  if (finished) {
    const stars = correct >= 12 ? 3 : correct >= 8 ? 2 : correct >= 4 ? 1 : 0
    const best = loadBest(BEST_KEY)
    const isNew = correct > best
    if (isNew) saveBest(BEST_KEY, correct)
    return (
      <ResultScreen
        title="Pizzeria closed! 🍕"
        lines={[`${correct} of ${ORDERS.length} orders served`, `Lives left: ${Math.max(0, lives)}`]}
        starCount={stars}
        reward={{ gameId: 'maths', stars, isNewBest: isNew }}
        best={isNew ? `New best! Prev ${best}/${ORDERS.length}` : best > 0 ? `Best ${best}/${ORDERS.length}` : undefined}
        onPlayAgain={() => { setIdx(0); setLives(3); setCorrect(0); setFinished(false) }}
        onHome={onHome}
      />
    )
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => { sound.click(); onExit() }} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-rose-600 shadow">← Maths Lab</button>
        <h1 className="text-2xl font-extrabold text-rose-600">🍕 Pizza Party</h1>
        <span className="text-sm font-bold text-slate-500">{'♥'.repeat(lives)}{'♡'.repeat(Math.max(0, 3 - lives))}</span>
      </div>
      <div className="mb-1 text-center text-sm font-semibold text-slate-500">Order {idx + 1} / {ORDERS.length} &nbsp; ⭐ {correct}</div>

      <div className="mb-4 rounded-2xl bg-rose-100 px-4 py-3 text-center text-lg font-bold text-rose-800">
        {order.kind === 'slice'
          ? <>Put pepperoni on <b>{order.num}/{order.den}</b> of the pizza!</>
          : <>Give the customer <b>{order.num}/{order.den}</b> of the {order.total} {order.name}!</>}
      </div>

      {order.kind === 'slice' ? (
        <svg viewBox="0 0 200 200" className="mx-auto block w-64">
          <circle cx="100" cy="100" r="92" fill="#f59e0b" />
          {Array.from({ length: order.den }).map((_, i) => (
            <path
              key={i}
              d={sectorPath(100, 100, 90, i, order.den)}
              onClick={() => toggle(i)}
              className="cursor-pointer"
              fill={selected.has(i) ? '#fbbf24' : '#fde68a'}
              stroke="#b45309"
              strokeWidth={2}
            />
          ))}
          {/* pepperoni dots on selected slices */}
          {Array.from({ length: order.den }).map((_, i) => {
            if (!selected.has(i)) return null
            const a = ((i + 0.5) / order.den) * 2 * Math.PI - Math.PI / 2
            return <circle key={`p${i}`} cx={100 + 55 * Math.cos(a)} cy={100 + 55 * Math.sin(a)} r={9} fill="#dc2626" pointerEvents="none" />
          })}
        </svg>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow">
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: order.total }).map((_, i) => (
              <button key={i} onClick={() => toggle(i)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ${selected.has(i) ? 'scale-110 bg-green-100 ring-2 ring-green-400' : 'bg-slate-50 hover:bg-slate-100'}`}>
                {order.emoji}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">Tap to put {selected.size} on the plate</p>
        </div>
      )}

      <div className="mt-4 text-center">
        {feedback === null ? (
          <button onClick={serve} className="rounded-full bg-rose-500 px-10 py-3 text-lg font-extrabold text-white shadow-lg hover:bg-rose-600">🍽️ Serve!</button>
        ) : (
          <div className={`inline-block rounded-xl px-5 py-2 font-bold ${feedback ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
            {feedback ? '🎉 Perfect order!' : `Not quite — you needed ${order.kind === 'slice' ? order.num : fractionOfSet(order, order.total)}.`}
          </div>
        )}
      </div>
    </div>
  )
}
