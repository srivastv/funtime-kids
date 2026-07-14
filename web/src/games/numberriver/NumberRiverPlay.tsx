import { useMemo, useState, useEffect } from 'react'
import type { NumberRiverLevel, NumberRiverOp } from '../../content/types'
import { buildLevelPool, evaluateBridge, scoreStars, bestKey } from './engine'
import RiverScene from './RiverScene'
import LogTray from './LogTray'
import ResultScreen from '../../components/ResultScreen'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'

type Props = { levels: NumberRiverLevel[], difficulty:1|2|3, onExit:()=>void, onHome:()=>void }

export default function NumberRiverPlay({levels, difficulty, onExit, onHome}:Props){
  const pool = useMemo(()=> buildLevelPool(levels, difficulty, 8), [levels,difficulty])
  const [idx,setIdx]=useState(0)
  const [lives,setLives]=useState(3)
  const [correct,setCorrect]=useState(0)
  const [bridge,setBridge]=useState<(NumberRiverOp|null)[]>([])
  const [selectedTray,setSelectedTray]=useState<number|null>(null)
  const [selectedSlot,setSelectedSlot]=useState<number|null>(null)
  const [feedback,setFeedback]=useState<null|{correct:boolean, explanation:string}>(null)
  const [beaver,setBeaver]=useState<'idle'|'walking'|'dance'|'splash'|'swim'>('idle')
  const [beaverProg,setBeaverProg]=useState(0)
  const [finished,setFinished]=useState(false)

  const level = pool[idx]
  const slots = level?.slots ?? 3

  useEffect(()=>{ if(level) setBridge(Array(level.slots).fill(null)) },[level?.id])

  const running = (()=>{ const ops = bridge.filter(Boolean) as NumberRiverOp[]; const r = evaluateBridge(ops, level?.start ?? 0); return r.valid ? r.final : NaN })()

  function handlePickTray(i:number){
    if(feedback) return
    setSelectedTray(i); setSelectedSlot(null); sound.tick()
  }
  function handleSlotClick(s:number){
    if(feedback) return
    if(selectedTray!==null){
      const op = level.availableOps[selectedTray]
      const newBridge=[...bridge]; newBridge[s]=op; setBridge(newBridge); setSelectedTray(null); setSelectedSlot(null); sound.magnetSnap()
      return
    }
    if(bridge[s]){ // pick up to return to tray
      const newBridge=[...bridge]; newBridge[s]=null; setBridge(newBridge); sound.boing()
    } else {
      setSelectedSlot(s)
    }
  }

  function handleGo(){
    if(feedback) return
    const ops = bridge.filter(Boolean) as NumberRiverOp[]
    if(ops.length===0) return
    const res = evaluateBridge(ops, level.start ?? 0)
    const isCorrect = res.valid && res.final === level.target
    // animate beaver walk
    setBeaver('walking')
    sound.whoosh()
    let step=0
    const totalSteps = ops.length
    const interval = setInterval(()=>{
      step++; setBeaverProg(step/totalSteps); sound.pop()
      if(step>=totalSteps){
        clearInterval(interval)
        if(isCorrect){
          setBeaver('dance'); sound.correct(); setCorrect(c=>c+1)
          setFeedback({correct:true, explanation:`${res.intermediates.join(' → ')} = ${res.final} matches target ${level.target}! Great building!`})
        } else {
          setBeaver('splash'); sound.wrong(); setTimeout(()=>{ setBeaver('swim'); sound.boing() },700)
          const reason = !res.valid ? (res.reason==='negative'?'Went below zero — try different order!' : res.reason==='nonIntegerDivision' ? 'Division must come out even — no remainders yet!' : 'Too big!') : `Got ${res.final} but need ${level.target}. Try different order or different logs!`
          setFeedback({correct:false, explanation: reason})
          setLives(l=>l-1)
        }
        setTimeout(()=>{
          setBeaver('idle'); setBeaverProg(0); setFeedback(null)
          const nextLives = isCorrect ? lives : lives-1
          if(nextLives<=0 || idx+1>=pool.length){ setFinished(true) } else { setIdx(i=>i+1) }
        }, 2200)
      }
    }, 400)
  }

  if(!level) return <div className="p-8 text-center">No levels <button onClick={onExit} className="underline text-sky-600">Back</button></div>
  if(finished){
    const stars = scoreStars(correct, pool.length, 0)
    const key = bestKey(difficulty)
    const prev = loadBest(key)
    const isNew = correct > prev
    if(isNew) saveBest(key, correct)
    return <ResultScreen title="River Crossed! 🦫🌉" lines={[`${correct} out of ${pool.length} bridges built correctly`, `Lives left: ${Math.max(0,lives)}`]} starCount={stars} reward={{ gameId: 'numberriver', stars, isNewBest: isNew }} best={isNew?`New best! Prev ${prev}/8`: prev>0?`Best ${prev}/8`:undefined} onPlayAgain={onExit} onHome={onHome} />
  }

  // Placed tracking by index is tricky due to duplicate ops; for UI fade we track by usage count:
  const usedCounts = new Map<string,number>()
  bridge.forEach(b=>{ if(b){ usedCounts.set(b.display,(usedCounts.get(b.display)||0)+1) } })
  let seenCounts = new Map<string,number>()
  const placedIndices = new Set<number>()
  level.availableOps.forEach((op,idx)=>{
    const used = usedCounts.get(op.display)||0
    const seen = seenCounts.get(op.display)||0
    if(seen < used){ placedIndices.add(idx); seenCounts.set(op.display, seen+1) }
  })

  return <div className="mx-auto max-w-3xl p-4 space-y-4">
    <div className="flex justify-between font-bold text-slate-600 px-2">
      <span>Bridge {idx+1} / {pool.length}</span>
      <span>❤️ {'♥'.repeat(lives)}{'♡'.repeat(3-lives)} &nbsp; ⭐ {correct}</span>
    </div>
    {level.description && <div className="text-center text-sky-800 font-semibold bg-sky-50 rounded-xl py-2 border border-sky-200">{level.description}</div>}
    <RiverScene target={level.target} startValue={level.start} slots={slots} bridgeOps={bridge} selectedSlot={selectedSlot} onSlotClick={handleSlotClick} runningTotal={Number.isNaN(running)? level.start ?? 0 : running} beaverState={beaver} beaverProgress={beaverProg} feedback={feedback ? {correct:feedback.correct} : null} />
    <LogTray available={level.availableOps} placedIds={placedIndices} selectedTrayIndex={selectedTray} onPickTray={handlePickTray} disabled={!!feedback} />
    <button disabled={!!feedback || bridge.every(b=>!b)} onClick={handleGo}
      className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white font-black py-4 text-xl shadow-lg transition hover:scale-[1.01]">🐾 Go Beaver Go!</button>
    {feedback && <div className={`rounded-2xl p-4 border-2 text-center font-bold ${feedback.correct?'bg-green-50 border-green-300 text-green-900':'bg-amber-50 border-amber-300 text-amber-900'}`}>{feedback.explanation}</div>}
    <div className="text-center"><button onClick={onExit} className="text-slate-500 underline text-sm">Change difficulty</button></div>
  </div>
}
