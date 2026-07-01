import { useEffect, useRef, useState } from 'react'
import type { FallingWord } from '../../content/types'
import {
  initState,
  addFaller,
  tick,
  submitTyped,
  spawnIntervalMs,
  fallSpeed,
  pickWord,
  type FallingState,
} from './engine'

type Props = {
  words: FallingWord[]
  onGameOver: (score: number) => void
}

export default function FallingGame({ words, onGameOver }: Props) {
  const [state, setState] = useState<FallingState>(() => initState())
  const stateRef = useRef(state)
  stateRef.current = state

  const idRef = useRef(0)
  const spawnAccRef = useRef(Number.MAX_SAFE_INTEGER) // spawn immediately on first frame
  const lastRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function loop(t: number) {
      if (lastRef.current === null) lastRef.current = t
      const dt = t - lastRef.current
      lastRef.current = t

      let s = stateRef.current

      spawnAccRef.current += dt
      if (spawnAccRef.current >= spawnIntervalMs(s.score)) {
        spawnAccRef.current = 0
        s = addFaller(s, {
          id: idRef.current++,
          word: pickWord(words, s.score),
          xPct: 5 + Math.random() * 80,
          yPct: 0,
          speed: fallSpeed(s.score),
        })
      }

      s = tick(s, dt)
      stateRef.current = s
      setState(s)

      if (s.status === 'playing') {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        onGameOver(s.score)
      }
    }

    rafRef.current = requestAnimationFrame(loop)
    inputRef.current?.focus()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const typed = e.target.value.trim().toLowerCase()
    const s = submitTyped(stateRef.current, typed)
    stateRef.current = s
    setState(s)
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-3 flex items-center justify-between text-xl font-bold text-sky-700">
        <span>⭐ {state.score}</span>
        <span aria-label={`${state.lives} lives`}>
          {'❤️'.repeat(state.lives)}
          <span className="opacity-20">{'❤️'.repeat(Math.max(0, 3 - state.lives))}</span>
        </span>
      </div>

      <div
        className="relative h-96 w-full overflow-hidden rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-indigo-100"
        onClick={() => inputRef.current?.focus()}
      >
        {state.fallers.map((f) => (
          <div
            key={f.id}
            className="absolute -translate-x-1/2 rounded-xl bg-white px-3 py-1 text-lg font-bold text-slate-700 shadow"
            style={{ top: `${f.yPct}%`, left: `${f.xPct}%` }}
          >
            {f.word}
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        autoFocus
        value={state.typed}
        onChange={handleChange}
        aria-label="Type a falling word"
        className="mt-4 w-full rounded-2xl border-2 border-sky-200 p-4 text-center text-xl focus:border-sky-500 focus:outline-none"
        placeholder="Type a word to pop it!"
      />
    </div>
  )
}
