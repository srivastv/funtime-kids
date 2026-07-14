import { useState } from 'react'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import ResultScreen from '../../components/ResultScreen'
import { growDay, initialPlant, IDEAL, STAGES, type PlantState } from './plant'

const BEST_KEY = 'odd:plant'
const STAGE_NAMES = ['Seed', 'Sprout', 'Leafy', 'Bud', 'Flower']

// A 0..10 meter with the "healthy zone" shaded green.
function Meter({ value, min, max, color }: { value: number; min: number; max: number; color: string }) {
  return (
    <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="absolute inset-y-0 bg-green-200" style={{ left: `${min * 10}%`, width: `${(max - min) * 10}%` }} />
      <div className="absolute inset-y-0 left-0 rounded-full opacity-80" style={{ width: `${value * 10}%`, background: color }} />
    </div>
  )
}

type Props = { onExit: () => void; onHome: () => void }

export default function PlantGrower({ onExit, onHome }: Props) {
  const [plant, setPlant] = useState<PlantState>(initialPlant)
  const [light, setLight] = useState(5)

  function water() {
    if (plant.status !== 'growing') return
    sound.drip()
    setPlant((p) => ({ ...p, moisture: Math.min(10, p.moisture + 4) }))
  }

  function nextDay() {
    if (plant.status !== 'growing') return
    sound.whoosh()
    setPlant((p) => growDay(p, p.moisture, light))
  }

  function reset() {
    setPlant(initialPlant())
    setLight(5)
  }

  if (plant.status === 'won') {
    const best = loadBest(BEST_KEY)
    const stars = plant.health >= 80 ? 3 : plant.health >= 50 ? 2 : 1
    const isNew = plant.health > best
    if (isNew) saveBest(BEST_KEY, plant.health)
    return (
      <ResultScreen
        title="It bloomed! 🌸"
        lines={[`Grown in ${plant.day} days`, `Health: ${plant.health}%`]}
        starCount={stars}
        reward={{ gameId: 'odd', stars, isNewBest: isNew }}
        best={isNew ? `New best health: ${plant.health}%` : best > 0 ? `Best health: ${best}%` : undefined}
        onPlayAgain={reset}
        onHome={onHome}
      />
    )
  }
  if (plant.status === 'dead') {
    return (
      <ResultScreen
        title="Oh no, it wilted 🥀"
        lines={[`It reached the ${STAGE_NAMES[plant.stage]} stage`, 'Try to keep water and sun in the green zones!']}
        starCount={0}
        reward={{ gameId: 'odd', stars: 0, isNewBest: false }}
        onPlayAgain={reset}
        onHome={onHome}
      />
    )
  }

  const wilting = plant.health < 35
  return (
    <div className="mx-auto max-w-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => { sound.click(); onExit() }} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-600 shadow">← Lab</button>
        <h1 className="text-2xl font-extrabold text-amber-700">🌱 Plant Grower</h1>
        <span className="text-sm font-bold text-slate-500">Day {plant.day}</span>
      </div>

      {/* Plant */}
      <div className="relative flex flex-col items-center rounded-3xl bg-gradient-to-b from-sky-100 to-green-50 p-6 shadow-inner">
        <div className="text-sm font-bold text-slate-500">{STAGE_NAMES[plant.stage]}</div>
        <div className={`my-2 text-7xl transition-all ${wilting ? 'opacity-50 grayscale rotate-6' : ''}`}>{STAGES[plant.stage]}</div>
        <div className="text-4xl">🪴</div>
      </div>

      {/* Meters */}
      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm font-bold text-slate-600"><span>❤️ Health</span><span>{plant.health}%</span></div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full ${plant.health >= 50 ? 'bg-green-500' : plant.health >= 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${plant.health}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm font-bold text-slate-600"><span>💧 Water</span><span>{plant.moisture}/10</span></div>
          <Meter value={plant.moisture} min={IDEAL.moistureMin} max={IDEAL.moistureMax} color="#3b82f6" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm font-bold text-slate-600"><span>☀️ Sun (today)</span><span>{light}/10</span></div>
          <Meter value={light} min={IDEAL.lightMin} max={IDEAL.lightMax} color="#f59e0b" />
          <input type="range" min={0} max={10} value={light} onChange={(e) => { setLight(Number(e.target.value)); sound.tick() }} className="mt-1 w-full accent-amber-500" />
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-slate-500">Keep <b>water</b> and <b>sun</b> inside the green zones, then move to the next day. Water dries out each day!</p>

      <div className="mt-4 flex justify-center gap-3">
        <button onClick={water} className="rounded-full bg-blue-500 px-6 py-3 font-extrabold text-white shadow-lg hover:bg-blue-600">💧 Water</button>
        <button onClick={nextDay} className="rounded-full bg-green-600 px-8 py-3 font-extrabold text-white shadow-lg hover:bg-green-700">Next Day ▶</button>
      </div>
    </div>
  )
}
