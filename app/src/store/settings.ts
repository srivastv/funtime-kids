import { create } from 'zustand'
import { setMuted } from '../lib/sound'

const KEY = 'funtime:soundOn'

function loadSoundOn(): boolean {
  try {
    const v = localStorage.getItem(KEY)
    return v === null ? true : v === 'true'
  } catch {
    return true
  }
}

type SettingsState = {
  soundOn: boolean
  toggleSound: () => void
}

export const useSettings = create<SettingsState>((set, get) => ({
  soundOn: loadSoundOn(),
  toggleSound: () => {
    const next = !get().soundOn
    try {
      localStorage.setItem(KEY, String(next))
    } catch {
      // ignore storage failures
    }
    setMuted(!next)
    set({ soundOn: next })
  },
}))

// Sync the audio engine with the persisted preference on load.
setMuted(!loadSoundOn())
