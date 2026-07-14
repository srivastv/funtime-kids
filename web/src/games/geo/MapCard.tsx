import { lazy, Suspense } from 'react'
import type { GeoQuestion } from '../../content/types'

// Country data (~100KB) + d3-geo load only when a map mode is actually played.
const MapDrop = lazy(() => import('./MapDrop'))

type Props = {
  question: GeoQuestion
  index: number
  total: number
  lives: number
  onAnswer: (choiceIndex: number) => void
  feedback?: { chosen: number; correct: number } | null
}

/**
 * Card for the map-based modes (Map Drop and Landmark Hunt). The answer is a
 * *location*: the player drags a token (flag or landmark pin) onto the correct dot
 * (or taps a dot). There are deliberately no name buttons — that would give it away.
 */
export default function MapCard({ question, index, total, lives, onAnswer, feedback }: Props) {
  const isLandmark = question.type === 'landmarkmap'
  const tokenEmoji = isLandmark ? (question.visual?.icon ?? '📍') : question.visual?.flagEmoji
  const hint = isLandmark
    ? 'Drag the pin onto the country where this landmark is, or tap a numbered dot.'
    : 'Drag the flag onto the correct country, or tap a numbered dot.'
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between text-slate-600 font-semibold">
        <span>Question {index + 1} / {total}</span>
        <span>❤️ {'♥'.repeat(lives)}{'♡'.repeat(Math.max(0, 3 - lives))}</span>
      </div>

      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl text-center">
        <p className="text-2xl font-bold text-sky-800 mb-4">{question.prompt}</p>

        <Suspense fallback={<div className="mb-6 flex aspect-[8/5] w-full max-w-2xl mx-auto items-center justify-center rounded-3xl bg-sky-100 text-sky-500 font-bold">Loading map…</div>}>
          <MapDrop
            items={question.mapItems ?? []}
            tokenEmoji={tokenEmoji}
            feedback={feedback}
            onAnswer={onAnswer}
          />
        </Suspense>

        {!feedback && (
          <p className="text-sm text-slate-500">{hint}</p>
        )}
        {feedback && (
          <p className={`text-lg font-bold ${feedback.chosen === feedback.correct ? 'text-green-600' : 'text-red-500'}`}>
            {feedback.chosen === feedback.correct ? '🎉 Spot on!' : `Not quite — the green dot is the right spot.`}
          </p>
        )}
      </div>
    </div>
  )
}
