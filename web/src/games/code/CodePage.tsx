import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sound } from '../../lib/sound'
import RobotGame from './RobotGame'
import { ROUTE_LEVELS, DEBUG_LEVELS } from './levels'

type View = 'route' | 'debug'

const STATIONS: { id: View; name: string; icon: string; desc: string }[] = [
  { id: 'route', name: 'Robot Route', icon: '🤖', desc: 'Program the robot to reach the cheese' },
  { id: 'debug', name: 'Debug It!', icon: '🐞', desc: 'Fix the broken program' },
]

export default function CodePage() {
  const [view, setView] = useState<View | null>(null)
  const navigate = useNavigate()
  const home = () => navigate('/')
  const toHub = () => setView(null)

  if (view === 'route') return <RobotGame levels={ROUTE_LEVELS} title="Robot Route" icon="🤖" storageKey="code:route" onExit={toHub} onHome={home} />
  if (view === 'debug') return <RobotGame levels={DEBUG_LEVELS} title="Debug It!" icon="🐞" storageKey="code:debug" debug onExit={toHub} onHome={home} />

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-center text-3xl font-extrabold text-indigo-700">Code Lab 🤖</h1>
      <p className="mb-8 text-center text-slate-600">Learn to think like a coder — pick a challenge!</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
