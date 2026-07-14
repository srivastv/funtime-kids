import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../../lib/useContent'
import { staticProvider } from '../../content/staticProvider'
import { sound } from '../../lib/sound'
import { loadBest } from '../../lib/storage'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'
import LabHub, { type LabView } from './LabHub'
import ExperimentPlay from './ExperimentPlay'
import SoundLab from './SoundLab'
import CircuitBuilder from './CircuitBuilder'
import PlantGrower from './PlantGrower'
import { DIFFICULTIES, bestKey } from './engine'

export default function OddSciencePage() {
  const [view, setView] = useState<LabView | null>(null)
  const [quizDiff, setQuizDiff] = useState<1 | 2 | 3 | null>(null)
  const navigate = useNavigate()
  const { data, loading, error } = useContent(() => staticProvider.getOddExperiments(), [])

  if (loading) return <Loading />
  if (error || !data) return <ErrorScreen onRetry={() => window.location.reload()} />

  const home = () => navigate('/')
  const toHub = () => {
    setView(null)
    setQuizDiff(null)
  }

  if (view === null) return <LabHub onPick={setView} />

  if (view === 'sound') return <SoundLab onExit={toHub} onHome={home} />
  if (view === 'circuit') return <CircuitBuilder onExit={toHub} onHome={home} />
  if (view === 'plant') return <PlantGrower onExit={toHub} onHome={home} />

  // Science Quiz: choose difficulty, then play a mixed-topic pool.
  if (quizDiff === null) return <QuizStart onPick={setQuizDiff} onBack={toHub} />
  return (
    <ExperimentPlay
      items={data}
      mode="mixed"
      difficulty={quizDiff}
      onExit={() => setQuizDiff(null)}
      onHome={home}
    />
  )
}

function QuizStart({ onPick, onBack }: { onPick: (d: 1 | 2 | 3) => void; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="mb-2 text-3xl font-extrabold text-amber-700">🧠 Science Quiz</h1>
      <p className="mb-8 text-slate-600">Predict what happens, then see the result. Pick a difficulty!</p>
      <div className="flex flex-col gap-3">
        {DIFFICULTIES.map((d) => {
          const best = loadBest(bestKey('mixed', d.level))
          return (
            <button
              key={d.level}
              type="button"
              onClick={() => {
                sound.click()
                onPick(d.level)
              }}
              className="rounded-2xl bg-white p-5 shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="text-xl font-bold text-slate-700">
                {d.name} <span className="ml-1 text-sm opacity-70">{'⭐'.repeat(d.level)}</span>
              </div>
              <div className="mt-1 text-sm text-slate-500">{d.desc}</div>
              {best > 0 && <div className="mt-1 text-sm font-semibold text-amber-600">Best: {best} / 8</div>}
            </button>
          )
        })}
      </div>
      <button onClick={() => { sound.click(); onBack() }} className="mt-8 text-slate-500 underline hover:text-slate-700">
        ← Back to the lab
      </button>
    </div>
  )
}
