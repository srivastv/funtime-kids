import { describe, it, expect } from 'vitest'
import { growDay, initialPlant, stageFor, IDEAL } from './plant'

describe('plant grower', () => {
  it('stageFor maps growth to 0..4', () => {
    expect(stageFor(0)).toBe(0)
    expect(stageFor(2)).toBe(1)
    expect(stageFor(8)).toBe(4)
    expect(stageFor(100)).toBe(4) // clamped
  })

  it('healthy water + light grows the plant and adds health', () => {
    const s = initialPlant()
    const next = growDay(s, 5, 6) // both in band
    expect(next.growth).toBe(2)
    expect(next.health).toBeGreaterThan(s.health)
    expect(next.day).toBe(1)
    expect(next.moisture).toBe(2) // dried by 3
  })

  it('reaches flower after four healthy days (and wins)', () => {
    let s = initialPlant()
    for (let i = 0; i < 4; i++) s = growDay(s, 5, 6)
    expect(s.stage).toBe(4)
    expect(s.status).toBe('won')
  })

  it('too little of both drains health and can kill the plant', () => {
    let s = initialPlant()
    s = growDay(s, 0, 0)
    expect(s.health).toBeLessThan(initialPlant().health)
    // keep starving it → dies
    let guard = 0
    while (s.status === 'growing' && guard++ < 20) s = growDay(s, 0, 0)
    expect(s.status).toBe('dead')
  })

  it('overwatering costs extra health even if in no other band', () => {
    const dry = growDay(initialPlant(), 5, 0) // moisture ok, light bad → -8
    const wet = growDay(initialPlant(), 10, 0) // moisture bad + overwater → worse
    expect(wet.health).toBeLessThan(dry.health)
  })

  it('exposes ideal bands', () => {
    expect(IDEAL.moistureMin).toBeLessThan(IDEAL.moistureMax)
    expect(IDEAL.lightMin).toBeLessThan(IDEAL.lightMax)
  })
})
