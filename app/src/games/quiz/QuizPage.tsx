import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../../lib/useContent'
import { staticProvider } from '../../content/staticProvider'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'
import ResultScreen from '../../components/ResultScreen'
import CategorySelect from './CategorySelect'
import MillionairePlay, { type MillionaireResult } from './MillionairePlay'
import { buildLadder, formatMoney } from './millionaire'

export default function QuizPage() {
  const [category, setCategory] = useState<string | null>(null)

  if (!category) return <CategorySelect onPick={setCategory} />
  return <MillionaireRound category={category} onExit={() => setCategory(null)} />
}

function MillionaireRound({
  category,
  onExit,
}: {
  category: string
  onExit: () => void
}) {
  const navigate = useNavigate()
  const [result, setResult] = useState<MillionaireResult | null>(null)
  const [roundKey, setRoundKey] = useState(0)

  // Always load the full pool so ladders have enough questions (and swaps);
  // `category` is used only as a preference when building the ladder.
  const { data, loading, error } = useContent(
    () => staticProvider.getQuizQuestions('mixed'),
    [],
  )

  // Build the ladder once per round (stable across MillionairePlay's re-renders).
  const ladder = useMemo(
    () => (data ? buildLadder(data, category) : []),
    [data, category, roundKey],
  )

  if (loading) return <Loading />
  if (error || !data || data.length === 0) return <ErrorScreen onRetry={onExit} />

  if (result) {
    const title =
      result.outcome === 'won'
        ? '🏆 You won the MILLION!'
        : result.outcome === 'walked'
          ? '👋 You walked away!'
          : 'Game over!'
    return (
      <ResultScreen
        title={title}
        lines={[`You take home ${formatMoney(result.amount)}`]}
        onPlayAgain={() => {
          setResult(null)
          setRoundKey((k) => k + 1)
        }}
        onHome={() => navigate('/')}
      />
    )
  }

  return (
    <MillionairePlay
      key={roundKey}
      ladder={ladder}
      pool={data}
      onFinish={setResult}
    />
  )
}
