import { describe, it, expect, beforeEach } from 'vitest'
import { coinsFor, pickSticker, newlyUnlocked, recordResult, buyAvatar, equipAvatar, getRewards, STICKERS, type RewardState } from './rewards'

function baseState(over: Partial<RewardState> = {}): RewardState {
  return {
    coins: 0, ownedAvatars: ['bunny'], equippedAvatar: 'bunny', stickers: [], achievements: [],
    stats: { plays: 0, totalStars: 0, coinsEarnedTotal: 0, gamesPlayed: [], bestStarsByGame: {} },
    ...over,
  }
}

describe('rewards pure helpers', () => {
  it('coinsFor rewards effort + stars + new best', () => {
    expect(coinsFor(0, false)).toBe(5) // just for playing
    expect(coinsFor(3, false)).toBe(20)
    expect(coinsFor(3, true)).toBe(30)
    expect(coinsFor(99, false)).toBe(20) // clamped to 3 stars
  })

  it('pickSticker returns an uncollected one, or null when complete', () => {
    expect(pickSticker([], 0)).toBe('s0')
    const all = STICKERS.map((s) => s.id)
    expect(pickSticker(all, 0.5)).toBe(null)
  })

  it('newlyUnlocked fires first-steps after one play', () => {
    expect(newlyUnlocked(baseState())).not.toContain('first-steps')
    expect(newlyUnlocked(baseState({ stats: { ...baseState().stats, plays: 1 } }))).toContain('first-steps')
  })
})

describe('rewards store (localStorage)', () => {
  beforeEach(() => localStorage.clear())

  it('recordResult awards coins and updates stats', () => {
    const earned = recordResult({ gameId: 'geo', stars: 3, isNewBest: true }, () => 0.99) // no sticker drop
    // 30 coins for the round + 20 bonus for the first-steps + superstar? both unlock → 2*20
    const s = getRewards()
    expect(s.stats.plays).toBe(1)
    expect(s.stats.bestStarsByGame.geo).toBe(3)
    expect(s.coins).toBe(earned.coins)
    expect(earned.achievements.map((a) => a.id)).toContain('first-steps')
  })

  it('guarantees a sticker on a new best', () => {
    const earned = recordResult({ gameId: 'geo', stars: 1, isNewBest: true }, () => 0)
    expect(earned.stickers.length).toBe(1)
    expect(getRewards().stickers.length).toBe(1)
  })

  it('buy + equip an avatar deducts coins and equips it', () => {
    recordResult({ gameId: 'geo', stars: 3, isNewBest: true }, () => 0.99) // earn coins
    const before = getRewards().coins
    expect(buyAvatar('fox')).toBe(true)
    const after = getRewards()
    expect(after.coins).toBe(before - 30)
    expect(after.ownedAvatars).toContain('fox')
    expect(after.equippedAvatar).toBe('fox')
    equipAvatar('bunny')
    expect(getRewards().equippedAvatar).toBe('bunny')
  })

  it("won't buy an avatar you can't afford", () => {
    expect(buyAvatar('dragon')).toBe(false)
    expect(getRewards().ownedAvatars).not.toContain('dragon')
  })
})
