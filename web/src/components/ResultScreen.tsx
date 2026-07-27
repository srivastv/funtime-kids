import { useEffect, useRef, useState } from 'react'
import { recordResult, type GameResult, type Earned } from '../lib/rewards'

type Props = {
  title?: string
  lines: string[]
  starCount?: number
  best?: string
  /** When set, awards coins/stickers/achievements once and shows the celebration. */
  reward?: GameResult
  onPlayAgain: () => void
  onHome: () => void
}

export default function ResultScreen({
  title = 'Great job!',
  lines,
  starCount,
  best,
  reward,
  onPlayAgain,
  onHome,
}: Props) {
  const [earned, setEarned] = useState<Earned | null>(null)
  const awarded = useRef(false)
  useEffect(() => {
    if (reward && !awarded.current) {
      awarded.current = true
      setEarned(recordResult(reward))
    }
  }, [reward])

  return (
    <div className="mx-auto max-w-md p-8 text-center" style={{ color: 'var(--text-body)' }}>
      <div className="text-6xl">🎉</div>
      <h2 className="mt-4 text-3xl font-extrabold" style={{ color: 'var(--text-heading)' }}>{title}</h2>

      {typeof starCount === 'number' && (
        <div className="mt-4 text-4xl" aria-label={`${starCount} out of 3 stars`}>
          {'⭐'.repeat(starCount)}
          <span className="opacity-25">{'⭐'.repeat(Math.max(0, 3 - starCount))}</span>
        </div>
      )}

      <div className="mt-4 space-y-1 text-xl font-semibold" style={{ color: 'var(--text-body)' }}>
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>

      {best && <p className="mt-2" style={{ color: 'var(--text-muted)' }}>{best}</p>}

      {earned && (earned.coins > 0 || earned.stickers.length > 0 || earned.achievements.length > 0) && (
        <div className="mt-5 rounded-2xl border-2 p-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--accent)' }}>
          <div className="text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>+🪙 {earned.coins} coins!</div>
          {earned.stickers.length > 0 && (
            <div className="mt-2 text-sm font-bold" style={{ color: 'var(--text-body)' }}>New sticker! {earned.stickers.map((s) => s.emoji).join(' ')}</div>
          )}
          {earned.achievements.map((a) => (
            <div key={a.id} className="mt-1 text-sm font-bold" style={{ color: 'var(--secondary)' }}>🏆 {a.emoji} {a.name} unlocked!</div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-full px-8 py-3 text-lg font-bold text-white shadow hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Play again
        </button>
        <button
          type="button"
          onClick={onHome}
          className="rounded-full px-8 py-3 text-lg font-bold shadow hover:opacity-90"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--primary)', border: '2px solid var(--card-border)' }}
        >
          Home
        </button>
      </div>
    </div>
  )
}
