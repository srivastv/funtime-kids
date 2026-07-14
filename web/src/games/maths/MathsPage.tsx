import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sound } from '../../lib/sound'
import PizzaParty from './PizzaParty'
import PotionMixer from './PotionMixer'
import TimeBomb from './TimeBomb'

type View = 'pizza' | 'potion' | 'time'

const STATIONS: { id: View; name: string; icon: string; desc: string }[] = [
  { id: 'pizza', name: 'Pizza Party', icon: '🍕', desc: 'Fractions — slice and share!' },
  { id: 'potion', name: 'Potion Mixer', icon: '🧪', desc: 'Fill to a fraction or percent' },
  { id: 'time', name: 'Time Bomb', icon: '⏰', desc: 'Set the clock hands to defuse' },
]

export default function MathsPage() {
  const [view, setView] = useState<View | null>(null)
  const navigate = useNavigate()
  const home = () => navigate('/')
  const toHub = () => setView(null)

  if (view === 'pizza') return <PizzaParty onExit={toHub} onHome={home} />
  if (view === 'potion') return <PotionMixer onExit={toHub} onHome={home} />
  if (view === 'time') return <TimeBomb onExit={toHub} onHome={home} />

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-center text-3xl font-extrabold text-rose-600">Maths Lab 🔢</h1>
      <p className="mb-8 text-center text-slate-600">Fun Year 3 maths — pick a game!</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {STATIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { sound.click(); setView(s.id) }}
            className="rounded-3xl bg-white p-8 text-center shadow-lg transition hover:scale-105 hover:shadow-xl"
          >
            <div className="text-6xl">{s.icon}</div>
            <div className="mt-3 text-xl font-bold text-slate-700">{s.name}</div>
            <div className="mt-1 text-sm text-slate-500">{s.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
