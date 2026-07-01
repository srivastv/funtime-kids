import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../../lib/useContent'
import { useGameSession } from '../../lib/useGameSession'
import { staticProvider } from '../../content/staticProvider'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'
import ResultScreen from '../../components/ResultScreen'
import CategorySelect from './CategorySelect'
import QuestionView from './QuestionView'
import { stars } from './scoring'

const MAX_QUESTIONS = 8

export default function QuizPage() {
  const [category, setCategory] = useState<string | null>(null)

  if (!category) return <CategorySelect onPick={setCategory} />
  return <QuizPlay category={category} onExit={() => setCategory(null)} />
}

function QuizPlay({
  category,
  onExit,
}: {
  category: string
  onExit: () => void
}) {
  const navigate = useNavigate()
  const { data, loading, error } = useContent(
    () => staticProvider.getQuizQuestions(category),
    [category],
  )

  if (loading) return <Loading />
  if (error || !data || data.length === 0) return <ErrorScreen onRetry={onExit} />

  const questions = data.slice(0, MAX_QUESTIONS)
  return <QuizRun questions={questions} onHome={() => navigate('/')} />
}

function QuizRun({
  questions,
  onHome,
}: {
  questions: import('../../content/types').Question[]
  onHome: () => void
}) {
  const session = useGameSession(questions.length)

  if (session.finished) {
    return (
      <ResultScreen
        lines={[`You scored ${session.score} out of ${questions.length}`]}
        starCount={stars(session.score, questions.length)}
        onPlayAgain={() => {
          session.reset()
        }}
        onHome={onHome}
      />
    )
  }

  return (
    <QuestionView
      key={session.index}
      question={questions[session.index]}
      index={session.index}
      total={questions.length}
      onAnswer={(correct) => {
        if (correct) session.addScore(1)
        session.next()
      }}
    />
  )
}
