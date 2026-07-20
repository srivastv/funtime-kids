import { useContent } from '../../lib/useContent'
import { staticProvider } from '../../content/staticProvider'
import { sound } from '../../lib/sound'
import type { TypingLesson } from '../../content/types'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'

export type TypingMode = 'practice' | 'race'

type Props = {
  onPick: (lesson: TypingLesson) => void
  bestFor?: (lessonId: string) => number
  mode: TypingMode
  onModeChange: (mode: TypingMode) => void
}

const difficulties = [
  { level: 1, label: 'Easy', icon: '🌱', desc: 'Short words, no punctuation. Perfect to start!' },
  { level: 2, label: 'Medium', icon: '🌿', desc: 'Capitals, commas, question marks and numbers.' },
  { level: 3, label: 'Hard', icon: '🌳', desc: 'Quotes, brackets, long sentences and tricky spellings.' },
] as const

export default function LessonSelect({ onPick, bestFor, mode, onModeChange }: Props) {
  const { data, loading, error } = useContent(
    () => staticProvider.getTypingLessons(),
    [],
  )

  if (loading) return <Loading />
  if (error || !data) return <ErrorScreen />

  function pickRandom(level: 1 | 2 | 3) {
    const pool = data!.filter((l) => l.difficulty === level)
    if (pool.length === 0) return
    const choice = pool[Math.floor(Math.random() * pool.length)]
    sound.click()
    onPick(choice)
  }

  function bestForLevel(level: number): number {
    if (!bestFor || !data) return 0
    let max = 0
    for (const l of data) {
      if (l.difficulty === level) {
        const b = bestFor(l.id) ?? 0
        if (b > max) max = b
      }
    }
    return max
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-center text-3xl font-extrabold text-sky-700">
        Pick a difficulty!
      </h1>

      <div className="mb-2 flex justify-center gap-2">
        {([
          { id: 'practice', label: '⌨️ Practice' },
          { id: 'race', label: '🚀 Race Robo' },
        ] as const).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              sound.click()
              onModeChange(m.id)
            }}
            className={`rounded-full px-5 py-2 font-bold shadow transition ${
              mode === m.id ? 'bg-sky-500 text-white' : 'bg-white text-sky-700 hover:bg-sky-50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mb-8 text-center text-sm text-slate-500">
        {mode === 'race' ? 'Beat the robot to the finish line!' : 'Copy the text — build speed and accuracy.'}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {difficulties.map((d) => {
          const best = bestForLevel(d.level)
          return (
            <button
              key={d.level}
              type="button"
              onClick={() => pickRandom(d.level as 1 | 2 | 3)}
              className="rounded-3xl bg-white p-8 text-center shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              <div className="text-6xl">{d.icon}</div>
              <div className="mt-3 text-2xl font-extrabold text-slate-700">{d.label}</div>
              <div className="mt-1 text-sm text-slate-500">{d.desc}</div>
              {best > 0 && (
                <div className="mt-2 text-xs font-bold text-sky-600">Best: {best} WPM</div>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">
        We will pick a random lesson from that level each time — keep practising!
      </p>
    </div>
  )
}
