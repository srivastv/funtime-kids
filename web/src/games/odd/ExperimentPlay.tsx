import { useMemo, useState } from 'react'
import type { OddExperiment, OddMode } from '../../content/types'
import { buildExperimentPool, checkAnswer, scoreStars, bestKey, type OddAnswer } from './engine'
import ExperimentRenderer from './ExperimentRenderer'
import ResultScreen from '../../components/ResultScreen'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'

type Props = {
  items: OddExperiment[]
  mode: OddMode
  difficulty: 1|2|3
  onExit: ()=>void
  onHome: ()=>void
}

export default function ExperimentPlay({ items, mode, difficulty, onExit, onHome }: Props) {
  const pool = useMemo(()=> buildExperimentPool(items, mode, difficulty), [items,mode,difficulty])
  const [index, setIndex] = useState(0)
  const [lives, setLives] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<null | {correct:boolean, explanation:string, funFact:string}>(null)
  const [finished, setFinished] = useState(false)

  const exp = pool[index]
  if (!exp) return <div className="p-8 text-center">Not enough experiments. <button onClick={onExit} className="underline text-sky-600">Back</button></div>

  function handleAnswer(answer: OddAnswer) {
    if (feedback) return
    const isCorrect = checkAnswer(exp, answer)
    setFeedback({ correct:isCorrect, explanation: exp.explanation, funFact: exp.funFact })
    if (isCorrect) { sound.correct(); setCorrect(c=>c+1) } else { sound.wrong(); setLives(l=>l-1) }
    setTimeout(()=>{
      setFeedback(null)
      const nextLives = isCorrect ? lives : lives-1
      const nextIdx = index+1
      if (nextLives<=0 || nextIdx>=pool.length) {
        setFinished(true)
      } else {
        setIndex(nextIdx)
      }
    }, 2200)
  }

  if (finished) {
    const total = pool.length
    const stars = scoreStars(correct, total)
    const key = bestKey(mode, difficulty)
    const prev = loadBest(key)
    const isNew = correct > prev
    if (isNew) saveBest(key, correct)
    return <ResultScreen
      title="Lab Complete! 🧪"
      lines={[`${correct} out of ${total} correct predictions`, `Lives left: ${Math.max(0,lives)}`]}
      starCount={stars}
      best={isNew ? `New best! Previous ${prev}/8` : prev>0 ? `Best ${prev}/8` : undefined}
      onPlayAgain={onExit}
      onHome={onHome}
    />
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-3 flex justify-between font-semibold text-slate-600 px-2">
        <span>Experiment {index+1} / {pool.length}</span>
        <span>❤️ {'♥'.repeat(lives)}{'♡'.repeat(3-lives)} &nbsp; ⭐ {correct}</span>
      </div>
      <div className="rounded-3xl bg-gradient-to-b from-white to-amber-50 shadow-xl border-2 border-amber-200 p-1">
        <div className="rounded-[22px] bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🧪</div>
            <div>
              <div className="text-xs uppercase tracking-wide text-amber-700 font-bold">{exp.topic.replace('-',' & ')}</div>
              <h2 className="text-2xl font-extrabold text-slate-800">{exp.title}</h2>
            </div>
          </div>
          <p className="text-xl font-bold text-sky-800 mb-2">Predict:</p>
          <p className="text-lg text-slate-700 mb-6">{exp.prompt}</p>
          <ExperimentRenderer experiment={exp} disabled={!!feedback} onAnswer={handleAnswer} feedback={feedback} />
          {feedback && (
            <div className={`mt-6 rounded-2xl p-4 border-2 ${feedback.correct ? 'bg-green-50 border-green-300 text-green-900' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
              <p className="font-extrabold text-lg">{feedback.correct ? '✅ Correct!' : '💡 Almost!' } Professor Odd says:</p>
              <p className="mt-1">{feedback.explanation}</p>
              <p className="mt-2 text-sm italic opacity-80">Fun fact: {feedback.funFact}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 text-center">
        <button onClick={onExit} className="text-slate-500 underline text-sm hover:text-slate-700">Change bench</button>
      </div>
    </div>
  )
}
