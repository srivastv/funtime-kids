export type Time = { h: number; m: number } // h in 1..12, m in 0..59

/** Add minutes to a 12-hour clock time, wrapping around. */
export function addMinutes(t: Time, delta: number): Time {
  let total = ((t.h % 12) * 60 + t.m + delta) % 720
  if (total < 0) total += 720
  const h = Math.floor(total / 60)
  return { h: h === 0 ? 12 : h, m: total % 60 }
}

/** Degrees clockwise from 12 o'clock for the minute hand. */
export function minuteAngle(m: number): number {
  return m * 6
}

/** Degrees clockwise from 12 o'clock for the hour hand (includes minute drift). */
export function hourAngle(h: number, m: number): number {
  return (h % 12) * 30 + m * 0.5
}

/** Pointer angle (0 at 12, clockwise) → nearest minute 0..59. */
export function angleToMinute(angleDeg: number): number {
  const a = ((angleDeg % 360) + 360) % 360
  return Math.round(a / 6) % 60
}

/** Pointer angle (0 at 12, clockwise) → nearest hour 1..12. */
export function angleToHour(angleDeg: number): number {
  const a = ((angleDeg % 360) + 360) % 360
  const h = Math.round(a / 30) % 12
  return h === 0 ? 12 : h
}

export function timeEquals(a: Time, b: Time): boolean {
  return a.h === b.h && a.m === b.m
}

export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export function timeLabel(t: Time): string {
  return `${t.h}:${t.m.toString().padStart(2, '0')}`
}
