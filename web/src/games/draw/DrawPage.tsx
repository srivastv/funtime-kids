import { useMemo, useState } from 'react'
import { useContent } from '../../lib/useContent'
import { staticProvider } from '../../content/staticProvider'
import { sound } from '../../lib/sound'
import type { DrawingLesson } from '../../content/types'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'
import DrawCanvas from './DrawCanvas'
import { sampleLesson } from './trace'

type DrawMode = 'free' | 'trace'

export default function DrawPage() {
  const [lesson, setLesson] = useState<DrawingLesson | null>(null)
  const [mode, setMode] = useState<DrawMode>('free')
  const { data, loading, error } = useContent(() => staticProvider.getDrawings(), [])

  if (loading) return <Loading />
  if (error || !data || data.length === 0) return <ErrorScreen />

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-sky-700">
          What shall we draw?
        </h1>

        {/* Mode toggle */}
        <div className="mb-8 flex justify-center gap-2">
          {([
            { id: 'free', label: '✏️ Free Draw', desc: 'Follow the steps at your own pace' },
            { id: 'trace', label: '✨ Trace & Score', desc: 'Trace the picture and get a score' },
          ] as const).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                sound.click()
                setMode(m.id)
              }}
              className={`rounded-full px-5 py-2 font-bold shadow transition ${
                mode === m.id ? 'bg-sky-500 text-white' : 'bg-white text-sky-700 hover:bg-sky-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mb-6 -mt-4 text-center text-sm text-slate-500">
          {mode === 'trace' ? 'Trace over the dotted picture, then score how neat it is!' : 'Draw step by step, then save your masterpiece.'}
        </p>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {data.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                sound.click()
                setLesson(d)
              }}
              className="rounded-3xl bg-white p-6 text-center shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              <div className="text-5xl">{d.icon}</div>
              <div className="mt-3 text-lg font-bold text-slate-700">{d.title}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (mode === 'trace') {
    return <DrawTrace lesson={lesson} onExit={() => setLesson(null)} />
  }
  return <DrawLesson lesson={lesson} onExit={() => setLesson(null)} />
}

function DrawTrace({ lesson, onExit }: { lesson: DrawingLesson; onExit: () => void }) {
  const target = useMemo(() => sampleLesson(lesson.steps, 400), [lesson])
  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            sound.click()
            onExit()
          }}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-600 shadow"
        >
          ← Drawings
        </button>
        <h1 className="text-2xl font-extrabold text-sky-700">
          {lesson.icon} {lesson.title}
        </h1>
        <span className="w-24 text-right text-sm font-semibold text-fuchsia-500">Trace it!</span>
      </div>

      <div className="mb-4 rounded-2xl bg-fuchsia-100 px-5 py-3 text-center text-lg font-bold text-fuchsia-800">
        Trace over the whole dotted picture, then tap “Score my drawing!”
      </div>

      <DrawCanvas
        lesson={lesson}
        stepIndex={lesson.steps.length}
        trace={{ target, bestKey: `draw:trace:${lesson.id}` }}
      />
    </div>
  )
}

function DrawLesson({
  lesson,
  onExit,
}: {
  lesson: DrawingLesson
  onExit: () => void
}) {
  const [step, setStep] = useState(0)
  const total = lesson.steps.length
  const done = step >= total // finished the last step
  const currentStep = Math.min(step, total - 1)

  function next() {
    sound.click()
    if (step + 1 >= total) {
      sound.correct()
      setStep(total) // move into "finished" state
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            sound.click()
            onExit()
          }}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-600 shadow"
        >
          ← Drawings
        </button>
        <h1 className="text-2xl font-extrabold text-sky-700">
          {lesson.icon} {lesson.title}
        </h1>
        <span className="w-24 text-right text-sm font-semibold text-slate-400">
          {done ? 'Done!' : `Step ${currentStep + 1} of ${total}`}
        </span>
      </div>

      <div className="mb-4 rounded-2xl bg-sky-100 px-5 py-3 text-center text-lg font-bold text-sky-800">
        {done ? '🎉 You did it! Save your drawing or start again.' : lesson.steps[currentStep].instruction}
      </div>

      <DrawCanvas lesson={lesson} stepIndex={done ? total : currentStep} />

      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            sound.click()
            setStep((s) => Math.max(0, s - 1))
          }}
          disabled={step === 0}
          className="rounded-full bg-white px-6 py-3 text-lg font-bold text-slate-700 shadow disabled:opacity-40"
        >
          ← Back
        </button>
        {!done ? (
          <button
            type="button"
            onClick={next}
            className="rounded-full bg-sky-500 px-8 py-3 text-lg font-bold text-white shadow hover:bg-sky-600"
          >
            {step + 1 >= total ? 'Finish!' : 'Next step →'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              sound.click()
              setStep(0)
            }}
            className="rounded-full bg-sky-500 px-8 py-3 text-lg font-bold text-white shadow hover:bg-sky-600"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  )
}
