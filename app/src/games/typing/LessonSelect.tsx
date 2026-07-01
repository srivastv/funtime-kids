import { useContent } from '../../lib/useContent'
import { staticProvider } from '../../content/staticProvider'
import type { TypingLesson } from '../../content/types'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'

type Props = {
  onPick: (lesson: TypingLesson) => void
  bestFor?: (lessonId: string) => number
}

const difficultyLabel = ['', 'Easy', 'Medium', 'Hard']

export default function LessonSelect({ onPick, bestFor }: Props) {
  const { data, loading, error } = useContent(
    () => staticProvider.getTypingLessons(),
    [],
  )

  if (loading) return <Loading />
  if (error || !data) return <ErrorScreen />

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-center text-3xl font-extrabold text-sky-700">
        Pick a lesson!
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.map((lesson) => {
          const best = bestFor?.(lesson.id) ?? 0
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onPick(lesson)}
              className="rounded-3xl bg-white p-6 text-left shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              <div className="text-lg font-bold text-slate-700">{lesson.title}</div>
              <div className="mt-1 text-sm text-slate-400">
                {difficultyLabel[lesson.difficulty]}
                {best > 0 && ` · Best: ${best} WPM`}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
