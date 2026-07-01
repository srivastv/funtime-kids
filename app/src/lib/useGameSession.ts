import { useState, useCallback } from 'react'

/**
 * Generic runtime state for a turn-based game: current index, score, and
 * whether the session is finished. Reused by any game (quiz now, others later).
 */
export function useGameSession(total: number) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const next = useCallback(() => {
    setIndex((i) => {
      const n = i + 1
      if (n >= total) {
        setFinished(true)
        return i
      }
      return n
    })
  }, [total])

  const addScore = useCallback((points: number) => {
    setScore((s) => s + points)
  }, [])

  const reset = useCallback(() => {
    setIndex(0)
    setScore(0)
    setFinished(false)
  }, [])

  return { index, score, finished, next, addScore, reset }
}
