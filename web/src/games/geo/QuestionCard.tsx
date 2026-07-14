import type { GeoQuestion } from '../../content/types'
import { sound } from '../../lib/sound'

type Props = {
  question: GeoQuestion
  index: number
  total: number
  lives: number
  onAnswer: (choiceIndex: number) => void
  feedback?: { chosen: number; correct: number } | null
}

export default function QuestionCard({ question, index, total, lives, onAnswer, feedback }: Props) {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between text-slate-600 font-semibold">
        <span>
          Question {index + 1} / {total}
        </span>
        <span>❤️ { '♥'.repeat(lives) }{ '♡'.repeat(Math.max(0,3-lives)) }</span>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-xl text-center">
        <p className="text-2xl font-bold text-sky-800 mb-6">{question.prompt}</p>

        {question.type === 'flag' && (
          <div className="mb-6 text-8xl leading-none">
            {question.visual?.flagEmoji ?? '🏳️'}
          </div>
        )}

        {question.type === 'landmark' && (
          <div className="mb-6 text-7xl leading-none">{question.visual?.icon ?? '🗺️'}</div>
        )}

        {question.type === 'capital' && (
          <div className="mb-6 text-8xl leading-none">{question.visual?.flagEmoji ?? '🏛️'}</div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.choices.map((c, i) => {
            const isChosen = feedback?.chosen === i
            const isCorrect = feedback?.correct === i
            const show = !!feedback
            let cls = 'rounded-2xl px-6 py-4 text-lg font-bold shadow transition '
            if (!show) cls += 'bg-sky-50 hover:bg-sky-100 text-sky-900'
            else if (isCorrect) cls += 'bg-green-500 text-white'
            else if (isChosen) cls += 'bg-red-400 text-white'
            else cls += 'bg-slate-100 text-slate-500'
            return (
              <button
                key={i}
                type="button"
                disabled={!!feedback}
                onClick={() => {
                  sound.click()
                  onAnswer(i)
                }}
                className={cls}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
