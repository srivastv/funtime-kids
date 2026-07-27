import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResultScreen from '../../components/ResultScreen'
import FashionGame from './FashionGame'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'

type Phase='intro'|'playing'|'result'
export default function FashionPage(){
  const navigate=useNavigate()
  const [phase,setPhase]=useState<Phase>('intro')
  const [score,setScore]=useState(0)
  const [newBest,setNewBest]=useState(false)
  const best=loadBest('fashion')
  if(phase==='playing') return <FashionGame onGameOver={(s)=>{setNewBest(s>loadBest('fashion')); saveBest('fashion',s); setScore(s); setPhase('result')}} />
  if(phase==='result'){
    const stars = score>=10?3: score>=6?2: score>=3?1:0
    return <ResultScreen title="Fabulous!" lines={[`You styled ${score} outfits!`]} starCount={stars} reward={{gameId:'fashion',stars,isNewBest:newBest}} best={best>0?`Best: ${best} outfits`:undefined} onPlayAgain={()=>setPhase('playing')} onHome={()=>navigate('/')} />
  }
  return (
    <div className="mx-auto max-w-xl p-8 text-center" style={{color:'var(--text-body)'}}>
      <div className="text-7xl">👗✨</div>
      <h1 className="mt-4 text-3xl font-extrabold" style={{color:'var(--text-heading)'}}>Fashion Show</h1>
      <p className="mt-4 text-lg" style={{color:'var(--text-muted)'}}>Unscramble the clothing word to dress the model for the runway! Type the correct spelling and press Enter. 90 seconds to style as many outfits as you can!</p>
      {best>0 && <p className="mt-3 font-bold" style={{color:'var(--primary)'}}>🏅 Best: {best} outfits</p>}
      <button type="button" onClick={()=>{sound.click(); setPhase('playing')}} className="mt-8 rounded-full px-10 py-4 text-xl font-bold text-white shadow hover:opacity-90" style={{backgroundColor:'var(--primary)'}}>Start Show!</button>
      <p className="mt-4 text-sm" style={{color:'var(--text-muted)'}}>Tip: look at scrambled letters, think of clothing item, type it correctly!</p>
    </div>
  )
}
