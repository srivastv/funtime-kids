import { LADDER_AMOUNTS, formatMoney, isSafeHaven } from './millionaire'

type Props = { currentIndex: number }

export default function MoneyLadder({ currentIndex }: Props) {
  const rungs = LADDER_AMOUNTS.map((_, i) => i).reverse()
  return (
    <div className="rounded-2xl bg-indigo-950/80 p-3 shadow-inner">
      <ul className="space-y-0.5">
        {rungs.map((i) => {
          const current = i === currentIndex
          const safe = isSafeHaven(i)
          const cls = current
            ? 'bg-amber-400 text-indigo-950'
            : safe
              ? 'text-white'
              : 'text-amber-200/70'
          return (
            <li
              key={i}
              className={`flex items-center gap-3 rounded-lg px-3 py-1 text-sm font-bold ${cls}`}
            >
              <span className="w-5 text-right opacity-60">{i + 1}</span>
              <span className="flex-1 text-right tracking-wide">
                {formatMoney(LADDER_AMOUNTS[i])}
                {safe && <span className="ml-1 opacity-70">◆</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
