import { useState, useEffect } from 'react'
import type { OddExperiment } from '../../content/types'
import type { OddAnswer } from './engine'
import { sound } from '../../lib/sound'

type Feedback = { correct: boolean } | null

type Props = {
  experiment: OddExperiment
  disabled?: boolean
  onAnswer: (answer: OddAnswer)=>void
  feedback: Feedback
}

export default function ExperimentRenderer({ experiment, disabled, onAnswer, feedback }: Props) {
  const cfg = experiment.config
  switch(experiment.type) {
    case 'predict-choice':
      return <PredictChoice options={cfg.options||[]} disabled={!!disabled||!!feedback} onPick={(i)=>onAnswer(i)} feedback={feedback} correctIndex={cfg.correctIndex ?? 0} />
    case 'slider-predict':
      return <SliderPredict min={cfg.min??0} max={cfg.max??100} unit={cfg.unit} correct={cfg.correctValue} tolerance={cfg.tolerance??0} disabled={!!disabled||!!feedback} onSubmit={(v)=>onAnswer(v)} feedback={feedback} />
    case 'drag-sort':
      return <DragSort categories={cfg.categories||[]} items={cfg.items||[]} disabled={!!disabled||!!feedback} onSubmit={(map)=>onAnswer(map)} feedback={feedback} />
    default:
      return <div className="text-slate-500">Unknown experiment type</div>
  }
}

function PredictChoice({options, disabled, onPick, feedback, correctIndex}:{options:string[], disabled:boolean, onPick:(i:number)=>void, feedback:Feedback, correctIndex:number}) {
  const [chosen, setChosen] = useState<number|null>(null)
  const show = !!feedback
  function handle(i:number){ setChosen(i); sound.click(); onPick(i) }
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((opt,i)=>{
        const isCorrect = show && i===correctIndex
        const isWrongChosen = show && chosen===i && !isCorrect
        let cls='rounded-2xl px-5 py-4 text-lg font-bold shadow-lg transition-all text-left border-2 relative overflow-hidden '
        if(!show) cls+='bg-sky-50 hover:bg-sky-100 hover:scale-[1.02] text-sky-900 border-sky-200 cursor-pointer'
        else if(isCorrect) cls+='bg-green-500 text-white border-green-600 scale-105 animate-pulse'
        else if(isWrongChosen) cls+='bg-red-400 text-white border-red-600 animate-bounce'
        else cls+='bg-slate-100 text-slate-400 border-slate-200 opacity-60'
        return <button key={i} disabled={disabled} onClick={()=>handle(i)} className={cls}>
          <span className="relative z-10">{opt}</span>
          {show && isCorrect && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1s_ease-in-out]" style={{animation:'shimmer 1s'}} />}
        </button>
      })}
    </div>
    {show && (
      <div className={`rounded-xl p-3 text-center font-bold ${feedback.correct ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
        {feedback.correct ? "🎉 Great prediction! Watch what happens..." : "🤔 Let's see what really happens..."}
        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-400 to-amber-400 animate-[grow_2s_ease-out] w-full" style={{animation:'grow 2s forwards'}}/>
        </div>
      </div>
    )}
    <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}} @keyframes grow{0%{width:0%}100%{width:100%}}`}</style>
  </div>
}

function SliderPredict({min,max,unit,disabled,onSubmit, feedback, correct, tolerance}:{min:number,max:number,unit?:string,disabled:boolean,onSubmit:(v:number)=>void, feedback:Feedback, correct?:number, tolerance?:number}) {
  const [val,setVal]=useState(Math.round((min+max)/2))
  const [animVal,setAnimVal]=useState<number|null>(null)
  useEffect(()=>{ if(feedback && correct!==undefined){ setAnimVal(val); const start=Date.now(); const duration=1500; const startVal=val; const endVal=correct; const tick=()=>{ const p=Math.min(1,(Date.now()-start)/duration); const eased=1-Math.pow(1-p,3); setAnimVal(Math.round(startVal+(endVal-startVal)*eased)); if(p<1) requestAnimationFrame(tick)}; requestAnimationFrame(tick); if(Math.abs(val-correct!)<= (tolerance||0)) sound.correct(); else sound.wrong(); } },[feedback])
  const display = animVal ?? val
  const pct = ((display-min)/(max-min))*100
  const isClose = feedback && correct!==undefined && Math.abs(display-correct)<= (tolerance||0)
  return <div className="space-y-4">
    <div className="relative h-16 bg-gradient-to-r from-blue-100 via-amber-100 to-red-100 rounded-2xl border-2 border-slate-300 overflow-hidden">
      <div className="absolute top-0 bottom-0 w-1 bg-slate-400 opacity-30" style={{left:'25%'}}/>
      <div className="absolute top-0 bottom-0 w-1 bg-slate-400 opacity-30" style={{left:'50%'}}/>
      <div className="absolute top-0 bottom-0 w-1 bg-slate-400 opacity-30" style={{left:'75%'}}/>
      <div className="absolute top-2 bottom-2 bg-gradient-to-r from-sky-500 to-amber-500 rounded-r-full transition-all duration-300 shadow-md" style={{width:`${pct}%`}}/>
      <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-300" style={{left:`calc(${pct}% - 16px)`}}>
        <div className="w-8 h-8 rounded-full bg-white border-4 border-amber-600 shadow-lg flex items-center justify-center text-xs font-black">🌡️</div>
      </div>
      {feedback && correct!==undefined && (
        <div className="absolute top-0 bottom-0 w-1 bg-green-600 opacity-70" style={{left:`${((correct-min)/(max-min))*100}%`}}>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] bg-green-600 text-white px1 rounded font-bold">actual</div>
        </div>
      )}
    </div>
    <input type="range" min={min} max={max} value={val} disabled={disabled||!!feedback}
      onChange={e=>{setVal(Number(e.target.value)); sound.tick()}}
      className="w-full accent-amber-500 h-3 cursor-pointer"/>
    <div className={`text-center text-4xl font-black transition-colors ${feedback ? (isClose?'text-green-600':'text-amber-600') : 'text-amber-700'}`}>{display} {unit}</div>
    {!feedback && <button disabled={disabled} onClick={()=>{sound.click(); onSubmit(val)}} className="w-full rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-extrabold py-3 text-lg shadow-lg hover:scale-[1.02] transition">Predict then Test!</button>}
    {feedback && <div className={`text-center font-bold p-3 rounded-xl ${isClose?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}`}>{isClose ? '✅ Spot on prediction!' : `Close! Actual was ${correct} ${unit}`}</div>}
    <p className="text-center text-sm text-slate-500">Slide to predict, then watch the experiment run</p>
  </div>
}

function DragSort({categories, items, disabled, onSubmit, feedback}:{categories:string[], items:{label:string,category:string,emoji?:string}[], disabled:boolean, onSubmit:(map:Record<string,string>)=>void, feedback:Feedback}) {
  const [assign,setAssign]=useState<Record<string,string>>({})
  const [selected,setSelected]=useState<string|null>(null)
  const [shake,setShake]=useState<string|null>(null)
  function pickCategory(cat:string){
    if(!selected||disabled) return
    const item = items.find(i=>i.label===selected)
    const correct = item?.category === cat
    if(correct){
      sound.magnetSnap()
      setAssign(a=>({...a,[selected]:cat}))
      setSelected(null)
    } else {
      sound.boing()
      setShake(cat)
      setTimeout(()=>setShake(null),400)
    }
  }
  const allAssigned = items.every(it=>assign[it.label])
  const show = !!feedback
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
      {items.filter(it=>!assign[it.label]).map(it=>(
        <button key={it.label} disabled={disabled} onClick={()=>setSelected(it.label)}
          className={`rounded-2xl px-4 py-2.5 font-bold shadow-lg border-2 transition-all ${selected===it.label?'bg-amber-300 border-amber-600 scale-110 rotate-2 shadow-xl':'bg-white border-slate-300 hover:bg-sky-50 hover:scale-105'} ${disabled?'opacity-40':''}`}>
          <span className="text-xl">{it.emoji||'🔹'}</span> <span className="ml-1">{it.label}</span>
        </button>
      ))}
      {items.filter(it=>!assign[it.label]).length===0 && <div className="text-slate-400 italic py-2">All placed! Ready to test.</div>}
    </div>
    <p className="text-center text-sm text-slate-500 font-semibold">Tap item → tap bucket to sort. Wrong bucket shakes!</p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {categories.map(c=>{
        const count = Object.values(assign).filter(v=>v===c).length
        const isShaking = shake===c
        return (
          <button key={c} disabled={disabled} onClick={()=>pickCategory(c)}
            className={`rounded-2xl border-3 p-3 min-h-[100px] flex flex-col items-center justify-center font-bold shadow-md transition-all ${isShaking?'animate-bounce bg-red-100 border-red-400':'bg-sky-50 hover:bg-sky-100 border-sky-300 hover:scale-[1.03]'} ${disabled?'opacity-70':''}`}>
            <div className="text-2xl mb-1">🪣</div>
            <div className="text-[11px] leading-tight text-center text-sky-900">{c}</div>
            <div className="mt-1 text-[10px] bg-white px-2 py-0.5 rounded-full shadow-sm">{count} items</div>
            {show && <div className="mt-1 text-[10px] text-green-700">✓</div>}
          </button>
        )
      })}
    </div>
    <button disabled={disabled || !allAssigned} onClick={()=>{sound.click(); onSubmit(assign)}} className="w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-30 text-white font-extrabold py-3.5 shadow-lg text-lg transition hover:scale-[1.01]">🧪 Test Prediction!</button>
  </div>
}
