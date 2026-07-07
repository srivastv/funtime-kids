import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TypingLesson } from '../../content/types'
import ResultScreen from '../../components/ResultScreen'
import LessonSelect from './LessonSelect'
import TypingView, { type TypingResult } from './TypingView'
import { loadBest, saveBest } from '../../lib/storage'

export default function TypingPage() {
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<TypingLesson | null>(null)
  const [result, setResult] = useState<TypingResult | null>(null)

  if (!lesson)
    return (
      <LessonSelect
        onPick={setLesson}
        bestFor={(id) => loadBest(`typing:${id}`)}
      />
    )

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
