import { useState, useMemo } from 'react'
import type { GeoItem, GeoMode, GeoQuestion } from '../../content/types'
import { buildQuestionPool, scoreStars, bestKey } from './engine'
import QuestionCard from './QuestionCard'
import MapCard from './MapCard'
import CapitalMatchCard from './CapitalMatchCard'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import ResultScreen from '../../components/ResultScreen'

type Props = {
  items: GeoItem[]
  mode: GeoMode
  difficulty: 1 | 2 | 3
  onExit: () => void
  onHome: () => void
}

export default function GeoPlay({ items, mode, difficulty, onExit, onHome }: Props) {
  const pool = useMemo(() => buildQuestionPool(items, mode, difficulty), [items, mode, difficulty])
  const [index, setIndex] = useState(0)
  const [lives, setLives] = useState(3)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<{ chosen: number; correct: number; fact: string } | null>(null)
  const [finished, setFinished] = useState(false)

  const question: GeoQuestion | undefined = pool[index]

  if (!question || pool.length === 0) {
    return (
      <div className="p-8 text-center text-slate-600">
        Not enough geography data for this difficulty. Try a lower level.
        <div className="mt-4"><button onClick={onExit} className="rounded-full bg-sky-500 px-6 py-2 text-white font-bold">Back</button></div>
      </div>
    )
  }

  function handleAnswer(choice: number) {
    if (feedback) return
    const isCorrect = choice === question!.answerIndex
    setFeedback({ chosen: choice, correct: question!.answerIndex, fact: question!.funFact })
    if (isCorrect) {
      sound.correct()
      setCorrectCount((c) => c + 1)
    } else {
      sound.wrong()
      setLives((l) => l - 1)
    }
    setTimeout(() => {
      setFeedback(null)
      const nextLives = isCorrect ? lives : lives - 1
      const nextIndex = index + 1
      if (nextLives <= 0 || nextIndex >= pool.length) {
        setFinished(true)
      } else {
        setIndex(nextIndex)
      }
    }, 1400)
  }

  if (finished) {
    const total = pool.length
    const stars = scoreStars(correctCount, total)
    const key = bestKey(mode, difficulty)
    const prevBest = loadBest(key)
    const isNewBest = correctCount > prevBest
    if (isNewBest) saveBest(key, correctCount)
    return (
      <ResultScreen
        title="World Hop Complete!"
        lines={[`${correctCount} out of ${total} correct`, `Lives left: ${Math.max(0, lives)}`]}
        starCount={stars}
        best={isNewBest ? `New best! Previous: ${prevBest}/10` : prevBest > 0 ? `Best: ${prevBest}/10` : undefined}
        onPlayAgain={onExit}
        onHome={onHome}
      />
    )
  }

  const useMapCard = question.type === 'map' || question.type === 'landmarkmap'
  const Card = question.type === 'capitalmatch' ? CapitalMatchCard : useMapCard ? MapCard : QuestionCard

  return (
    <div>
      <Card
        question={question}
        index={index}
        total={pool.length}
        lives={lives}
        onAnswer={handleAnswer}
        feedback={feedback ? { chosen: feedback.chosen, correct: feedback.correct } : null}
      />
      {feedback && (
        <div className="mx-auto max-w-2xl px-6 -mt-2">
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 text-center text-amber-900 font-semibold">
            💡 Did you know? {feedback.fact}
          </div>
        </div>
      )}
      <div className="mt-6 text-center">
        <button onClick={onExit} className="text-slate-500 underline hover:text-slate-700">Change mode</button>
      </div>
    </div>
  )
}
