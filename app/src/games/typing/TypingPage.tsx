import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TypingLesson } from '../../content/types'
import ResultScreen from '../../components/ResultScreen'
import LessonSelect from './LessonSelect'
import TypingView, { type TypingResult } from './TypingView'

export default function TypingPage() {
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<TypingLesson | null>(null)
  const [result, setResult] = useState<TypingResult | null>(null)

  if (!lesson) return <LessonSelect onPick={setLesson} />

  if (result) {
    return (
      <ResultScreen
        title="Nice typing!"
        lines={[`⚡ ${result.wpm} WPM`, `🎯 ${result.accuracy}% accuracy`]}
        onPlayAgain={() => setResult(null)}
        onHome={() => navigate('/')}
      />
    )
  }

  return (
    <TypingView
      key={lesson.id}
      lesson={lesson}
      onFinish={setResult}
    />
  )
}
