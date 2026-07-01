type Props = {
  title?: string
  lines: string[]
  starCount?: number
  best?: string
  onPlayAgain: () => void
  onHome: () => void
}

export default function ResultScreen({
  title = 'Great job!',
  lines,
  starCount,
  best,
  onPlayAgain,
  onHome,
}: Props) {
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
