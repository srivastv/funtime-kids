import { useMemo, useState } from 'react'
import type { GeoQuestion } from '../../content/types'
import { shuffle } from '../../lib/shuffle'
import { sound } from '../../lib/sound'

type Props = {
  question: GeoQuestion
  index: number
  total: number
  lives: number
  onAnswer: (choiceIndex: number) => void
  feedback?: { chosen: number; correct: number } | null
}

// Distinct colours so a linked country and its capital share a visible badge colour.
const LINK_COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#a855f7']

/**
 * Capital Match round: connect each country to its capital by tapping a country
 * then a capital. When all four are linked, "Check" reports a single correct/wrong
 * result to the play loop (answerIndex is 0 for these rounds — see the generator).
 */
export default function CapitalMatchCard({ question, index, total, lives, onAnswer, feedback }: Props) {
  const pairs = useMemo(() => question.pairs ?? [], [question.pairs])
  const capitals = useMemo(() => shuffle(pairs.map((p) => p.capital)), [pairs])
  const [links, setLinks] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const checked = !!feedback

  const colorFor = (country: string) => {
    const i = pairs.findIndex((p) => p.country === country)
    return LINK_COLORS[i % LINK_COLORS.length]
  }
  const capitalOwner = (capital: string) =>
    Object.keys(links).find((c) => links[c] === capital) ?? null

  function tapCountry(country: string) {
    if (checked) return
    sound.tick()
    if (links[country]) {
      setLinks((l) => {
        const next = { ...l }
        delete next[country]
        return next
      })
      setSelected(null)
      return
    }
    setSelected((s) => (s === country ? null : country))
  }

  function tapCapital(capital: string) {
    if (checked || !selected) return
    sound.magnetSnap()
    setLinks((l) => {
      const next = { ...l }
      // a capital belongs to one country at a time
      const prevOwner = Object.keys(next).find((c) => next[c] === capital)
      if (prevOwner) delete next[prevOwner]
      next[selected] = capital
      return next
    })
    setSelected(null)
  }

  const allLinked = pairs.length > 0 && pairs.every((p) => links[p.country])

  function check() {
    if (!allLinked || checked) return
    const allCorrect = pairs.every((p) => links[p.country] === p.capital)
    onAnswer(allCorrect ? 0 : -1)
  }

  const isPairCorrect = (country: string) =>
    links[country] === pairs.find((p) => p.country === country)!.capital

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between text-slate-600 font-semibold">
        <span>Round {index + 1} / {total}</span>
        <span>❤️ {'♥'.repeat(lives)}{'♡'.repeat(Math.max(0, 3 - lives))}</span>
      </div>

      <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-xl">
        <p className="text-xl sm:text-2xl font-bold text-sky-800 mb-1 text-center">{question.prompt}</p>
        <p className="text-sm text-slate-500 mb-5 text-center">
          {checked ? 'Green links are correct!' : 'Tap a country, then tap its capital.'}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {/* Countries */}
          <div className="space-y-3">
            {pairs.map((p) => {
              const linked = links[p.country]
              const isSel = selected === p.country
              let ring = isSel ? 'ring-4 ring-amber-300 scale-[1.02]' : ''
              let border = 'border-slate-200'
              if (checked && linked) {
                border = isPairCorrect(p.country) ? 'border-green-400' : 'border-red-400'
              } else if (linked) {
                border = 'border-sky-300'
              }
              return (
                <button
                  key={p.country}
                  type="button"
                  disabled={checked}
                  onClick={() => tapCountry(p.country)}
                  className={`w-full rounded-2xl border-2 ${border} ${ring} bg-sky-50 px-3 py-3 text-left font-bold text-sky-900 shadow-sm transition-all hover:bg-sky-100`}
                >
                  <span className="text-xl mr-1">{p.flagEmoji ?? '🏳️'}</span>
                  {p.country}
                  {linked && (
                    <span
                      className="mt-1 block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      style={{ background: colorFor(p.country) }}
                    >
                      {linked}
                      {checked && (isPairCorrect(p.country) ? ' ✓' : ' ✗')}
                    </span>
                  )}
                  {checked && linked && !isPairCorrect(p.country) && (
                    <span className="mt-1 block text-xs font-semibold text-green-700">
                      → {pairs.find((q) => q.country === p.country)!.capital}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Capitals */}
          <div className="space-y-3">
            {capitals.map((cap) => {
              const owner = capitalOwner(cap)
              const used = !!owner
              return (
                <button
                  key={cap}
                  type="button"
                  disabled={checked || used}
                  onClick={() => tapCapital(cap)}
                  className={`w-full rounded-2xl border-2 px-3 py-3 text-center font-bold shadow-sm transition-all ${
                    used
                      ? 'border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
                  } ${selected && !used ? 'ring-2 ring-amber-300' : ''}`}
                  style={used ? { borderColor: colorFor(owner!) } : undefined}
                >
                  🏛️ {cap}
                </button>
              )
            })}
          </div>
        </div>

        {!checked && (
          <button
            type="button"
            disabled={!allLinked}
            onClick={check}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-lg font-extrabold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-30"
          >
            🔗 Check my matches!
          </button>
        )}
        {checked && (
          <p className={`mt-5 text-center text-lg font-bold ${feedback!.chosen === feedback!.correct ? 'text-green-600' : 'text-amber-600'}`}>
            {feedback!.chosen === feedback!.correct ? '🎉 All matched!' : 'Some were off — see the green capitals.'}
          </p>
        )}
      </div>
    </div>
  )
}
