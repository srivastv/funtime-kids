import { useContent } from '../../lib/useContent'
import { staticProvider } from '../../content/staticProvider'
import { sound } from '../../lib/sound'
import { formatMoney } from './millionaire'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'

type Props = {
  onPick: (categoryId: string) => void
  bestFor?: (categoryId: string) => number
}

export default function CategorySelect({ onPick, bestFor }: Props) {
  const { data, loading, error } = useContent(
    () => staticProvider.getQuizCategories(),
    [],
  )

  if (loading) return <Loading />
  if (error || !data) return <ErrorScreen />

  return (
    <div className="mx-auto max-w-3xl p-8" style={{ color: 'var(--text-body)' }}>
      <h1 className="mb-8 text-center text-3xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
        Pick a category!
      </h1>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {data.map((c) => {
          const best = bestFor?.(c.id) ?? 0
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                sound.click()
                onPick(c.id)
              }}
              className="p-6 text-center shadow-lg transition hover:scale-105 hover:shadow-xl border-2"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderRadius: 'var(--radius)' }}
            >
              <div className="text-5xl">{c.icon}</div>
              <div className="mt-3 text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{c.name}</div>
              {best > 0 && (
                <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Best: {formatMoney(best)}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
