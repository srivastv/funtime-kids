import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResultScreen from '../../components/ResultScreen'
import DinoGame from './DinoGame'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'

type Phase = 'intro' | 'playing' | 'result'

export default function DinoPage(){
  const navigate = useNavigate()
  const [phase,setPhase]=useState<Phase>('intro')
  const [score,setScore]=useState(0)
  const [newBest,setNewBest]=useState(false)
  const best = loadBest('dino')

  if(phase==='playing'){
    return <DinoGame onGameOver={(s)=>{ setNewBest(s>loadBest('dino')); saveBest('dino',s); setScore(s); setPhase('result') }} />
  }
  if(phase==='result'){
    const stars = score>=600?3: score>=350?2: score>=150?1:0
    return <ResultScreen title="Rawr! Run complete!" lines={[`You ran ${score} metres!`]} starCount={stars} reward={{gameId:'dino',stars,isNewBest:newBest}} best={best>0?`Best: ${best} m`:undefined} onPlayAgain={()=>setPhase('playing')} onHome={()=>navigate('/')} />
  }
  return (
    <div className="mx-auto max-w-xl p-8 text-center" style={{color:'var(--text-body)'}}>
      <div className="text-7xl">🦖🌵</div>
      <h1 className="mt-4 text-3xl font-extrabold" style={{color:'var(--text-heading)'}}>Dino Dash</h1>
      <p className="mt-4 text-lg" style={{color:'var(--text-muted)'}}>Help Dino run across the desert! When a cactus shows a letter, type that key quickly to jump over it. 3 lives, no penalty for wrong key — just keep running! Speed starts slow and gradually gets faster as you score higher.</p>
      {best>0 && <p className="mt-3 font-bold" style={{color:'var(--primary)'}}>🏅 Best: {best} m</p>}
      <button type="button" onClick={()=>{sound.click(); setPhase('playing')}} className="mt-8 rounded-full px-10 py-4 text-xl font-bold text-white shadow hover:opacity-90" style={{backgroundColor:'var(--primary)'}}>Start Run!</button>
      <p className="mt-4 text-sm" style={{color:'var(--text-muted)'}}>Tip: watch the big letter at the top. Perfect for beginners learning keyboard positions.</p>
    </div>
  )
}
