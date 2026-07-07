export type LifelineState = {
  fifty: boolean
  audience: boolean
  swap: boolean
}

type Props = {
  used: LifelineState
  disabled: boolean
  onFifty: () => void
  onAudience: () => void
  onSwap: () => void
}

export default function Lifelines({
  used,
  disabled,
  onFifty,
  onAudience,
  onSwap,
}: Props) {
  const items = [
    { key: 'fifty', label: '50:50', icon: '50 : 50', done: used.fifty, on: onFifty },
    { key: 'audience', label: 'Ask Audience', icon: '👥', done: used.audience, on: onAudience },
    { key: 'swap', label: 'Swap', icon: '🔄', done: used.swap, on: onSwap },
  ]
  return (
    <div className="flex justify-center gap-3">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          disabled={it.done || disabled}
          onClick={it.on}
          title={it.label}
          className={`flex h-14 min-w-14 items-center justify-center rounded-full border-2 px-3 text-sm font-extrabold transition ${
            it.done
              ? 'border-slate-500 text-slate-500 line-through opacity-50'
              : 'border-amber-400 bg-indigo-900 text-amber-300 hover:bg-indigo-800 disabled:opacity-40'
          }`}
        >
          {it.icon}
        </button>
      ))}
    </div>
  )
}
