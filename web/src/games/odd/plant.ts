export type PlantStatus = 'growing' | 'won' | 'dead'

export type PlantState = {
  day: number
  moisture: number // 0..10 soil wetness
  health: number // 0..100
  growth: number // accumulates on healthy days
  stage: number // 0 seed → 4 flower
  status: PlantStatus
}

// Healthy bands — keep water and light inside these to grow.
export const IDEAL = { moistureMin: 3, moistureMax: 7, lightMin: 4, lightMax: 8 }

export const STAGES = ['🌰', '🌱', '🌿', '🌷', '🌸']

export function stageFor(growth: number): number {
  return Math.min(4, Math.floor(growth / 2))
}

export function initialPlant(): PlantState {
  return { day: 0, moisture: 5, health: 60, growth: 0, stage: 0, status: 'growing' }
}

/**
 * Advance one day. `moisture` is the soil wetness at the start of the day (after
 * any watering) and `light` is how much sun the player gave. Both must sit inside
 * the ideal bands to grow; otherwise the plant loses health.
 */
export function growDay(s: PlantState, moisture: number, light: number): PlantState {
  const mOk = moisture >= IDEAL.moistureMin && moisture <= IDEAL.moistureMax
  const lOk = light >= IDEAL.lightMin && light <= IDEAL.lightMax

  let health = s.health
  let growth = s.growth
  if (mOk && lOk) {
    health += 12
    growth += 2
  } else if (mOk || lOk) {
    health -= 8
  } else {
    health -= 18
  }
  if (moisture >= 9) health -= 6 // overwatered — roots rot
  if (moisture <= 0) health -= 6 // bone dry

  health = Math.max(0, Math.min(100, health))
  const moistureNext = Math.max(0, moisture - 3) // soil dries over the day
  const stage = stageFor(growth)

  let status: PlantStatus = 'growing'
  if (health <= 0) status = 'dead'
  else if (stage >= 4) status = 'won'

  return { day: s.day + 1, moisture: moistureNext, health, growth, stage, status }
}
