import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TypingLesson } from '../../content/types'
import ResultScreen from '../../components/ResultScreen'
import LessonSelect, { type TypingMode } from './LessonSelect'
import TypingView, { type TypingResult } from './TypingView'
import TypingRace, { type TypingRaceResult } from './TypingRace'
import { loadBest, saveBest } from '../../lib/storage'

export default function TypingPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<TypingMode>('practice')
  const [lesson, setLesson] = useState<TypingLesson | null>(null)
  const [result, setResult] = useState<TypingResult | null>(null)
  const [raceResult, setRaceResult] = useState<TypingRaceResult | null>(null)

  if (!lesson)
    return (
      <LessonSelect
        onPick={setLesson}
        mode={mode}
        onModeChange={setMode}
        bestFor={(id) => loadBest(mode === 'race' ? `typing:race:${id}` : `typing:${id}`)}
      />
    )

  // Race results
  if (raceResult) {
    const best = loadBest(`typing:race:${lesson.id}`)
    return (
      <ResultScreen
        title={raceResult.won ? 'You beat Robo! 🏆' : 'Robo won this time! 🤖'}
        lines={[
          `⚡ ${raceResult.wpm} WPM`,
          `🎯 ${raceResult.accuracy}% accuracy`,
          raceResult.maxCombo >= 5 ? `🔥 Best combo: ${raceResult.maxCombo}` : '',
        ].filter(Boolean)}
        starCount={raceResult.won ? 3 : raceResult.accuracy >= 90 ? 2 : 1}
        best={best > 0 ? `Best: ${best} WPM` : undefined}
        onPlayAgain={() => setRaceResult(null)}
        onHome={() => navigate('/')}
      />
    )
  }

  // Practice results
  if (result) {
    const best = loadBest(`typing:${lesson.id}`)
    return (
      <ResultScreen
        title="Nice typing!"
        lines={[`⚡ ${result.wpm} WPM`, `🎯 ${result.accuracy}% accuracy`]}
        best={best > 0 ? `Best: ${best} WPM` : undefined}
        onPlayAgain={() => setResult(null)}
        onHome={() => navigate('/')}
      />
    )
  }

  if (mode === 'race') {
    return (
      <TypingRace
        key={lesson.id}
        lesson={lesson}
        onFinish={(r) => {
          if (r.wpm > loadBest(`typing:race:${lesson.id}`)) saveBest(`typing:race:${lesson.id}`, r.wpm)
          setRaceResult(r)
        }}
      />
    )
  }

  return (
    <TypingView
      key={lesson.id}
      lesson={lesson}
      onFinish={(r) => {
        saveBest(`typing:${lesson.id}`, r.wpm)
        setResult(r)
      }}
    />
  )
}
