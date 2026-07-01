const PREFIX = 'funtime:best:'

const fullKey = (key: string) => PREFIX + key

/** Read a stored best value. Returns 0 for missing or corrupt entries. */
export function loadBest(key: string): number {
  try {
    const raw = localStorage.getItem(fullKey(key))
    if (raw === null) return 0
    const n = Number(raw)
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

/** Persist `value` only if it beats the stored best. */
export function saveBest(key: string, value: number): void {
  try {
    if (value > loadBest(key)) {
      localStorage.setItem(fullKey(key), String(value))
    }
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}
