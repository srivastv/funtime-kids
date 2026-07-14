import { sound } from '../../lib/sound'
import { DIFFICULTIES, bestKey } from './engine'
import { loadBest } from '../../lib/storage'

type Props = { onPick:(d:1|2|3)=>void }

export default function DifficultySelect({onPick}:Props){
  return <div className="mx-auto max-w-4xl p-8 text-center">
    <div className="text-7xl mb-3">🦫🌉</div>
    <h1 className="text-3xl font-extrabold text-sky-700 mb-2">Number River</h1>
    <p className="text-slate-600 mb-8">Build a bridge of maths logs to help Benny cross! Drag logs, watch total update live, then test.</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
      {DIFFICULTIES.map(d=>{
        const best=loadBest(bestKey(d.level))
        return <button key={d.level} onClick={()=>{sound.click(); onPick(d.level)}} className="rounded-3xl bg-white p-8 shadow-lg hover:scale-105 hover:shadow-xl transition text-left">
          <div className="text-5xl mb-2">🌉</div>
          <div className="text-xl font-extrabold text-slate-800">{d.name} <span className="text-amber-500">{'⭐'.repeat(d.level)}</span></div>
          <div className="text-sm text-slate-500 mt-1">{d.desc}</div>
          {best>0 && <div className="mt-2 text-sm font-bold text-sky-600">Best: {best} / 8</div>}
        </button>
      })}
    </div>
  </div>
}
