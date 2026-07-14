import { useEffect, useMemo, useRef, useState } from 'react'
import type { TypingLesson } from '../../content/types'
import { accuracy, correctChars, correctPrefix, botProgress, wpm } from './stats'
import { sound } from '../../lib/sound'

export type TypingRaceResult = { wpm: number; accuracy: number; won: boolean; maxCombo: number }

type Props = {
  lesson: TypingLesson
  onFinish: (result: TypingRaceResult) => void
}

// Kid-friendly pace-bot speeds (WPM) by lesson difficulty.
const BOT_WPM = [15, 12, 16, 22]

export default function TypingRace({ lesson, onFinish }: Props) {
  const target = lesson.text
  const botWpm = BOT_WPM[lesson.difficulty] ?? 15

  const [typed, setTyped] = useState('')
  const [botProg, setBotProg] = useState(0)
  const [combo, setCombo] = useState(0)
  const startRef = useRef<number | null>(null)
  const finishedRef = useRef(false)
  const botProgRef = useRef(0)
  const maxComboRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const playerProg = correctPrefix(typed, target) / target.length
  const elapsedMs = startRef.current === null ? 0 : Date.now() - startRef.current
  const liveWpm = wpm(correctChars(typed, target), elapsedMs)
  const liveAcc = accuracy(typed, target)

  function finish(won: boolean) {
    if (finishedRef.current) return
    finishedRef.current = true
    const ms = startRef.current === null ? 1 : Date.now() - startRef.current
    if (won) sound.win()
    else sound.lose()
    onFinish({
      wpm: wpm(correctChars(typed, target), ms),
      accuracy: accuracy(typed, target),
      won,
      maxCombo: maxComboRef.current,
    })
  }

  // Pace-bot: advances every frame based on elapsed time; wins if it reaches the end first.
  useEffect(() => {
    let raf = 0
    function loop() {
      if (!finishedRef.current) {
        if (startRef.current !== null) {
          const bp = botProgress(botWpm, Date.now() - startRef.current, target.length)
          botProgRef.current = bp
          setBotProg(bp)
          if (bp >= 1) {
            finish(false)
            return
          }
        }
        raf = requestAnimationFrame(loop)
      }
    }
    raf = requestAnimationFrame(loop)
    inputRef.current?.focus()
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (finishedRef.current) return
    const value = e.target.value.slice(0, target.length)
    if (startRef.current === null && value.length > 0) startRef.current = Date.now()

    if (value.length > typed.length) {
      const last = value.length - 1
      if (value[last] === target[last]) {
        sound.key()
        setCombo((c) => {
          const n = c + 1
          maxComboRef.current = Math.max(maxComboRef.current, n)
          return n
        })
      } else {
        setCombo(0)
      }
    }
    setTyped(value)

    if (value.length === target.length) {
      finish(botProgRef.current < 1)
    }
  }

  const chars = useMemo(
    () =>
      target.split('').map((ch, i) => {
        let cls = 'text-slate-300'
        if (i < typed.length) cls = typed[i] === ch ? 'text-green-600' : 'bg-red-200 text-red-600'
        return (
          <span key={i} className={cls}>
            {ch}
          </span>
        )
      }),
    [target, typed],
  )

  const lane = (emoji: string, prog: number, tint: string) => (
    <div className={`relative h-12 rounded-2xl border-2 ${tint} overflow-hidden`}>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xl opacity-70">🏁</div>
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-2xl transition-all duration-150"
        style={{ left: `${4 + prog * 88}%` }}
      >
        {emoji}
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl p-6" onClick={() => inputRef.current?.focus()}>
      <div className="mb-4 flex justify-center gap-6 text-lg font-bold text-sky-700">
        <span>⚡ {liveWpm} WPM</span>
        <span>🎯 {liveAcc}%</span>
        {combo >= 5 && <span className="text-orange-500">🔥 {combo} combo!</span>}
      </div>

      <div className="mb-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-14 text-right text-xs font-bold text-sky-600">You</span>
          <div className="flex-1">{lane('🚀', playerProg, 'border-sky-300 bg-sky-50')}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 text-right text-xs font-bold text-slate-500">Robo</span>
          <div className="flex-1">{lane('🤖', botProg, 'border-slate-300 bg-slate-50')}</div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 text-2xl leading-relaxed font-mono shadow-lg tracking-wide">
        {chars}
      </div>

      <input
        ref={inputRef}
        autoFocus
        value={typed}
        onChange={handleChange}
        aria-label="Type the text above to race"
        className="mt-6 w-full rounded-2xl border-2 border-sky-200 p-4 text-lg focus:border-sky-500 focus:outline-none"
        placeholder="Type to make your rocket go!"
      />
      <p className="mt-3 text-center text-sm text-slate-400">
        Type the sentence to beat Robo to the finish line! 🏁
      </p>
    </div>
  )
}
