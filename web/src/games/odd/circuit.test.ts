import { describe, it, expect } from 'vitest'
import { conducts, circuitLights, type Placed } from './circuit'

const wire: Placed = { kind: 'wire', label: 'Wire', emoji: '〰️' }
const copper: Placed = { kind: 'conductor', label: 'Copper', emoji: '🪙' }
const plastic: Placed = { kind: 'insulator', label: 'Plastic', emoji: '🧴' }
const switchOn: Placed = { kind: 'switch', label: 'Switch', emoji: '🔘', on: true }
const switchOff: Placed = { kind: 'switch', label: 'Switch', emoji: '🔘', on: false }

describe('circuit', () => {
  it('conducts: wire/conductor yes, insulator no, switch depends on state', () => {
    expect(conducts(wire)).toBe(true)
    expect(conducts(copper)).toBe(true)
    expect(conducts(plastic)).toBe(false)
    expect(conducts(switchOn)).toBe(true)
    expect(conducts(switchOff)).toBe(false)
  })

  it('lights only when the whole loop is filled and conducts', () => {
    expect(circuitLights([wire])).toBe(true)
    expect(circuitLights([wire, copper])).toBe(true)
    expect(circuitLights([wire, switchOn])).toBe(true)
    expect(circuitLights([wire, switchOff])).toBe(false) // open switch breaks the loop
    expect(circuitLights([wire, plastic])).toBe(false) // insulator breaks the loop
    expect(circuitLights([null, wire])).toBe(false) // a gap breaks the loop
    expect(circuitLights([])).toBe(false)
  })
})
