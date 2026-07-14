import { useEffect, useState } from 'react'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import ResultScreen from '../../components/ResultScreen'
import { circuitLights, type CompKind, type Placed } from './circuit'

const BEST_KEY = 'odd:circuit'

// Tray templates. Placing one drops a copy into a slot.
const PARTS: Record<string, Omit<Placed, 'on'> & { kind: CompKind }> = {
  wire: { kind: 'wire', label: 'Wire', emoji: '〰️' },
  switch: { kind: 'switch', label: 'Switch', emoji: '🔘' },
  copper: { kind: 'conductor', label: 'Metal coin', emoji: '🪙' },
  plastic: { kind: 'insulator', label: 'Plastic', emoji: '🧴' },
  wood: { kind: 'insulator', label: 'Wood', emoji: '🪵' },
  rubber: { kind: 'insulator', label: 'Rubber band', emoji: '🎀' },
}

type Puzzle = { prompt: string; slots: number; tray: string[]; explain: string }

const PUZZLES: Puzzle[] = [
  { prompt: 'The wire is missing! Fill the gap to light the bulb.', slots: 1, tray: ['wire', 'plastic'], explain: 'Electricity needs an unbroken loop. A wire carries it all the way round.' },
  { prompt: 'Add a switch — then tap it to turn it ON.', slots: 1, tray: ['switch', 'wood'], explain: 'A switch is a gap you can open or close. Closed (ON) lets electricity flow.' },
  { prompt: 'Which material lets electricity flow? Fill the gap and test.', slots: 1, tray: ['copper', 'plastic', 'wood'], explain: 'Metals are conductors. Plastic and wood are insulators — they block electricity.' },
  { prompt: 'Fill BOTH gaps with things that conduct.', slots: 2, tray: ['wire', 'copper', 'rubber', 'switch'], explain: 'Every part of the loop must conduct. One insulator anywhere stops the bulb.' },
  { prompt: 'Tricky! Only conductors will light the bulb.', slots: 2, tray: ['copper', 'plastic', 'wire', 'wood'], explain: 'A complete loop of conductors lights the bulb. Insulators break the circuit.' },
]

type Props = { onExit: () => void; onHome: () => void }

export default function CircuitBuilder({ onExit, onHome }: Props) {
  const [idx, setIdx] = useState(0)
  const [bridge, setBridge] = useState<(Placed | null)[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [lives, setLives] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<{ lit: boolean; explain: string } | null>(null)
  const [finished, setFinished] = useState(false)

  const puzzle = PUZZLES[idx]

  useEffect(() => {
    setBridge(Array(puzzle.slots).fill(null))
    setSelected(null)
  }, [idx, puzzle.slots])

  function placeInSlot(s: number) {
    if (feedback) return
    if (selected) {
      const part = PARTS[selected]
      const placed: Placed = part.kind === 'switch' ? { ...part, on: false } : { ...part }
      setBridge((b) => b.map((x, i) => (i === s ? placed : x)))
      setSelected(null)
      sound.magnetSnap()
      return
    }
    const existing = bridge[s]
    if (existing) {
      if (existing.kind === 'switch') {
        setBridge((b) => b.map((x, i) => (i === s && x ? { ...x, on: !x.on } : x)))
        sound.click()
      } else {
        setBridge((b) => b.map((x, i) => (i === s ? null : x))) // pick it back up
        sound.boing()
      }
    }
  }

  function test() {
    if (feedback) return
    if (bridge.some((x) => x === null)) {
      sound.boing()
      return
    }
    const lit = circuitLights(bridge)
    if (lit) {
      sound.zap()
      setCorrect((c) => c + 1)
    } else {
      sound.wrong()
      setLives((l) => l - 1)
    }
    setFeedback({ lit, explain: puzzle.explain })
    setTimeout(() => {
      setFeedback(null)
      const nextLives = lit ? lives : lives - 1
      const nextIdx = idx + 1
      if (nextLives <= 0 || nextIdx >= PUZZLES.length) setFinished(true)
      else setIdx(nextIdx)
    }, 2400)
  }

  if (finished) {
    const total = PUZZLES.length
    const pct = correct / total
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.4 ? 1 : 0
    const best = loadBest(BEST_KEY)
    const isNew = correct > best
    if (isNew) saveBest(BEST_KEY, correct)
    return (
      <ResultScreen
        title="Circuit Master! ⚡"
        lines={[`${correct} of ${total} circuits lit`, `Lives left: ${Math.max(0, lives)}`]}
        starCount={stars}
        reward={{ gameId: 'odd', stars, isNewBest: isNew }}
        best={isNew ? `New best! Prev ${best}/${total}` : best > 0 ? `Best ${best}/${total}` : undefined}
        onPlayAgain={() => { setIdx(0); setLives(3); setCorrect(0); setFinished(false) }}
        onHome={onHome}
      />
    )
  }

  const lit = feedback?.lit
  const bulbGlow = lit ? 'drop-shadow(0 0 14px #fde047)' : 'none'

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => { sound.click(); onExit() }} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-600 shadow">← Lab</button>
        <h1 className="text-2xl font-extrabold text-amber-700">⚡ Circuit Builder</h1>
        <span className="text-sm font-bold text-slate-500">{'♥'.repeat(lives)}{'♡'.repeat(Math.max(0, 3 - lives))}</span>
      </div>

      <div className="mb-1 text-center text-sm font-semibold text-slate-500">Circuit {idx + 1} / {PUZZLES.length}</div>
      <div className="mb-4 rounded-2xl bg-amber-100 px-5 py-3 text-center text-lg font-bold text-amber-800">{puzzle.prompt}</div>

      {/* The loop: battery → slots → bulb → back */}
      <div className="rounded-3xl border-4 border-slate-700 bg-slate-900 p-5">
        <div className="flex items-center justify-center gap-2 text-3xl">
          <span title="battery">🔋</span>
          <span className="text-slate-500">—</span>
          {bridge.map((slot, s) => (
            <button
              key={s}
              type="button"
              onClick={() => placeInSlot(s)}
              className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 text-2xl transition ${
                slot ? 'border-amber-400 bg-slate-800' : 'border-dashed border-slate-500 bg-slate-800/40'
              }`}
              title={slot ? slot.label : 'empty slot'}
            >
              {slot ? (
                <>
                  <span>{slot.emoji}</span>
                  {slot.kind === 'switch' && (
                    <span className={`text-[10px] font-bold ${slot.on ? 'text-green-400' : 'text-red-400'}`}>{slot.on ? 'ON' : 'OFF'}</span>
                  )}
                </>
              ) : (
                <span className="text-slate-500">?</span>
              )}
            </button>
          ))}
          <span className="text-slate-500">—</span>
          <span title="bulb" style={{ filter: bulbGlow }}>{lit ? '💡' : '🔆'}</span>
        </div>
        <div className="mt-2 text-center text-[11px] text-slate-400">electricity flows in a loop 🔁</div>
      </div>

      {/* Tray */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {puzzle.tray.map((key) => {
          const p = PARTS[key]
          const isSel = selected === key
          return (
            <button
              key={key}
              type="button"
              disabled={!!feedback}
              onClick={() => { sound.tick(); setSelected(isSel ? null : key) }}
              className={`flex items-center gap-1 rounded-xl border-2 px-3 py-2 font-bold shadow transition ${
                isSel ? 'border-amber-500 bg-amber-100 scale-105' : 'border-slate-200 bg-white hover:bg-sky-50'
              }`}
            >
              <span className="text-xl">{p.emoji}</span> <span className="text-sm">{p.label}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">Tap a part, then tap a gap. Tap a placed switch to flip it.</p>

      {!feedback ? (
        <div className="mt-4 text-center">
          <button onClick={test} className="rounded-full bg-sky-600 px-8 py-3 text-lg font-extrabold text-white shadow-lg hover:bg-sky-700">⚡ Test circuit!</button>
        </div>
      ) : (
        <div className={`mt-4 rounded-2xl p-4 text-center font-bold ${feedback.lit ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
          {feedback.lit ? '💡 It lights up!' : '🔌 No light yet.'} {feedback.explain}
        </div>
      )}
    </div>
  )
}
