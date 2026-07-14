import Beaver from './Beaver'
import type { NumberRiverOp } from '../../content/types'

type Props = {
  target:number
  startValue?:number
  slots:number
  bridgeOps:(NumberRiverOp|null)[]
  selectedSlot:number|null
  onSlotClick:(idx:number)=>void
  runningTotal:number
  beaverState:'idle'|'walking'|'dance'|'splash'|'swim'
  beaverProgress:number
  feedback:null|{correct:boolean}
}

export default function RiverScene({target,startValue=0,slots,bridgeOps,selectedSlot,onSlotClick,runningTotal,beaverState,beaverProgress,feedback}:Props){
  const isClose = Math.abs(runningTotal-target) <=5 && runningTotal!==target
  const isExact = runningTotal===target && runningTotal!==startValue
  return <div className="relative rounded-3xl overflow-hidden border-4 border-sky-300 shadow-inner bg-gradient-to-b from-sky-200 via-cyan-100 to-blue-200">
    {/* sky top bar with target */}
    <div className="relative h-20 bg-gradient-to-b from-sky-300 to-sky-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-800 border-3 border-amber-950 flex items-center justify-center text-white font-black text-xl shadow-lg">0</div>
        <div className="text-slate-600 font-bold">Start</div>
      </div>
      <div className={`transition-all duration-300 px-5 py-2 rounded-2xl font-black text-2xl shadow-lg border-3
        ${isExact ? 'bg-green-500 text-white border-green-700 scale-110 animate-pulse' : isClose ? 'bg-amber-400 text-amber-950 border-amber-600' : 'bg-white text-sky-800 border-sky-300'}`}>
        {runningTotal}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-slate-600 font-bold text-right">Target<br/>Berries</div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 border-3 border-red-900 flex flex-col items-center justify-center text-white shadow-lg">
          <div className="text-[10px] opacity-80">🎯</div>
          <div className="font-black text-xl leading-none">{target}</div>
        </div>
      </div>
    </div>

    {/* river with waves animation */}
    <div className="relative h-32 bg-gradient-to-b from-cyan-300 to-blue-400 overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{background:'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 40px)', animation:'riverFlow 3s linear infinite'}}/>
      <div className="absolute inset-0 opacity-20" style={{background:'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.2) 30px, rgba(255,255,255,0.2) 60px)', animation:'riverFlow 2s linear infinite reverse'}}/>
      {/* bridge slots */}
      <div className="absolute bottom-4 left-[12%] right-[12%] flex justify-between items-end">
        {Array.from({length:slots}).map((_,i)=>{
          const op = bridgeOps[i]
          const isSel = selectedSlot===i
          return <button key={i} type="button" onClick={()=>onSlotClick(i)}
            className={`relative w-[18%] h-16 rounded-xl border-3 transition-all flex items-center justify-center font-black text-2xl shadow-lg
              ${op ? 'bg-gradient-to-b from-amber-600 to-amber-800 text-amber-50 border-amber-950 scale-100' : 'bg-white/40 border-dashed border-white/70 hover:bg-white/60'}
              ${isSel ? 'ring-4 ring-amber-300 scale-105' : ''} ${feedback ? 'pointer-events-none':''}`}>
            {op ? op.display : <span className="text-white/70 text-3xl">+</span>}
            {op && <div className="absolute -bottom-1 left-1 right-1 h-2 bg-amber-950 rounded-b-lg opacity-60"/>}
          </button>
        })}
      </div>
      {/* beaver positioned above bridge proportional to progress */}
      <div className="absolute bottom-[72px] transition-all duration-300 ease-linear" style={{left:`calc(12% + ${beaverProgress * 76}% )`, transform:'translateX(-50%)'}}>
        <Beaver state={beaverState} progress={beaverProgress}/>
      </div>
      <style>{`@keyframes riverFlow{0%{transform:translateX(0)}100%{transform:translateX(40px)}}`}</style>
    </div>

    {/* river bank bottom */}
    <div className="h-10 bg-gradient-to-b from-amber-200 to-amber-300 border-t-4 border-amber-400 flex items-center justify-center text-[11px] font-bold text-amber-900 tracking-wide">
      🌿 RIVER BANK — drag logs to build bridge → press GO 🐾
    </div>
  </div>
}
