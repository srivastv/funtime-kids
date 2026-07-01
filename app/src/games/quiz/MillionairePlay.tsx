import { useRef, useState } from 'react'
import type { Question } from '../../content/types'
import {
  LADDER_AMOUNTS,
  LADDER_SIZE,
  formatMoney,
  walkAwayAmount,
  fallbackAmount,
  fiftyFifty,
  audienceVotes,
  swapQuestion,
} from './millionaire'
import MoneyLadder from './MoneyLadder'
import Lifelines, { type LifelineState } from './Lifelines'
import AudienceChart from './AudienceChart'

export type MillionaireResult = {
  amount: number
  outcome: 'won' | 'walked' | 'lost'
}

type Props = {
  ladder: Question[]
  pool: Question[]
  onFinish: (result: MillionaireResult) => void
}

type Phase = 'asking' | 'locked' | 'revealed'

const LETTERS = ['A', 'B', 'C', 'D']

export default function MillionairePlay({ ladder, pool, onFinish }: Props) {
  const [rungIndex, setRungIndex] = useState(0)
  const [current, setCurrent] = useState<Question>(ladder[0])
  const [phase, setPhase] = useState<Phase>('asking')
  const [selected, setSelected] = useState<number | null>(null)
  const [hidden, setHidden] = useState<number[]>([])
  const [audience, setAudience] = useState<number[] | null>(null)
  const [used, setUsed] = useState<LifelineState>({
    fifty: false,
    audience: false,
    swap: false,
  })
  const usedIdsRef = useRef(new Set(ladder.map((q) => q.id)))
  const timerRef = useRef<number | null>(null)

  const isCorrect = selected !== null && selected === current.answerIndex

  function resetForQuestion() {
    setPhase('asking')
    setSelected(null)
    setHidden([])
    setAudience(null)
  }

  function pick(choice: number) {
    if (phase !== 'asking' || hidden.includes(choice)) return
    setSelected(choice)
    setPhase('locked')
    timerRef.current = window.setTimeout(() => setPhase('revealed'), 1300)
  }

  function advance() {
    const next = rungIndex + 1
    setRungIndex(next)
    setCurrent(ladder[next])
    resetForQuestion()
  }

  function onFifty() {
    if (used.fifty) return
    setHidden(fiftyFifty(current))
    setUsed((u) => ({ ...u, fifty: true }))
  }

  function onAudience() {
    if (used.audience) return
    setAudience(audienceVotes(current))
    setUsed((u) => ({ ...u, audience: true }))
  }

  function onSwap() {
    if (used.swap) return
    const replacement = swapQuestion(pool, current, usedIdsRef.current)
    if (!replacement) return
    usedIdsRef.current.add(replacement.id)
    setCurrent(replacement)
    setSelected(null)
    setHidden([])
    setAudience(null)
    setPhase('asking')
    setUsed((u) => ({ ...u, swap: true }))
  }

  function answerClass(i: number): string {
    const base =
      'flex items-center gap-3 rounded-full border-2 px-5 py-3 text-left text-lg font-bold transition'
    if (hidden.includes(i)) return `${base} invisible`
    if (phase === 'revealed' && i === current.answerIndex)
      return `${base} border-green-400 bg-green-500 text-white`
    if (phase === 'revealed' && i === selected)
      return `${base} border-red-400 bg-red-500 text-white`
    if ((phase === 'locked' || phase === 'revealed') && i === selected)
      return `${base} border-amber-400 bg-amber-400 text-indigo-950`
    return `${base} border-amber-400/60 bg-indigo-900 text-amber-100 hover:bg-indigo-800`
  }

  const currentPrize =
    rungIndex === 0 ? formatMoney(0) : formatMoney(LADDER_AMOUNTS[rungIndex - 1])

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Main panel */}
        <div className="flex-1 rounded-3xl bg-gradient-to-b from-indigo-800 to-indigo-950 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between text-amber-300">
            <span className="text-sm font-bold">
              Question {rungIndex + 1} of {LADDER_SIZE}
            </span>
            <span className="text-lg font-extrabold">
              Playing for {formatMoney(LADDER_AMOUNTS[rungIndex])}
            </span>
          </div>

          <Lifelines
            used={used}
            disabled={phase !== 'asking'}
            onFifty={onFifty}
            onAudience={onAudience}
            onSwap={onSwap}
          />

          {audience && (
            <AudienceChart votes={audience} onClose={() => setAudience(null)} />
          )}

          <div className="my-6 rounded-2xl border-2 border-amber-400/50 bg-indigo-950 px-6 py-6 text-center text-xl font-bold text-white">
            {current.prompt}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {current.choices.map((choice, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={phase !== 'asking'}
                className={answerClass(i)}
              >
                <span className="font-extrabold text-amber-400">{LETTERS[i]}</span>
                <span>{choice}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col items-center gap-3">
            {phase === 'asking' && rungIndex > 0 && (
              <button
                type="button"
                onClick={() =>
                  onFinish({ amount: walkAwayAmount(rungIndex), outcome: 'walked' })
                }
                className="rounded-full bg-white/90 px-6 py-2 text-sm font-bold text-indigo-900 hover:bg-white"
              >
                Walk away with {currentPrize}
              </button>
            )}

            {phase === 'revealed' && isCorrect && rungIndex + 1 < LADDER_SIZE && (
              <button
                type="button"
                onClick={advance}
                className="rounded-full bg-amber-400 px-8 py-3 text-lg font-extrabold text-indigo-950 hover:bg-amber-300"
              >
                Correct! Next question →
              </button>
            )}

            {phase === 'revealed' && isCorrect && rungIndex + 1 === LADDER_SIZE && (
              <button
                type="button"
                onClick={() =>
                  onFinish({ amount: LADDER_AMOUNTS[rungIndex], outcome: 'won' })
                }
                className="rounded-full bg-amber-400 px-8 py-3 text-lg font-extrabold text-indigo-950 hover:bg-amber-300"
              >
                🏆 Collect {formatMoney(LADDER_AMOUNTS[rungIndex])}!
              </button>
            )}

            {phase === 'revealed' && !isCorrect && (
              <button
                type="button"
                onClick={() =>
                  onFinish({ amount: fallbackAmount(rungIndex), outcome: 'lost' })
                }
                className="rounded-full bg-white/90 px-8 py-3 text-lg font-bold text-indigo-900 hover:bg-white"
              >
                See results
              </button>
            )}
          </div>
        </div>

        {/* Money ladder */}
        <aside className="lg:w-56">
          <MoneyLadder currentIndex={rungIndex} />
        </aside>
      </div>
    </div>
  )
}
