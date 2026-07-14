import { sound } from '../../lib/sound'

export type LabView = 'quiz' | 'sound' | 'circuit' | 'plant'

const STATIONS: { id: LabView; name: string; icon: string; desc: string }[] = [
  { id: 'quiz', name: 'Science Quiz', icon: '🧠', desc: 'Predict then test — questions from every topic' },
  { id: 'sound', name: 'Sound & Pitch Lab', icon: '🔊', desc: 'Play the xylophone and copy the tune' },
  { id: 'circuit', name: 'Circuit Builder', icon: '⚡', desc: 'Wire up a battery and bulb to make it light' },
  { id: 'plant', name: 'Plant Grower', icon: '🌱', desc: 'Give water and light — grow a flower!' },
]

type Props = { onPick: (view: LabView) => void }

export default function LabHub({ onPick }: Props) {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-center text-3xl font-extrabold text-amber-700">Professor Odd's Lab 🧪</h1>
      <p className="mb-8 text-center text-slate-600">Pick a station to explore!</p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {STATIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              sound.click()
              onPick(s.id)
            }}
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
