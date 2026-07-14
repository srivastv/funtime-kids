import { useEffect, useRef, useState } from 'react'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import ResultScreen from '../../components/ResultScreen'

// C major scale, C4 → C5. Lower notes first (widest/tallest bars).
const NOTES = [
  { note: 'C', freq: 261.63, color: '#ef4444' },
  { note: 'D', freq: 293.66, color: '#f97316' },
  { note: 'E', freq: 329.63, color: '#eab308' },
  { note: 'F', freq: 349.23, color: '#22c55e' },
  { note: 'G', freq: 392.0, color: '#14b8a6' },
  { note: 'A', freq: 440.0, color: '#3b82f6' },
  { note: 'B', freq: 493.88, color: '#8b5cf6' },
  { note: 'C', freq: 523.25, color: '#ec4899' },
]

const BEST_KEY = 'odd:sound'

type Phase = 'free' | 'watch' | 'input' | 'over'

function starsFor(streak: number): number {
  if (streak >= 8) return 3
  if (streak >= 5) return 2
  if (streak >= 2) return 1
  return 0
}

type Props = { onExit: () => void; onHome: () => void }

export default function SoundLab({ onExit, onHome }: Props) {
  const [phase, setPhase] = useState<Phase>('free')
  const [seq, setSeq] = useState<number[]>([])
  const [inputPos, setInputPos] = useState(0)
  const [highlight, setHighlight] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [newBest, setNewBest] = useState(false)
  const timeouts = useRef<number[]>([])

  useEffect(() => () => timeouts.current.forEach(clearTimeout), [])

  function after(fn: () => void, ms: number) {
    timeouts.current.push(window.setTimeout(fn, ms))
  }
  function clearTimers() {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }

  function playSequence(s: number[]) {
    clearTimers()
    setPhase('watch')
    setHighlight(null)
    s.forEach((noteIdx, k) => {
      after(() => {
        setHighlight(noteIdx)
        sound.tone(NOTES[noteIdx].freq, 0.45)
      }, k * 600)
      after(() => setHighlight(null), k * 600 + 450)
    })
    after(() => {
      setPhase('input')
      setInputPos(0)
    }, s.length * 600 + 250)
  }

  function startChallenge() {
    const first = [Math.floor(Math.random() * NOTES.length)]
    setSeq(first)
    setStreak(0)
    playSequence(first)
  }

  function flash(i: number) {
    setHighlight(i)
    after(() => setHighlight((h) => (h === i ? null : h)), 220)
  }

  function endGame() {
    setPhase('over')
    const nb = streak > loadBest(BEST_KEY)
    if (nb) saveBest(BEST_KEY, streak)
    setNewBest(nb)
  }

  function tapBar(i: number) {
    if (phase === 'watch' || phase === 'over') return
    sound.tone(NOTES[i].freq, 0.4)
    flash(i)
    if (phase !== 'input') return // free play

    if (i === seq[inputPos]) {
      const np = inputPos + 1
      if (np === seq.length) {
        // Round cleared — grow the sequence and replay.
        setStreak(seq.length)
        const next = [...seq, Math.floor(Math.random() * NOTES.length)]
        after(() => {
          setSeq(next)
          playSequence(next)
        }, 750)
      } else {
        setInputPos(np)
      }
    } else {
      sound.wrong()
      endGame()
    }
  }

  if (phase === 'over') {
    const best = loadBest(BEST_KEY)
    return (
      <ResultScreen
        title="Great ears! 🎵"
        lines={[`You copied a tune of ${streak} note${streak === 1 ? '' : 's'}`]}
        starCount={starsFor(streak)}
        reward={{ gameId: 'odd', stars: starsFor(streak), isNewBest: newBest }}
        best={best > 0 ? `Best streak: ${best}` : undefined}
        onPlayAgain={() => { setPhase('free'); setSeq([]); setStreak(0) }}
        onHome={onHome}
      />
    )
  }

  const banner =
    phase === 'watch' ? '👀 Listen and watch…' : phase === 'input' ? `Your turn! Note ${inputPos + 1} of ${seq.length}` : 'Tap the bars to play music!'

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => { sound.click(); onExit() }} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-600 shadow">← Lab</button>
        <h1 className="text-2xl font-extrabold text-amber-700">🔊 Sound & Pitch Lab</h1>
        <span className="w-14" />
      </div>

      <div className="mb-4 rounded-2xl bg-amber-100 px-5 py-3 text-center text-lg font-bold text-amber-800">{banner}</div>

      {/* Xylophone: bars get shorter left→right, so the biggest bar is the lowest note. */}
      <div className="flex items-end justify-center gap-2 rounded-3xl bg-gradient-to-b from-sky-100 to-white p-5 shadow-inner">
        {NOTES.map((n, i) => {
          const h = 220 - i * 18
          const lit = highlight === i
          return (
            <button
              key={i}
              type="button"
              onClick={() => tapBar(i)}
              className={`flex w-9 items-end justify-center rounded-xl pb-2 font-black text-white shadow-lg transition-all sm:w-11 ${lit ? 'scale-110 brightness-125 ring-4 ring-white' : 'hover:brightness-110'}`}
              style={{ height: h, background: n.color }}
              aria-label={`Note ${n.note}`}
            >
              {n.note}
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-center text-sm text-slate-500">
        Bigger bars make <b>lower</b> sounds — they vibrate more slowly. Small bars vibrate fast for <b>high</b> notes.
      </p>

      <div className="mt-5 flex justify-center gap-3">
        {phase === 'free' ? (
          <button onClick={() => { sound.click(); startChallenge() }} className="rounded-full bg-amber-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg hover:bg-amber-600">
            🧠 Copy the Tune!
          </button>
        ) : (
          <button onClick={() => { sound.click(); clearTimers(); setPhase('free'); setSeq([]) }} className="rounded-full bg-white px-6 py-3 font-bold text-slate-600 shadow">
            Stop
          </button>
        )}
      </div>
    </div>
  )
}
