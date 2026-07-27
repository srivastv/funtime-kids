type Props = { onRetry?: () => void }

export default function ErrorScreen({ onRetry }: Props) {
  return (
    <div className="p-12 text-center" style={{ color: 'var(--text-body)' }}>
      <div className="text-6xl">😴</div>
      <p className="mt-4 text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
        Oops! This game is taking a nap.
      </p>
      <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Please try again.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-full px-8 py-3 text-lg font-bold text-white shadow hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Try again
        </button>
      )}
    </div>
  )
}
