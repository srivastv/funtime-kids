import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../../lib/useContent'
import { staticProvider } from '../../content/staticProvider'
import Loading from '../../components/Loading'
import ErrorScreen from '../../components/ErrorScreen'
import DifficultySelect from './DifficultySelect'
import NumberRiverPlay from './NumberRiverPlay'

export default function NumberRiverPage(){
  const [difficulty,setDifficulty]=useState<1|2|3|null>(null)
  const navigate=useNavigate()
  const {data, loading, error}=useContent(()=> staticProvider.getNumberRiverLevels(), [])

  if(loading) return <Loading/>
  if(error||!data) return <ErrorScreen onRetry={()=>window.location.reload()} />
  if(!difficulty) return <DifficultySelect onPick={setDifficulty} />
  return <NumberRiverPlay levels={data} difficulty={difficulty} onExit={()=>setDifficulty(null)} onHome={()=>navigate('/')} />
}
