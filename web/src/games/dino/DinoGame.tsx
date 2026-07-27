import { useEffect, useRef, useState } from 'react'
import { sound } from '../../lib/sound'

type Obstacle = { id: number; x: number; letter: string; passed: boolean; emoji: string }

const LETTERS_EASY = 'asdfjkl;gh'.split('')
const LETTERS_MED = 'qwertyuiopzxcvbnm'.split('')
const LETTERS_HARD = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')

function pickLetter(score: number): string {
  // score is number of obstacles popped — every ~10 points we want slightly harder letters, matching speed steps
  if (score < 12) return LETTERS_EASY[Math.floor(Math.random()*LETTERS_EASY.length)]
  if (score < 25) return Math.random()<0.7 ? LETTERS_EASY[Math.floor(Math.random()*LETTERS_EASY.length)] : LETTERS_MED[Math.floor(Math.random()*LETTERS_MED.length)]
  // hard tier mixes all with bias toward medium/hard
  const pool = [...LETTERS_EASY, ...LETTERS_MED, ...LETTERS_MED, ...LETTERS_HARD]
  return pool[Math.floor(Math.random()*pool.length)]
}

export default function DinoGame({ onGameOver }: { onGameOver: (score:number)=>void }) {
  const [distance, setDistance] = useState(0)
  const [lives, setLives] = useState(3)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [marioState, setMarioState] = useState<'run'|'jump'|'stumble'>('run')
  const [nextLetter, setNextLetter] = useState<string>('')
  const distRef = useRef(0)
  const livesRef = useRef(3)
  const obsRef = useRef<Obstacle[]>([])
  const lastRef = useRef<number|null>(null)
  const spawnAccRef = useRef(0)
  const speedRef = useRef(50) // pixels per second base scroll speed - lowered further for beginners, starts very slow
  const scoreRef = useRef(0) // number of successful pops for stepwise speed increase every 10

  useEffect(() => {
    function loop(t:number){
      if(lastRef.current===null) lastRef.current=t
      const dt = (t-lastRef.current)/1000
      lastRef.current=t
      distRef.current += speedRef.current * dt
      setDistance(Math.floor(distRef.current))

      // speed up stepwise every 10 points scored — start very slow at 50 px/s, +8 px/s each 10 points, max 170 px/s
      // scoreRef holds number of obstacles popped (= characters typed correctly)
      const level = Math.floor(scoreRef.current / 10)
      speedRef.current = 50 + Math.min(level * 8, 120)

      // spawn obstacles — start slow at 2600ms interval, decrease by 120ms every 10 points, minimum 1400ms
      spawnAccRef.current += dt*1000
      const interval = Math.max(1400, 2600 - level * 120)
      if (spawnAccRef.current >= interval) {
        spawnAccRef.current=0
        const id = Date.now()+Math.random()
        const letter = pickLetter(scoreRef.current)
        const dinoObstacles = ['🌵','🌵','🌵','🪨','🌴','🌵','🌵']
        const emoji = dinoObstacles[Math.floor(Math.random()*dinoObstacles.length)]
        const newObs = { id, x: 100, letter, passed:false, emoji }
        obsRef.current = [...obsRef.current, newObs]
        setObstacles([...obsRef.current])
        setNextLetter(letter.toUpperCase())
      }

      // move obstacles left
      obsRef.current = obsRef.current.map(o=>({...o, x: o.x - speedRef.current*dt*0.35 }))
      // check collisions at dino x ~18%
      let hit = false
      obsRef.current = obsRef.current.filter(o=>{
        if(o.x < 12 && o.x > 8 && !o.passed){
          // reached dino position without being typed -> crash
          hit = true
          return false
        }
        return o.x > -5
      })
      if(hit){
        livesRef.current -=1
        setLives(livesRef.current)
        setMarioState('stumble')
        sound.lifeLost()
        setTimeout(()=>setMarioState('run'),400)
        if(livesRef.current<=0){
          onGameOver(Math.floor(distRef.current))
          return
        }
      }
      setObstacles([...obsRef.current])
      requestAnimationFrame(loop)
    }
    const raf = requestAnimationFrame(loop)
    const onKey = (e: KeyboardEvent)=>{
      const k = e.key.toLowerCase()
      if(k.length!==1) return
      // find closest matching obstacle in front zone
      const targetIdx = obsRef.current.findIndex(o=> o.letter.toLowerCase()===k && o.x>8 && o.x<45 && !o.passed)
      if(targetIdx>=0){
        const target = obsRef.current[targetIdx]
        sound.pop()
        setMarioState('jump')
        setTimeout(()=>setMarioState('run'),350)
        // remove that obstacle with score bonus based on proximity (earlier = more points)
        const bonus = Math.max(5, Math.floor(25 - target.x*0.2))
        distRef.current += bonus
        scoreRef.current += 1
        obsRef.current.splice(targetIdx,1)
        setObstacles([...obsRef.current])
        // update next letter display to next closest obstacle
        const next = obsRef.current.filter(o=>!o.passed).sort((a,b)=>a.x-b.x)[0]
        setNextLetter(next ? next.letter.toUpperCase() : '')
      } else {
        // wrong key gentle feedback no life loss
        sound.wrong()
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey) }
  }, [onGameOver])

  return (
    <div className="mx-auto max-w-3xl p-4" style={{ color: 'var(--text-body)' }}>
      <div className="mb-3 flex justify-between font-bold text-xl" style={{ color: 'var(--text-heading)' }}>
        <span>🏁 {distance} m</span>
        <span>{'❤️'.repeat(lives)}<span className="opacity-20">{'❤️'.repeat(3-lives)}</span></span>
      </div>
      <div className="relative h-64 w-full overflow-hidden border-2 shadow-inner" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderRadius: 'var(--radius)', background: `linear-gradient(to bottom, var(--bg-from), var(--bg-to))` }}>
        {/* ground */}
        <div className="absolute bottom-0 left-0 right-0 h-12" style={{ backgroundColor: 'var(--secondary)', opacity: 0.25 }} />
        {/* dino character facing right */}
        <div className="absolute bottom-12 left-[12%] text-5xl transition-transform" style={{ transform: marioState==='jump' ? 'translateY(-56px) scaleX(-1) scale(1.1)' : marioState==='stumble' ? 'scaleX(-1) rotate(-20deg)' : 'scaleX(-1)' }}>
          🦖
        </div>
        {/* obstacles */}
        {obstacles.map(o=>(
          <div key={o.id} className="absolute bottom-12 flex flex-col items-center" style={{ left: `${o.x}%`, transform: 'translateX(-50%)' }}>
            <div className="rounded-2xl px-3 py-2 font-black shadow-lg border-3 animate-pulse" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-heading)', borderColor: 'var(--primary)', minWidth: '52px', textAlign:'center', fontSize: '1.8rem' }}>
              {o.letter.toUpperCase()}
            </div>
            <div className="text-4xl mt-1">{o.emoji}</div>
          </div>
        ))}
        {/* next letter hint big at top */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
          <div className="text-xs font-bold opacity-70" style={{ color: 'var(--text-muted)' }}>Type:</div>
          <div className="text-5xl font-black" style={{ color: 'var(--primary)', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{nextLetter || '...'}</div>
        </div>
      </div>
      <p className="mt-3 text-center" style={{ color: 'var(--text-muted)' }}>Press the letter shown above the cactus to jump! No need to press Enter.</p>
    </div>
  )
}
