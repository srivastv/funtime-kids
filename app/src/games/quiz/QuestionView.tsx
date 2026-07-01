import { useState } from 'react'
import type { Question } from '../../content/types'
import { isCorrect } from './scoring'

type Props = {
  question: Question
  index: number
  total: number
  onAnswer: (correct: boolean) => void
}

export default function QuestionView({ question, index, total, onAnswer }: Props) {
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null

  function pick(choice: number) {
    if (answered) return
    setPicked(choice)
  }

  function buttonClass(choice: number): string {
    const base =
      'rounded-2xl px-5 py-4 text-lg font-bold shadow transition text-left'
    if (!answered) return `${base} bg-white text-slate-700 hover:scale-105`
    if (choice === question.answerIndex)
      return `${base} bg-green-500 text-white`
    if (choice === picked) return `${base} bg-red-400 text-white`
    return `${base} bg-white text-slate-400 opacity-70`
  }

  const correct = answered && isCorrect(question, picked)

  return (
    <div className="mx-auto max-w-2xl p-8">
      <p className="mb-2 text-center text-sm font-semibold text-slate-400">
        Question {index + 1} of {total}
      </p>
      <h2 className="mb-6 text-center text-2xl font-extrabold text-slate-800">
        {question.prompt}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            onClick={() => pick(i)}
            disabled={answered}
            className={buttonClass(i)}
          >
            {choice}
          </button>
        ))}
      </div>

      {answered && (
        <div className="mt-6 text-center">
          <p className="text-xl font-bold">
            {correct ? '✅ Correct!' : '❌ Not quite!'}
          </p>
          <button
            type="button"
            onClick={() => onAnswer(!!correct)}
            className="mt-4 rounded-full bg-sky-500 px-8 py-3 text-lg font-bold text-white shadow hover:bg-sky-600"
          >
            {index + 1 >= total ? 'See results' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
