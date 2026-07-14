import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../../lib/useContent'
import { staticProvider } from '../../content/staticProvider'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'
import ModeSelect from './ModeSelect'
import GeoPlay from './GeoPlay'
import type { GeoMode } from '../../content/types'

export default function GeoPage() {
  const [selection, setSelection] = useState<{ mode: GeoMode; difficulty: 1 | 2 | 3 } | null>(null)
  const navigate = useNavigate()
  const { data, loading, error } = useContent(() => staticProvider.getGeographyItems(), [])

  if (loading) return <Loading />
  if (error || !data) return <ErrorScreen onRetry={() => window.location.reload()} />

  if (!selection) {
    return <ModeSelect onPick={(mode, difficulty) => setSelection({ mode, difficulty })} />
  }

  return (
    <GeoPlay
      items={data}
      mode={selection.mode}
      difficulty={selection.difficulty}
      onExit={() => setSelection(null)}
      onHome={() => navigate('/')}
    />
  )
}
