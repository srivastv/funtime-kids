import { shuffle } from '../../lib/shuffle'
import type { NumberRiverLevel, NumberRiverOp } from '../../content/types'

export const DIFFICULTIES = [
  { level: 1 as const, name: 'Explorer', desc: 'Add and subtract within 50, 3 logs' },
  { level: 2 as const, name: 'Adventurer', desc: 'Add sub multiply divide within 200, 4 logs' },
  { level: 3 as const, name: 'Inventor', desc: 'Up to 1000 with all operations and tricky order' },
]

export type EvalResult = {
  intermediates: number[]
  final: number
  valid: boolean
  reason?: 'negative' | 'nonIntegerDivision' | 'overflow'
}

export function evaluateBridge(ops: NumberRiverOp[], start = 0): EvalResult {
  let current = start
  const intermediates: number[] = []
  for (const op of ops) {
    if (op.type === '+' && op.value !== undefined) current += op.value
    else if (op.type === '-' && op.value !== undefined) current -= op.value
    else if (op.type === '×' && op.value !== undefined) current *= op.value
    else if (op.type === '÷' && op.value !== undefined) {
      if (op.value === 0 || current % op.value !== 0) return { intermediates, final: current, valid: false, reason: 'nonIntegerDivision' }
      current = current / op.value
    } else if (op.type === 'missing') {
      // missing treated as placeholder, skip evaluation for now, assume filled correctly elsewhere
      continue
    }
    if (current < 0) return { intermediates, final: current, valid: false, reason: 'negative' }
    if (Math.abs(current) > 100000) return { intermediates, final: current, valid: false, reason: 'overflow' }
    intermediates.push(current)
  }
  return { intermediates, final: current, valid: true }
}

export function checkLevel(level: NumberRiverLevel, chosenOps: NumberRiverOp[]): boolean {
  if (chosenOps.length !== level.slots) return false
  const res = evaluateBridge(chosenOps, level.start ?? 0)
  return res.valid && res.final === level.target
}

export function scoreStars(correct: number, total: number, _attemptsUsed: number): number {
  const pct = total === 0 ? 0 : correct / total
  let base = 0
  if (pct >= 0.875) base = 3
  else if (pct >= 0.625) base = 2
  else if (pct >= 0.375) base = 1
  // penalize if many attempts? simple for now rely on correct count as proxy for first-try success per round handled in UI
  return base
}

export function bestKey(difficulty: 1|2|3): string {
  return `numberriver:best:${difficulty}`
}

// Procedural generator — simple forward build ensuring solvability
const opPools: Record<number, Array<{type:'+'|'-'|'×'|'÷', min:number, max:number}>> = {
  1: [{type:'+',min:1,max:20},{type:'-',min:1,max:20}],
  2: [{type:'+',min:1,max:50},{type:'-',min:1,max:30},{type:'×',min:2,max:5},{type:'÷',min:2,max:5}],
  3: [{type:'+',min:10,max:200},{type:'-',min:10,max:100},{type:'×',min:2,max:12},{type:'÷',min:2,max:12}],
}

function randInt(a:number,b:number){ return Math.floor(Math.random()*(b-a+1))+a }

export function generateLevel(difficulty: 1|2|3, slots = difficulty===1?3:4): NumberRiverLevel {
  const pool = opPools[difficulty]
  for (let attempt=0; attempt<200; attempt++) {
    let current = 0
    const ops: NumberRiverOp[] = []
    let valid = true
    for (let i=0;i<slots;i++) {
      const choice = pool[randInt(0,pool.length-1)]
      let value = randInt(choice.min, choice.max)
      // ensure division valid
      if (choice.type === '÷') {
        const divisors = [2,3,4,5,6,8,10,12].filter(d=> current % d ===0 && current>0)
        if (divisors.length===0) { value = 0; valid=false; break }
        value = divisors[randInt(0, divisors.length-1)]
      }
      if (choice.type === '-' && current - value < 0 && difficulty===1) {
        // avoid negative at easy level, switch to addition
        value = randInt(1,20)
        ops.push({type:'+', value, display:`+${value}`})
        current += value
      } else {
        ops.push({type: choice.type as any, value, display:`${choice.type}${value}`})
        const res = evaluateBridge([ops[ops.length-1]], current)
        if (!res.valid) { valid=false; break }
        current = res.final
      }
    }
    if (!valid) continue
    const target = current
    if (target < 5 || target > (difficulty===1?50 : difficulty===2?200:1000)) continue
    // add 1-2 distractors
    const distractors: NumberRiverOp[] = []
    const extraPool = [...pool]
    while (distractors.length < 2) {
      const ch = extraPool[randInt(0,extraPool.length-1)]
      const v = randInt(ch.min, ch.max)
      distractors.push({type: ch.type as any, value:v, display:`${ch.type}${v}`})
    }
    const available = shuffle([...ops, ...distractors])
    return {
      id: `gen-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      target,
      start: 0,
      slots,
      availableOps: available,
      difficulty,
    }
  }
  // fallback simple level
  return {
    id: 'fallback-1',
    target: 10,
    slots: 3,
    difficulty: 1,
    availableOps: [{type:'+',value:5,display:'+5'},{type:'+',value:5,display:'+5'},{type:'+',value:2,display:'+2'},{type:'-',value:2,display:'-2'}],
  }
}

export function buildLevelPool(curated: NumberRiverLevel[], difficulty: 1|2|3, count=8): NumberRiverLevel[] {
  const filtered = curated.filter(l=>l.difficulty===difficulty)
  const pool = shuffle(filtered)
  const out: NumberRiverLevel[] = []
  for (let i=0;i<Math.min(count, pool.length); i++) out.push(pool[i])
  while (out.length < count) {
    out.push(generateLevel(difficulty))
  }
  return out.slice(0,count)
}
