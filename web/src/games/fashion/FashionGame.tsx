import { useEffect, useRef, useState } from 'react'
import { sound } from '../../lib/sound'

type Item = { word:string; emoji:string; hint:string }

const CLOTHES: Item[] = [
  {word:'dress',emoji:'👗',hint:'fancy outfit for party'},
  {word:'shoes',emoji:'👠',hint:'high heels for runway'},
  {word:'hat',emoji:'👒',hint:'wide sun hat'},
  {word:'crown',emoji:'👑',hint:'royal headwear'},
  {word:'bow',emoji:'🎀',hint:'pretty ribbon'},
  {word:'shirt',emoji:'👕',hint:'top with sleeves'},
  {word:'skirt',emoji:'👗',hint:'flows below waist'},
  {word:'coat',emoji:'🧥',hint:'warm outer layer'},
  {word:'scarf',emoji:'🧣',hint:'wrap around neck'},
  {word:'gloves',emoji:'🧤',hint:'cover hands'},
  {word:'boots',emoji:'👢',hint:'tall footwear'},
  {word:'jacket',emoji:'🧥',hint:'short coat'},
  {word:'socks',emoji:'🧦',hint:'cover feet inside shoes'},
  {word:'jeans',emoji:'👖',hint:'blue denim trousers'},
  {word:'blouse',emoji:'👚',hint:'fancy ladies top'},
  {word:'cardigan',emoji:'🧶',hint:'knitted open sweater'},
  {word:'sneakers',emoji:'👟',hint:'sporty shoes'},
  {word:'sandals',emoji:'👡',hint:'summer open shoes'},
  {word:'handbag',emoji:'👜',hint:'carry bag for fashion'},
  {word:'necklace',emoji:'📿',hint:'jewellery around neck'},
]

function scramble(word:string):string{
  const arr=word.split('')
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] }
  if(arr.join('')===word) return scramble(word)
  return arr.join('')
}

export default function FashionGame({ onGameOver }:{ onGameOver:(score:number)=>void }){
  const [score,setScore]=useState(0)
  const [timeLeft,setTimeLeft]=useState(90)
  const [current,setCurrent]=useState<Item>(()=>CLOTHES[Math.floor(Math.random()*CLOTHES.length)])
  const [scrambled,setScrambled]=useState(()=>scramble(current.word))
  const [input,setInput]=useState('')
  const [feedback,setFeedback]=useState<'idle'|'correct'|'wrong'>('idle')
  const scoreRef=useRef(0); scoreRef.current=score

  useEffect(()=>{
    const timer=setInterval(()=>{ setTimeLeft(t=>{ if(t<=1){ clearInterval(timer); onGameOver(scoreRef.current); return 0 } return t-1 }) },1000)
    return ()=>clearInterval(timer)
  },[onGameOver])

  function nextRound(){
    const item = CLOTHES[Math.floor(Math.random()*CLOTHES.length)]
    setCurrent(item); setScrambled(scramble(item.word)); setInput(''); setFeedback('idle')
  }

  function handleSubmit(e:React.FormEvent){
    e.preventDefault()
    if(input.trim().toLowerCase()===current.word){
      sound.correct(); setFeedback('correct'); setScore(s=>s+1); scoreRef.current+=1
      setTimeout(nextRound, 800)
    } else {
      sound.wrong(); setFeedback('wrong'); setTimeout(()=>setFeedback('idle'),600)
    }
    setInput('')
  }

  const pct = Math.max(0, timeLeft/90*100)

  return (
    <div className="mx-auto max-w-2xl p-4" style={{color:'var(--text-body)'}}>
      <div className="mb-3 flex justify-between font-bold text-xl" style={{color:'var(--text-heading)'}}>
        <span>👗 Styled: {score}</span>
        <span>⏰ {timeLeft}s</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 mb-6 overflow-hidden">
        <div className="h-3 transition-all" style={{ width:`${pct}%`, backgroundColor:'var(--primary)' }} />
      </div>

      <div className="border-2 p-8 text-center shadow-lg" style={{ backgroundColor:'var(--card-bg)', borderColor:'var(--card-border)', borderRadius:'var(--radius)' }}>
        <div className="text-8xl mb-4">🧍‍♀️</div>
        <div className="text-6xl mb-2">{current.emoji}</div>
        <p className="text-sm" style={{color:'var(--text-muted)'}}>{current.hint}</p>
        <div className="mt-4 text-4xl font-black tracking-widest" style={{ color: feedback==='correct' ? '#16a34a' : feedback==='wrong' ? '#dc2626' : 'var(--primary)', letterSpacing:'0.2em' }}>
          {scrambled.toUpperCase()}
        </div>
        <p className="mt-2 text-sm" style={{color:'var(--text-muted)'}}>Unscramble to dress the model!</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <input autoFocus value={input} onChange={e=>setInput(e.target.value)} placeholder="Type clothing word then Enter" className="w-full p-4 text-center text-2xl border-2 shadow focus:outline-none" style={{ borderRadius:'var(--radius)', borderColor: feedback==='correct' ? '#16a34a' : feedback==='wrong' ? '#dc2626' : 'var(--card-border)', backgroundColor:'var(--card-bg)', color:'var(--text-heading)' }} />
      </form>

      <div className="mt-6 flex justify-center gap-3 flex-wrap opacity-60">
        {['👗','👠','👒','🎀','👑','👜','👚','👢'].map(em=> <span key={em} className="text-3xl">{em}</span>)}
      </div>
    </div>
  )
}
