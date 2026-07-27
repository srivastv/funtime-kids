import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../../lib/useContent'
import { staticProvider } from '../../content/staticProvider'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'
import ResultScreen from '../../components/ResultScreen'
import FallingGame from './FallingGame'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import type { FallingMode } from '../../content/types'

type Phase = 'intro' | 'playing' | 'result'

export default function FallingPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('intro')
  const [mode, setMode] = useState<FallingMode>('letter')
  const [score, setScore] = useState(0)
  const [newBest, setNewBest] = useState(false)
  const { data: words, loading: loadingW, error: errW } = useContent(
    () => staticProvider.getFallingWords(),
    [],
  )
  const { data: letters, loading: loadingL, error: errL } = useContent(
    () => staticProvider.getFallingLetters(),
    [],
  )

  if (loadingW || loadingL) return <Loading />
  if (errW || errL || !words || !letters || words.length === 0 || letters.length === 0) return <ErrorScreen />

  const bestKey = mode === 'letter' ? 'falling:letter' : 'falling:word'

  if (phase === 'playing') {
    const isLetter = mode === 'letter'
    return (
      <FallingGame
        mode={mode}
        words={isLetter ? [] : words}
        letters={isLetter ? letters : []}
        onGameOver={(s) => {
          const key = bestKey
          const oldBest = loadBest(key)
          // migrate old best if exists under old key for first time
          if (oldBest === 0) {
            const legacy = loadBest('falling')
            if (legacy > 0 && mode === 'word') {
              saveBest(key, legacy)
            }
          }
          const currentBest = loadBest(key)
          setNewBest(s > currentBest)
          saveBest(key, s)
          // also update legacy key for backward compat display elsewhere maybe
          if (mode === 'word') saveBest('falling', Math.max(loadBest('falling'), s))
          setScore(s)
          setPhase('result')
        }}
      />
    )
  }

  if (phase === 'result') {
    const isLetter = mode === 'letter'
    const stars = isLetter
      ? score >= 30 ? 3 : score >= 18 ? 2 : score >= 8 ? 1 : 0
      : score >= 20 ? 3 : score >= 12 ? 2 : score >= 5 ? 1 : 0
    const best = loadBest(bestKey)
    return (
      <ResultScreen
        title="Game over!"
        lines={[`You scored ${score} points`, mode === 'letter' ? 'Letter Rain mode' : 'Word Rain mode']}
        starCount={stars}
        reward={{ gameId: 'falling', stars, isNewBest: newBest }}
        best={best > 0 ? `Best: ${best} points` : undefined}
        onPlayAgain={() => setPhase('playing')}
        onHome={() => navigate('/')}
      />
    )
  }

  const bestLetter = loadBest('falling:letter')
  const bestWord = loadBest('falling:word') || loadBest('falling')
  return (
    <div className="mx-auto max-w-2xl p-8 text-center" style={{ color: 'var(--text-body)' }}>
      <div className="text-6xl">🌧️</div>
      <h1 className="mt-4 text-3xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Rain Games</h1>
      <p className="mt-4 text-lg" style={{ color: 'var(--text-muted)' }}>
        Choose your challenge! Letters fall slowly for beginners, words fall faster for typists. You have <strong>3 lives</strong> — pop before they land!
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 max-w-2xl mx-auto">
        {[
          { id: 'letter' as const, icon: '💧', title: 'Letter Rain', desc: 'Single letters fall slowly. Type the key to pop! Perfect for beginners learning keyboard.', best: bestLetter, color: 'var(--primary)' },
          { id: 'word' as const, icon: '🌧️', title: 'Word Rain', desc: 'Whole words fall faster. Type full word to pop. Great practice for speed and spelling!', best: bestWord, color: 'var(--secondary)' },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => { sound.click(); setMode(m.id); setPhase('playing') }}
            className="p-8 text-center shadow-lg transition hover:scale-105 hover:shadow-xl border-2 relative overflow-hidden"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderRadius: 'var(--radius)', borderTop: `6px solid ${m.color}` }}
          >
            <div className="text-6xl">{m.icon}</div>
            <div className="mt-3 text-2xl font-extrabold" style={{ color: 'var(--text-heading)' }}>{m.title}</div>
            <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{m.desc}</div>
            {m.best > 0 && <div className="mt-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>🏅 Best: {m.best}</div>}
            <div className="mt-4 inline-block rounded-full px-5 py-2 text-white font-bold shadow" style={{ backgroundColor: m.color }}>Start!</div>
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>Tip: Letter Rain is great for ages 5-7 learning keyboard positions. Word Rain is for ages 7+ building speed and spelling.</p>
    </div>
  )
}
