import { useMemo, useRef, useState } from 'react'
import type { TypingLesson } from '../../content/types'
import { accuracy, correctChars, wpm } from './stats'
import { sound } from '../../lib/sound'

export type TypingResult = { wpm: number; accuracy: number }

type Props = {
  lesson: TypingLesson
  onFinish: (result: TypingResult) => void
}

export default function TypingView({ lesson, onFinish }: Props) {
  const target = lesson.text
  const [typed, setTyped] = useState('')
  const startRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const elapsedMs =
    startRef.current === null ? 0 : Date.now() - startRef.current
  const liveWpm = wpm(correctChars(typed, target), elapsedMs)
  const liveAcc = accuracy(typed, target)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.slice(0, target.length)
    if (startRef.current === null && value.length > 0) {
      startRef.current = Date.now()
    }
    if (value.length > typed.length) sound.key()
    setTyped(value)

    if (value.length === target.length) {
      const ms = startRef.current === null ? 0 : Date.now() - startRef.current
      sound.correct()
      onFinish({
        wpm: wpm(correctChars(value, target), ms),
        accuracy: accuracy(value, target),
      })
    }
  }

  const chars = useMemo(
    () =>
      target.split('').map((ch, i) => {
        let cls = 'text-slate-300' // pending
        if (i < typed.length) {
          cls = typed[i] === ch ? 'text-green-600' : 'bg-red-200 text-red-600'
        }
        return (
          <span key={i} className={cls}>
            {ch}
          </span>
        )
      }),
    [target, typed],
  )

  return (
    <div
      className="mx-auto max-w-2xl p-8"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="mb-6 flex justify-center gap-8 text-xl font-bold text-sky-700">
        <span>⚡ {liveWpm} WPM</span>
        <span>🎯 {liveAcc}%</span>
      </div>

      <div className="rounded-3xl bg-white p-8 text-2xl leading-relaxed font-mono shadow-lg tracking-wide">
        {chars}
      </div>

      <input
        ref={inputRef}
        autoFocus
        value={typed}
        onChange={handleChange}
        aria-label="Type the text above"
        className="mt-6 w-full rounded-2xl border-2 border-sky-200 p-4 text-lg focus:border-sky-500 focus:outline-none"
        placeholder="Start typing here…"
      />
      <p className="mt-3 text-center text-sm text-slate-400">
        Type the sentence above. Correct letters turn green!
      </p>
    </div>
  )
}
