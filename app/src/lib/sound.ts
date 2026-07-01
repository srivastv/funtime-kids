/**
 * Tiny Web Audio sound engine. All sounds are synthesized (no asset files),
 * so there are no downloads or licensing concerns. Every effect no-ops when
 * muted, so call sites can fire sounds freely.
 */

let ctx: AudioContext | null = null
let muted = false
let musicTimer: number | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function setMuted(next: boolean) {
  muted = next
  if (muted) stopMusic()
}

export function isMuted() {
  return muted
}

/** A single tone with a quick attack/decay envelope. */
function blip(
  freq: number,
  when: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.2,
) {
  const c = getCtx()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, when)
  g.gain.setValueAtTime(0.0001, when)
  g.gain.exponentialRampToValueAtTime(gain, when + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur)
  osc.connect(g).connect(c.destination)
  osc.start(when)
  osc.stop(when + dur + 0.02)
}

/** A frequency sweep (whoosh). */
function sweep(f0: number, f1: number, dur: number, gain = 0.18) {
  const c = getCtx()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(f0, t)
  osc.frequency.exponentialRampToValueAtTime(f1, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

/** A short filtered noise burst (used for the explosion pop). */
function noise(dur: number, gain = 0.3) {
  const c = getCtx()
  const t = c.currentTime
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  }
  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1400
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(g).connect(c.destination)
  src.start(t)
  src.stop(t + dur)
}

/** Play a sequence of [freq, duration] notes starting now. */
function melody(notes: Array<[number, number]>, type: OscillatorType = 'triangle', gain = 0.2) {
  const c = getCtx()
  let t = c.currentTime
  for (const [freq, dur] of notes) {
    blip(freq, t, dur, type, gain)
    t += dur
  }
}

// Named effects ------------------------------------------------------------

export const sound = {
  click() {
    if (muted) return
    blip(660, getCtx().currentTime, 0.08, 'square', 0.12)
  },
  correct() {
    if (muted) return
    melody([
      [523, 0.12],
      [659, 0.12],
      [784, 0.18],
    ])
  },
  wrong() {
    if (muted) return
    melody([
      [311, 0.18],
      [233, 0.28],
    ], 'sawtooth', 0.15)
  },
  lifeline() {
    if (muted) return
    sweep(400, 1200, 0.35)
  },
  tick() {
    if (muted) return
    blip(880, getCtx().currentTime, 0.05, 'square', 0.08)
  },
  win() {
    if (muted) return
    melody([
      [523, 0.15],
      [659, 0.15],
      [784, 0.15],
      [1047, 0.35],
    ])
  },
  lose() {
    if (muted) return
    melody([
      [392, 0.2],
      [330, 0.2],
      [262, 0.4],
    ], 'sine', 0.18)
  },
  pop() {
    if (muted) return
    blip(1200, getCtx().currentTime, 0.06, 'triangle', 0.2)
    noise(0.18, 0.25)
  },
  lifeLost() {
    if (muted) return
    melody([
      [440, 0.14],
      [349, 0.22],
    ], 'sine', 0.16)
  },
  key() {
    if (muted) return
    blip(1000, getCtx().currentTime, 0.03, 'square', 0.05)
  },
}

// Gentle looping background music -----------------------------------------

function softNote(freq: number, when: number, dur: number) {
  blip(freq, when, dur, 'triangle', 0.05)
}

export function startMusic() {
  if (muted || musicTimer !== null) return
  const play = () => {
    const c = getCtx()
    const t0 = c.currentTime
    // A calm pentatonic loop.
    const seq: Array<[number, number]> = [
      [392, 0.0],
      [523, 0.5],
      [659, 1.0],
      [587, 1.5],
      [440, 2.0],
      [659, 2.5],
      [523, 3.0],
      [392, 3.5],
    ]
    for (const [f, off] of seq) softNote(f, t0 + off, 0.5)
  }
  play()
  musicTimer = window.setInterval(play, 4000)
}

export function stopMusic() {
  if (musicTimer !== null) {
    clearInterval(musicTimer)
    musicTimer = null
  }
}
