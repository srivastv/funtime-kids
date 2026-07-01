const LETTERS = ['A', 'B', 'C', 'D']

type Props = {
  votes: number[]
  onClose: () => void
}

export default function AudienceChart({ votes, onClose }: Props) {
  return (
    <div className="mt-4 rounded-2xl bg-indigo-900 p-4 text-white">
      <p className="mb-2 text-center text-sm font-bold text-amber-300">
        👥 The audience voted…
      </p>
      <div className="flex h-36 items-end justify-center gap-6">
        {votes.map((v, i) => (
          <div key={i} className="flex h-full flex-col items-center justify-end">
            <span className="mb-1 text-xs font-bold">{v}%</span>
            <div
              className="w-8 rounded-t bg-amber-400"
              style={{ height: `${v}%` }}
            />
            <span className="mt-1 font-extrabold text-amber-300">{LETTERS[i]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-amber-400 px-6 py-2 text-sm font-bold text-indigo-950"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
