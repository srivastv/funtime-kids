import { shuffle } from '../../lib/shuffle'
import type { OddExperiment, OddMode, OddTopic } from '../../content/types'

export const TOPICS: { id: OddTopic; name: string; icon: string; desc: string }[] = [
  { id: 'plants', name: 'Green Fingers', icon: '🌱', desc: 'Plants grow, need light water, flower parts, seeds dispersal' },
  { id: 'rocks', name: 'Rock Stars', icon: '🪨', desc: 'Rocks properties fossils soil states of matter water cycle' },
  { id: 'light', name: 'Light Lab', icon: '💡', desc: 'Seeing light shadows reflection transparent translucent opaque' },
  { id: 'sound', name: 'Sound Studio', icon: '🔊', desc: 'Vibration pitch volume how sound travels' },
  { id: 'forces', name: 'Forces & Magnets', icon: '🧲', desc: 'Push pull friction gravity magnets attract repel' },
  { id: 'animals', name: 'Animals & Humans', icon: '🐾', desc: 'Skeleton muscles nutrition balanced diet food groups' },
]

export const MODES: { id: OddMode; name: string; icon: string; desc: string }[] = [
  { id: 'mixed', name: 'Mixed Lab', icon: '🧪', desc: 'All topics mixed' },
  ...TOPICS.map(t => ({ id: t.id as OddMode, name: t.name, icon: t.icon, desc: t.desc })),
]

export const DIFFICULTIES = [
  { level: 1 as const, name: 'Explorer', desc: 'Year 3 core — obvious choices' },
  { level: 2 as const, name: 'Adventurer', desc: 'Year 4 core — a bit trickier' },
  { level: 3 as const, name: 'Inventor', desc: 'Mix and challenge — think hard!' },
]

const ROUND_SIZE = 8

export function filterPool(items: OddExperiment[], mode: OddMode, difficulty: 1|2|3): OddExperiment[] {
  let pool = items.filter(i => i.difficulty <= difficulty)
  if (mode !== 'mixed') {
    pool = pool.filter(i => i.topic === mode)
  }
  return shuffle(pool)
}

export function buildExperimentPool(items: OddExperiment[], mode: OddMode, difficulty: 1|2|3): OddExperiment[] {
  const pool = filterPool(items, mode, difficulty)
  if (pool.length < 4) return []
  const out: OddExperiment[] = []
  const shuffled = shuffle(pool)
  for (let i=0; i< Math.min(ROUND_SIZE, shuffled.length); i++) out.push(shuffled[i])
  while (out.length < ROUND_SIZE && pool.length>0) {
    out.push(shuffle(pool)[0])
  }
  return out.slice(0, ROUND_SIZE)
}

/** A player's answer to an experiment: a chosen index, or a label→category map. */
export type OddAnswer = number | Record<string, string>

export function checkAnswer(exp: OddExperiment, answer: OddAnswer): boolean {
  const cfg = exp.config
  switch(exp.type) {
    case 'predict-choice':
      return answer === cfg.correctIndex
    case 'slider-predict': {
      const val = typeof answer === 'number' ? answer : Number(answer)
      const target = cfg.correctValue ?? 0
      const tol = cfg.tolerance ?? 0
      return Math.abs(val - target) <= tol
    }
    case 'drag-sort': {
      if (typeof answer !== 'object') return false
      const items = cfg.items
      if (!items) return false
      return items.every((it) => answer[it.label] === it.category)
    }
    default:
      return false
  }
}

export function scoreStars(correct: number, total: number): number {
  const pct = total===0 ? 0 : correct/total
  if (pct >= 0.875) return 3
  if (pct >= 0.625) return 2
  if (pct >= 0.375) return 1
  return 0
}

export function bestKey(mode: OddMode, difficulty: 1|2|3): string {
  return `odd:${mode}:${difficulty}`
}

export function topicInfo(id: OddTopic) {
  return TOPICS.find(t=>t.id===id)
}
