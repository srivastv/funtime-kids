import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameSession } from './useGameSession'

describe('useGameSession', () => {
  it('advances index and finishes', () => {
    const { result } = renderHook(() => useGameSession(2))
    expect(result.current.index).toBe(0)
    act(() => result.current.next())
    expect(result.current.index).toBe(1)
    act(() => result.current.next())
    expect(result.current.finished).toBe(true)
  })

  it('accumulates score', () => {
    const { result } = renderHook(() => useGameSession(3))
    act(() => result.current.addScore(1))
    act(() => result.current.addScore(1))
    expect(result.current.score).toBe(2)
  })

  it('resets state', () => {
    const { result } = renderHook(() => useGameSession(3))
    act(() => {
      result.current.addScore(1)
      result.current.next()
    })
    act(() => result.current.reset())
    expect(result.current.index).toBe(0)
    expect(result.current.score).toBe(0)
    expect(result.current.finished).toBe(false)
  })
})
