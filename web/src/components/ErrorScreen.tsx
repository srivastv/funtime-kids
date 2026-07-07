type Props = { onRetry?: () => void }

export default function ErrorScreen({ onRetry }: Props) {
  return (
    <div className="p-12 text-center">
      <div className="text-6xl">😴</div>
      <p className="mt-4 text-2xl font-bold text-slate-700">
        Oops! This game is taking a nap.
      </p>
      <p className="mt-1 text-slate-500">Please try again.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-full bg-sky-500 px-8 py-3 text-lg font-bold text-white shadow hover:bg-sky-600"
        >
          Try again
        </button>
      )}
    </div>
  )
}
