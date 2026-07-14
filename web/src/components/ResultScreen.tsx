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
    <div className="mx-auto max-w-md p-8 text-center">
      <div className="text-6xl">🎉</div>
      <h2 className="mt-4 text-3xl font-extrabold text-sky-700">{title}</h2>

      {typeof starCount === 'number' && (
        <div className="mt-4 text-4xl" aria-label={`${starCount} out of 3 stars`}>
          {'⭐'.repeat(starCount)}
          <span className="opacity-25">{'⭐'.repeat(Math.max(0, 3 - starCount))}</span>
        </div>
      )}

      <div className="mt-4 space-y-1 text-xl font-semibold text-slate-700">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>

      {best && <p className="mt-2 text-slate-500">{best}</p>}

      {earned && (earned.coins > 0 || earned.stickers.length > 0 || earned.achievements.length > 0) && (
        <div className="mt-5 rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
          <div className="text-xl font-extrabold text-amber-700">+🪙 {earned.coins} coins!</div>
          {earned.stickers.length > 0 && (
            <div className="mt-2 text-sm font-bold text-amber-900">New sticker! {earned.stickers.map((s) => s.emoji).join(' ')}</div>
          )}
          {earned.achievements.map((a) => (
            <div key={a.id} className="mt-1 text-sm font-bold text-green-700">🏆 {a.emoji} {a.name} unlocked!</div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-full bg-sky-500 px-8 py-3 text-lg font-bold text-white shadow hover:bg-sky-600"
        >
          Play again
        </button>
        <button
          type="button"
          onClick={onHome}
          className="rounded-full bg-white px-8 py-3 text-lg font-bold text-sky-600 shadow hover:bg-sky-50"
        >
          Home
        </button>
      </div>
    </div>
  )
}
