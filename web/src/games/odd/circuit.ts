export type CompKind = 'wire' | 'switch' | 'conductor' | 'insulator'

export type Placed = { kind: CompKind; label: string; emoji: string; on?: boolean }

/** Does electricity flow through this component? A switch only conducts when on. */
export function conducts(p: Placed): boolean {
  if (p.kind === 'insulator') return false
  if (p.kind === 'switch') return !!p.on
  return true
}

/** The bulb lights only when every slot in the loop is filled and conducts. */
export function circuitLights(slots: (Placed | null)[]): boolean {
  return slots.length > 0 && slots.every((s) => s !== null && conducts(s))
}
