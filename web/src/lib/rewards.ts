import { useEffect, useState } from 'react'

// ---- Content ----------------------------------------------------------------

export type Avatar = { id: string; emoji: string; name: string; price: number }
export type Sticker = { id: string; emoji: string }
export type Achievement = { id: string; emoji: string; name: string; desc: string; test: (s: RewardState) => boolean }

export const DEFAULT_AVATAR = 'bunny'

export const AVATARS: Avatar[] = [
  { id: 'bunny', emoji: '🐰', name: 'Bunny', price: 0 },
  { id: 'fox', emoji: '🦊', name: 'Fox', price: 30 },
  { id: 'panda', emoji: '🐼', name: 'Panda', price: 40 },
  { id: 'penguin', emoji: '🐧', name: 'Penguin', price: 40 },
  { id: 'cat', emoji: '🐱', name: 'Cat', price: 50 },
  { id: 'frog', emoji: '🐸', name: 'Frog', price: 50 },
  { id: 'lion', emoji: '🦁', name: 'Lion', price: 70 },
  { id: 'octopus', emoji: '🐙', name: 'Octopus', price: 80 },
  { id: 'monkey', emoji: '🐵', name: 'Monkey', price: 80 },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', price: 120 },
  { id: 'robot', emoji: '🤖', name: 'Robot', price: 120 },
  { id: 'dragon', emoji: '🐲', name: 'Dragon', price: 150 },
  { id: 'alien', emoji: '👽', name: 'Alien', price: 150 },
]

export const STICKERS: Sticker[] = [
  '🐶', '🐱', '🦊', '🐼', '🐧', '🦁', '🐯', '🐸', '🐵', '🦄', '🐙', '🐢',
  '🦋', '🐝', '🌈', '🚀', '🪐', '⭐', '🍩', '🍦', '🎈', '🏆', '👑', '💎',
].map((emoji, i) => ({ id: `s${i}`, emoji }))

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', emoji: '🌱', name: 'First Steps', desc: 'Play your first game', test: (s) => s.stats.plays >= 1 },
  { id: 'superstar', emoji: '⭐', name: 'Superstar', desc: 'Get 3 stars in a game', test: (s) => Object.values(s.stats.bestStarsByGame).some((v) => v >= 3) },
  { id: 'explorer', emoji: '🧭', name: 'Explorer', desc: 'Play 3 different games', test: (s) => s.stats.gamesPlayed.length >= 3 },
  { id: 'adventurer', emoji: '🗺️', name: 'Adventurer', desc: 'Play 6 different games', test: (s) => s.stats.gamesPlayed.length >= 6 },
  { id: 'persistent', emoji: '💪', name: 'Never Give Up', desc: 'Play 15 rounds', test: (s) => s.stats.plays >= 15 },
  { id: 'star-gazer', emoji: '🌟', name: 'Star Gazer', desc: 'Earn 25 stars', test: (s) => s.stats.totalStars >= 25 },
  { id: 'coin-collector', emoji: '🪙', name: 'Coin Collector', desc: 'Earn 100 coins', test: (s) => s.stats.coinsEarnedTotal >= 100 },
  { id: 'rich', emoji: '💰', name: 'Rich!', desc: 'Earn 500 coins', test: (s) => s.stats.coinsEarnedTotal >= 500 },
  { id: 'fashionista', emoji: '👕', name: 'Fashionista', desc: 'Own 3 avatars', test: (s) => s.ownedAvatars.length >= 3 },
  { id: 'sticker-star', emoji: '🌈', name: 'Sticker Star', desc: 'Collect 10 stickers', test: (s) => s.stickers.length >= 10 },
  { id: 'collector', emoji: '📖', name: 'Master Collector', desc: 'Collect every sticker', test: (s) => s.stickers.length >= STICKERS.length },
]

// ---- State ------------------------------------------------------------------

export type RewardState = {
  coins: number
  ownedAvatars: string[]
  equippedAvatar: string
  stickers: string[]
  achievements: string[]
  stats: {
    plays: number
    totalStars: number
    coinsEarnedTotal: number
    gamesPlayed: string[]
    bestStarsByGame: Record<string, number>
  }
}

const KEY = 'funtime:rewards'

function fresh(): RewardState {
  return {
    coins: 0,
    ownedAvatars: [DEFAULT_AVATAR],
    equippedAvatar: DEFAULT_AVATAR,
    stickers: [],
    achievements: [],
    stats: { plays: 0, totalStars: 0, coinsEarnedTotal: 0, gamesPlayed: [], bestStarsByGame: {} },
  }
}

export function getRewards(): RewardState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fresh()
    return { ...fresh(), ...JSON.parse(raw), stats: { ...fresh().stats, ...JSON.parse(raw).stats } }
  } catch {
    return fresh()
  }
}

function save(s: RewardState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
  notify()
}

// ---- Pure helpers (unit-tested) --------------------------------------------

/** Coins for finishing a round — rewards effort, not just winning. */
export function coinsFor(stars: number, isNewBest: boolean): number {
  return 5 + Math.max(0, Math.min(3, stars)) * 5 + (isNewBest ? 10 : 0)
}

/** The achievement ids newly satisfied by `state` that aren't already unlocked. */
export function newlyUnlocked(state: RewardState): string[] {
  return ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id) && a.test(state)).map((a) => a.id)
}

/** Pick an uncollected sticker id, or null if the album is complete. `rand` ∈ [0,1). */
export function pickSticker(collected: string[], rand: number): string | null {
  const remaining = STICKERS.filter((s) => !collected.includes(s.id))
  if (remaining.length === 0) return null
  return remaining[Math.floor(rand * remaining.length) % remaining.length].id
}

// ---- Mutations --------------------------------------------------------------

export type GameResult = { gameId: string; stars: number; isNewBest: boolean }
export type Earned = { coins: number; stickers: Sticker[]; achievements: Achievement[] }

const ACHIEVEMENT_BONUS = 20

/** Record a finished round: award coins, roll a sticker, unlock achievements. */
export function recordResult(r: GameResult, rng: () => number = Math.random): Earned {
  const s = getRewards()
  const stars = Math.max(0, Math.min(3, r.stars))

  let coins = coinsFor(stars, r.isNewBest)
  s.stats.plays += 1
  s.stats.totalStars += stars
  s.stats.bestStarsByGame[r.gameId] = Math.max(s.stats.bestStarsByGame[r.gameId] ?? 0, stars)
  if (!s.stats.gamesPlayed.includes(r.gameId)) s.stats.gamesPlayed.push(r.gameId)

  // Sticker: guaranteed on a new best, otherwise a 50% surprise drop.
  const stickers: Sticker[] = []
  if (r.isNewBest || rng() < 0.5) {
    const id = pickSticker(s.stickers, rng())
    if (id) {
      s.stickers.push(id)
      const st = STICKERS.find((x) => x.id === id)
      if (st) stickers.push(st)
    }
  }

  // Coins are counted toward the total before evaluating coin-based achievements.
  s.coins += coins
  s.stats.coinsEarnedTotal += coins

  const achievements: Achievement[] = []
  for (const id of newlyUnlocked(s)) {
    s.achievements.push(id)
    const a = ACHIEVEMENTS.find((x) => x.id === id)
    if (a) achievements.push(a)
  }
  if (achievements.length) {
    const bonus = achievements.length * ACHIEVEMENT_BONUS
    s.coins += bonus
    s.stats.coinsEarnedTotal += bonus
    coins += bonus
  }

  save(s)
  return { coins, stickers, achievements }
}

export function buyAvatar(id: string): boolean {
  const s = getRewards()
  const a = AVATARS.find((x) => x.id === id)
  if (!a || s.ownedAvatars.includes(id) || s.coins < a.price) return false
  s.coins -= a.price
  s.ownedAvatars.push(id)
  s.equippedAvatar = id
  save(s)
  return true
}

export function equipAvatar(id: string): void {
  const s = getRewards()
  if (!s.ownedAvatars.includes(id)) return
  s.equippedAvatar = id
  save(s)
}

export function avatarEmoji(id: string): string {
  return AVATARS.find((a) => a.id === id)?.emoji ?? '🐰'
}

// ---- Subscription hook ------------------------------------------------------

const listeners = new Set<() => void>()
function notify() { listeners.forEach((f) => f()) }

export function useRewards(): RewardState {
  const [, force] = useState(0)
  useEffect(() => {
    const fn = () => force((n) => n + 1)
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])
  return getRewards()
}
