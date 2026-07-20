import { useEffect, useState } from 'react'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import ResultScreen from '../../components/ResultScreen'
import { fractionToPercent, within } from './potion'

const BEST_KEY = 'maths:potion'
const TOL = 4 // percent wiggle room

type Round =
  | { kind: 'frac'; num: number; den: number }
  | { kind: 'pct'; pct: number }

const ROUNDS: Round[] = [
  { kind: 'frac', num: 1, den: 2 },
  { kind: 'pct', pct: 25 },
  { kind: 'frac', num: 3, den: 4 },
  { kind: 'pct', pct: 10 },
  { kind: 'frac', num: 1, den: 5 },
  { kind: 'frac', num: 7, den: 10 },
  { kind: 'pct', pct: 50 },
  { kind: 'frac', num: 1, den: 4 },
  { kind: 'pct', pct: 75 },
  { kind: 'frac', num: 2, den: 5 },
  { kind: 'pct', pct: 20 },
  { kind: 'frac', num: 3, den: 5 },
]

function target(r: Round): number {
  return r.kind === 'frac' ? fractionToPercent(r.num, r.den) : r.pct
}
function label(r: Round): string {
  return r.kind === 'frac' ? `${r.num}/${r.den}` : `${r.pct}%`
}

type Props = { onExit: () => void; onHome: () => void }

export default function PotionMixer({ onExit, onHome }: Props) {
  const [idx, setIdx] = useState(0)
  const [value, setValue] = useState(0)
  const [lives, setLives] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)

  const round = ROUNDS[idx]
  const goal = target(round)
  useEffect(() => { setValue(0); setFeedback(null) }, [idx])

  function brew() {
    if (feedback !== null) return
    const ok = within(value, goal, TOL)
    setFeedback(ok)
    if (ok) { sound.correct(); setCorrect((c) => c + 1) } else { sound.wrong(); setLives((l) => l - 1) }
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
        title="Potions brewed! 🧪"
        lines={[`${correct} of ${ROUNDS.length} potions correct`, `Lives left: ${Math.max(0, lives)}`]}
        starCount={stars}
        reward={{ gameId: 'maths', stars, isNewBest: isNew }}
        best={isNew ? `New best! Prev ${best}/${ROUNDS.length}` : best > 0 ? `Best ${best}/${ROUNDS.length}` : undefined}
        onPlayAgain={() => { setIdx(0); setLives(3); setCorrect(0); setFinished(false) }}
        onHome={onHome}
      />
    )
  }

  const equiv = round.kind === 'frac' ? `${round.num}/${round.den} = ${goal}%` : `${goal}% = ${goal}/100`

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => { sound.click(); onExit() }} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-fuchsia-600 shadow">← Maths Lab</button>
        <h1 className="text-2xl font-extrabold text-fuchsia-600">🧪 Potion Mixer</h1>
        <span className="text-sm font-bold text-slate-500">{'♥'.repeat(lives)}{'♡'.repeat(Math.max(0, 3 - lives))}</span>
      </div>
      <div className="mb-1 text-center text-sm font-semibold text-slate-500">Potion {idx + 1} / {ROUNDS.length} &nbsp; ⭐ {correct}</div>

      <div className="mb-4 rounded-2xl bg-fuchsia-100 px-4 py-3 text-center text-lg font-bold text-fuchsia-800">
        Fill the bottle to <b>{label(round)}</b>
      </div>

      {/* Bottle */}
      <div className="relative mx-auto h-64 w-40 overflow-hidden rounded-b-3xl rounded-t-xl border-4 border-slate-300 bg-slate-50">
        <div
          className={`absolute inset-x-0 bottom-0 transition-all ${feedback === false ? 'bg-amber-400' : 'bg-fuchsia-400'}`}
          style={{ height: `${value}%` }}
        />
        {/* target line */}
        <div className="absolute inset-x-0 border-t-2 border-dashed border-green-600" style={{ bottom: `${goal}%` }}>
          <span className="absolute -top-5 right-1 rounded bg-green-600 px-1 text-[10px] font-bold text-white">{label(round)}</span>
        </div>
        <div className="absolute left-1/2 top-2 -translate-x-1/2 text-2xl">🧪</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-sm font-black text-white drop-shadow">{value}%</div>
      </div>

      <input type="range" min={0} max={100} value={value} onChange={(e) => { setValue(Number(e.target.value)); sound.tick() }} disabled={feedback !== null} className="mt-4 w-full accent-fuchsia-500" />

      <div className="mt-4 text-center">
        {feedback === null ? (
          <button onClick={brew} className="rounded-full bg-fuchsia-500 px-10 py-3 text-lg font-extrabold text-white shadow-lg hover:bg-fuchsia-600">✨ Brew!</button>
        ) : (
          <div className={`inline-block rounded-xl px-5 py-2 font-bold ${feedback ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
            {feedback ? `🎉 Perfect! ${equiv}` : `Fizz! Aim for ${label(round)} (${goal}%).`}
          </div>
        )}
      </div>
    </div>
  )
}
