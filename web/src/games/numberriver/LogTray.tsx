import type { NumberRiverOp } from '../../content/types'
import { sound } from '../../lib/sound'

type Props = {
  available: NumberRiverOp[]
  placedIds: Set<number>
  selectedTrayIndex: number | null
  onPickTray: (idx:number)=>void
  disabled?: boolean
}

export default function LogTray({available, placedIds, selectedTrayIndex, onPickTray, disabled}:Props){
  return <div>
    <div className="text-center text-sm font-bold text-amber-800 mb-2">Log Tray — tap a log then tap a bridge slot</div>
    <div className="flex flex-wrap gap-3 justify-center p-3 bg-amber-50 rounded-2xl border-2 border-amber-200 min-h-[80px]">
      {available.map((op, idx)=>{
        const isPlaced = placedIds.has(idx)
        const isSelected = selectedTrayIndex===idx
        return <button key={idx} disabled={disabled||isPlaced} onClick={()=>{sound.tick(); onPickTray(idx)}}
          className={`relative w-20 h-14 rounded-xl font-black text-xl shadow-lg border-3 transition-all
            ${isPlaced ? 'opacity-30 bg-slate-200 border-slate-300 scale-90' : ''}
            ${!isPlaced && isSelected ? 'bg-amber-300 border-amber-600 scale-110 rotate-2 shadow-xl' : ''}
            ${!isPlaced && !isSelected ? 'bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50 border-amber-950 hover:scale-105 cursor-pointer' : ''}
          `}>
          <div className="absolute inset-1 rounded-lg border border-amber-400/30 pointer-events-none"/>
          {op.display}
        </button>
      })}
    </div>
  </div>
}
