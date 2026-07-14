import { sound } from '../../lib/sound'
import { MODES, DIFFICULTIES, bestKey } from './engine'
import type { GeoMode } from '../../content/types'
import { loadBest } from '../../lib/storage'
import { useState } from 'react'

type Props = {
  onPick: (mode: GeoMode, difficulty: 1 | 2 | 3) => void
}

export default function ModeSelect({ onPick }: Props) {
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1)

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-center text-3xl font-extrabold text-sky-700">World Hop 🗺️</h1>
      <p className="mb-6 text-center text-slate-600">Pick a mode, then choose difficulty</p>

      <div className="mb-6 flex justify-center gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.level}
            type="button"
            onClick={() => {
              sound.click()
              setDifficulty(d.level)
            }}
            className={`rounded-full px-5 py-2 font-bold shadow ${
              difficulty === d.level
                ? 'bg-sky-500 text-white'
                : 'bg-white text-sky-700 hover:bg-sky-50'
            }`}
          >
            {d.name}
            <span className="ml-1 text-xs opacity-70">{'⭐'.repeat(d.level)}</span>
          </button>
        ))}
      </div>
      <p className="mb-8 text-center text-sm text-slate-500">{DIFFICULTIES.find((d) => d.level === difficulty)?.desc}</p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((m) => {
          const best = loadBest(bestKey(m.id, difficulty))
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                sound.click()
                onPick(m.id, difficulty)
              }}
              className="rounded-3xl bg-white p-8 text-center shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              <div className="text-6xl">{m.icon}</div>
              <div className="mt-3 text-xl font-bold text-slate-700">{m.name}</div>
              <div className="mt-1 text-sm text-slate-500">{m.desc}</div>
              {best > 0 && (
                <div className="mt-2 text-sm font-semibold text-sky-600">
                  Best: {best} / 10
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
