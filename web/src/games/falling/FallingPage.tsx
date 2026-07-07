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

type Phase = 'intro' | 'playing' | 'result'

export default function FallingPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('intro')
  const [score, setScore] = useState(0)
  const { data, loading, error } = useContent(
    () => staticProvider.getFallingWords(),
    [],
  )

  if (loading) return <Loading />
  if (error || !data || data.length === 0) return <ErrorScreen />

  if (phase === 'playing') {
    return (
      <FallingGame
        words={data}
        onGameOver={(s) => {
          saveBest('falling', s)
          setScore(s)
          setPhase('result')
        }}
      />
    )
  }

  if (phase === 'result') {
    return (
      <ResultScreen
        title="Game over!"
        lines={[`You scored ${score} points`]}
        best={loadBest('falling') > 0 ? `Best: ${loadBest('falling')} points` : undefined}
        onPlayAgain={() => setPhase('playing')}
        onHome={() => navigate('/')}
      />
    )
  }

  return (
    <div className="mx-auto max-w-lg p-8 text-center">
      <div className="text-6xl">🌧️</div>
      <h1 className="mt-4 text-3xl font-extrabold text-sky-700">Word Rain</h1>
      <p className="mt-4 text-lg text-slate-600">
        Words fall from the sky! Type a word and press it into a puddle before it
        reaches the bottom. You have <strong>3 lives</strong> — don't let too many
        slip by. It gets faster as you score!
      </p>
      {loadBest('falling') > 0 && (
        <p className="mt-3 text-lg font-bold text-sky-600">
          🏅 Best: {loadBest('falling')} points
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          sound.click()
          setPhase('playing')
        }}
        className="mt-8 rounded-full bg-sky-500 px-10 py-4 text-xl font-bold text-white shadow hover:bg-sky-600"
      >
        Start!
      </button>
    </div>
  )
}
