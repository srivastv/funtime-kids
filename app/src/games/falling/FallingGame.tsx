import { useEffect, useRef, useState } from 'react'
import type { FallingWord } from '../../content/types'
import { sound, startMusic, stopMusic } from '../../lib/sound'
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

/** A short-lived "bomb flies up, word blasts" visual effect. Purely cosmetic. */
type Blast = {
  id: number
  word: string
  x: number // target x (%)
  y: number // target y (%)
  bombX: number // current bomb x (%), animates toward target
  bombY: number // current bomb y (%)
  stage: 'fly' | 'boom'
}

const PARTICLE_COLORS = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc']

export default function FallingGame({ words, onGameOver }: Props) {
  const [state, setState] = useState<FallingState>(() => initState())
  const stateRef = useRef(state)
  stateRef.current = state

  const [blasts, setBlasts] = useState<Blast[]>([])
  const blastIdRef = useRef(0)
  const timeoutsRef = useRef<number[]>([])

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

      const livesBefore = s.lives
      s = tick(s, dt)
      if (s.lives < livesBefore && s.status === 'playing') sound.lifeLost()
      stateRef.current = s
      setState(s)

      if (s.status === 'playing') {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        sound.lose()
        onGameOver(s.score)
      }
    }

    rafRef.current = requestAnimationFrame(loop)
    inputRef.current?.focus()
    startMusic()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      timeoutsRef.current.forEach(clearTimeout)
      stopMusic()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  /** Launch a bomb from the bottom that flies to (x,y) and blasts the word. */
  function spawnBlast(word: string, x: number, y: number) {
    const id = blastIdRef.current++
    setBlasts((prev) => [
      ...prev,
      { id, word, x, y, bombX: 50, bombY: 100, stage: 'fly' },
    ])
    // Next tick: move the bomb toward the target so its CSS transition animates.
    later(
      () =>
        setBlasts((prev) =>
          prev.map((b) => (b.id === id ? { ...b, bombX: x, bombY: y } : b)),
        ),
      20,
    )
    // Impact: switch to the explosion.
    later(
      () =>
        setBlasts((prev) =>
          prev.map((b) => (b.id === id ? { ...b, stage: 'boom' } : b)),
        ),
      230,
    )
    // Cleanup after the boom animation.
    later(() => setBlasts((prev) => prev.filter((b) => b.id !== id)), 700)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const typed = e.target.value.trim().toLowerCase()
    const target = stateRef.current.fallers.find((f) => f.word === typed)
    if (target) {
      sound.pop()
      spawnBlast(target.word, target.xPct, target.yPct)
    }
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
          <span className="opacity-20">
            {'❤️'.repeat(Math.max(0, 3 - state.lives))}
          </span>
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

        {blasts.map((b) => (
          <div key={b.id} className="pointer-events-none">
            {b.stage === 'fly' && (
              <>
                {/* Ghost of the word, sitting still until the bomb lands */}
                <div
                  className="absolute -translate-x-1/2 rounded-xl bg-white px-3 py-1 text-lg font-bold text-slate-700 shadow"
                  style={{ top: `${b.y}%`, left: `${b.x}%` }}
                >
                  {b.word}
                </div>
                {/* The flying bomb */}
                <div
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-2xl"
                  style={{
                    top: `${b.bombY}%`,
                    left: `${b.bombX}%`,
                    transition: 'top 210ms ease-in, left 210ms ease-in',
                  }}
                >
                  💣
                </div>
              </>
            )}

            {b.stage === 'boom' && (
              <div
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${b.y}%`, left: `${b.x}%` }}
              >
                <div className="funtime-boom text-4xl">💥</div>
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2
                  const dx = Math.cos(angle) * 44
                  const dy = Math.sin(angle) * 44
                  return (
                    <span
                      key={i}
                      className="funtime-particle"
                      style={
                        {
                          background: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                          '--dx': `${dx}px`,
                          '--dy': `${dy}px`,
                        } as React.CSSProperties
                      }
                    />
                  )
                })}
              </div>
            )}
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
