import { useEffect, useState } from 'react'

// ---- Content ----------------------------------------------------------------

export type Avatar = { id: string; emoji: string; name: string; price: number }
export type Sticker = { id: string; emoji: string }
export type Achievement = { id: string; emoji: string; name: string; desc: string; test: (s: RewardState) => boolean }
export type Theme = { 
  id: string; name: string; emoji: string; price: number; 
  bgFrom: string; bgTo: string; bgVia?: string;
  primary: string; secondary: string; accent: string;
  cardBg: string; cardBorder: string;
  textHeading: string; textBody: string; textMuted: string;
  pattern?: 'dots'|'stars'|'hearts'|'waves'|'grid'|'confetti'|'bubbles'|'sparkles'|'clouds'|'scales'|'none'; 
  isDark?: boolean;
  radius?: string; // e.g. '1.5rem' '2rem'
  funEmojis?: string[]; // floating decoration emojis
  headerEmoji?: string; // replaces default 🎈 in header maybe
  animation?: 'shimmer'|'float'|'pulse'|'glow'|'none';
  funShape?: 'wavy'|'rounded'|'sharp'|'cloud'|'star';
  mascotEmoji?: string;
  rarity?: 'common'|'rare'|'epic'|'legendary';
}

export const DEFAULT_AVATAR = 'bunny'
export const DEFAULT_THEME = 'sunny'

export const AVATARS: Avatar[] = [
  { id: 'bunny', emoji: '🐰', name: 'Bunny', price: 0 },
  // Common cute animals 25-35
  { id: 'puppy', emoji: '🐶', name: 'Puppy', price: 25 },
  { id: 'hamster', emoji: '🐹', name: 'Hamster', price: 25 },
  { id: 'mouse', emoji: '🐭', name: 'Mouse', price: 25 },
  { id: 'fox', emoji: '🦊', name: 'Fox', price: 30 },
  { id: 'bee', emoji: '🐝', name: 'Bee', price: 30 },
  { id: 'ladybird', emoji: '🐞', name: 'Ladybird', price: 30 },
  { id: 'turtle', emoji: '🐢', name: 'Turtle', price: 35 },
  { id: 'hedgehog', emoji: '🦔', name: 'Hedgehog', price: 35 },
  { id: 'badger', emoji: '🦡', name: 'Badger', price: 35 },
  // Rare animals and nature 40-60
  { id: 'panda', emoji: '🐼', name: 'Panda', price: 40 },
  { id: 'penguin', emoji: '🐧', name: 'Penguin', price: 40 },
  { id: 'cat', emoji: '🐱', name: 'Cat', price: 45 },
  { id: 'frog', emoji: '🐸', name: 'Frog', price: 45 },
  { id: 'swan', emoji: '🦢', name: 'Swan', price: 55 },
  { id: 'flamingo', emoji: '🦩', name: 'Flamingo', price: 50 },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly', price: 40 },
  { id: 'dolphin', emoji: '🐬', name: 'Dolphin', price: 45 },
  { id: 'seal', emoji: '🦭', name: 'Seal', price: 40 },
  { id: 'crab', emoji: '🦀', name: 'Crab', price: 35 },
  { id: 'koala', emoji: '🐨', name: 'Koala', price: 50 },
  { id: 'owl', emoji: '🦉', name: 'Owl', price: 40 },
  // Flowers nature pastel 25-40
  { id: 'cherry-blossom', emoji: '🌸', name: 'Cherry Blossom', price: 30 },
  { id: 'sunflower', emoji: '🌻', name: 'Sunflower', price: 35 },
  { id: 'tulip', emoji: '🌷', name: 'Tulip', price: 30 },
  { id: 'rose', emoji: '🌹', name: 'Rose', price: 40 },
  { id: 'hibiscus', emoji: '🌺', name: 'Hibiscus', price: 35 },
  { id: 'daisy', emoji: '🌼', name: 'Daisy', price: 25 },
  // Sweets food fun 30-45
  { id: 'strawberry', emoji: '🍓', name: 'Strawberry', price: 30 },
  { id: 'ice-cream', emoji: '🍦', name: 'Ice Cream', price: 30 },
  { id: 'donut', emoji: '🍩', name: 'Donut', price: 35 },
  { id: 'cupcake', emoji: '🧁', name: 'Cupcake', price: 35 },
  { id: 'cookie', emoji: '🍪', name: 'Cookie', price: 30 },
  { id: 'lollipop', emoji: '🍭', name: 'Lollipop', price: 30 },
  { id: 'pizza', emoji: '🍕', name: 'Pizza', price: 40 },
  { id: 'bubble-tea', emoji: '🧋', name: 'Bubble Tea', price: 50 },
  // Fashion sparkle 40-80
  { id: 'dress', emoji: '👗', name: 'Dress', price: 60 },
  { id: 'crown', emoji: '👑', name: 'Crown', price: 90 },
  { id: 'high-heel', emoji: '👠', name: 'High Heel', price: 45 },
  { id: 'bow', emoji: '🎀', name: 'Ribbon Bow', price: 30 },
  { id: 'gem', emoji: '💎', name: 'Gem', price: 80 },
  { id: 'handbag', emoji: '👜', name: 'Handbag', price: 40 },
  // UK and objects distinct
  { id: 'teddy', emoji: '🧸', name: 'Teddy Bear', price: 40 },
  { id: 'castle', emoji: '🏰', name: 'Castle', price: 70 },
  { id: 'train', emoji: '🚂', name: 'Steam Train', price: 55 },
  { id: 'bus', emoji: '🚌', name: 'Double Decker', price: 50 },
  { id: 'teapot', emoji: '🫖', name: 'Teapot', price: 35 },
  { id: 'umbrella', emoji: '☂️', name: 'Umbrella', price: 30 },
  // Space sparkle
  { id: 'rocket', emoji: '🚀', name: 'Rocket', price: 70 },
  { id: 'saturn', emoji: '🪐', name: 'Saturn', price: 50 },
  { id: 'comet', emoji: '☄️', name: 'Comet', price: 40 },
  { id: 'saucer', emoji: '🛸', name: 'Flying Saucer', price: 85 },
  { id: 'star-glow', emoji: '🌟', name: 'Glowing Star', price: 30 },
  // Epic rare animals already partly covered
  { id: 'lion', emoji: '🦁', name: 'Lion', price: 70 },
  { id: 'tiger', emoji: '🐯', name: 'Tiger', price: 60 },
  { id: 'giraffe', emoji: '🦒', name: 'Giraffe', price: 70 },
  { id: 'zebra', emoji: '🦓', name: 'Zebra', price: 70 },
  { id: 'hippo', emoji: '🦛', name: 'Hippo', price: 80 },
  { id: 'rhino', emoji: '🦏', name: 'Rhino', price: 90 },
  { id: 'whale', emoji: '🐳', name: 'Whale', price: 80 },
  { id: 'shark', emoji: '🦈', name: 'Shark', price: 90 },
  { id: 'octopus', emoji: '🐙', name: 'Octopus', price: 80 },
  { id: 'monkey', emoji: '🐵', name: 'Monkey', price: 80 },
  // Fantasy legendary
  { id: 'fairy', emoji: '🧚', name: 'Fairy', price: 100 },
  { id: 'elf', emoji: '🧝', name: 'Elf', price: 95 },
  { id: 'mermaid', emoji: '🧜‍♀️', name: 'Mermaid', price: 110 },
  { id: 'mage', emoji: '🧙‍♀️', name: 'Mage', price: 110 },
  { id: 'genie', emoji: '🧞‍♀️', name: 'Genie', price: 125 },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', price: 120 },
  { id: 'robot', emoji: '🤖', name: 'Robot', price: 120 },
  { id: 'dragon', emoji: '🐲', name: 'Dragon', price: 150 },
  { id: 'alien', emoji: '👽', name: 'Alien', price: 150 },
  // Object profession proxies distinct silhouette
  { id: 'stethoscope', emoji: '🩺', name: 'Stethoscope', price: 50 },
  { id: 'test-tube', emoji: '🧪', name: 'Test Tube', price: 50 },
  { id: 'palette', emoji: '🎨', name: 'Artist Palette', price: 60 },
  { id: 'books', emoji: '📚', name: 'Books', price: 40 },
  { id: 'police-hat', emoji: '👮‍♀️', name: 'Police Officer', price: 65 },
]

export const THEMES: Theme[] = [
  { id: 'sunny', name: 'Sunny Day', emoji: '☀️', price: 0, bgFrom: '#fff7ed', bgTo: '#fed7aa', bgVia: '#ffe8b5', primary: '#f59e0b', secondary: '#ea580c', accent: '#fcd34d', cardBg: '#ffffff', cardBorder: '#fde68a', textHeading: '#92400e', textBody: '#78350f', textMuted: '#a16207', pattern: 'dots', radius: '1.5rem', funEmojis: ['☀️','🌻','🦋'], headerEmoji: '🎈', rarity: 'common', animation: 'none', funShape: 'rounded' },
  { id: 'mermaid-lagoon', name: 'Mermaid Lagoon', emoji: '🧜‍♀️', price: 0, bgFrom: '#cffafe', bgTo: '#5eead4', bgVia: '#a5f3fc', primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9', cardBg: '#ecfeff', cardBorder: '#a5f3fc', textHeading: '#0e7490', textBody: '#155e75', textMuted: '#0891b2', pattern: 'waves', radius: '2rem', funEmojis: ['🧜‍♀️','🐚','🐬','🌊','💎','🐠'], headerEmoji: '🧜‍♀️', rarity: 'common', animation: 'float', funShape: 'wavy' },
  { id: 'enchanted-forest', name: 'Enchanted Forest', emoji: '🌿', price: 0, bgFrom: '#d1fae5', bgTo: '#a7f3d0', bgVia: '#bbf7d0', primary: '#10b981', secondary: '#059669', accent: '#6ee7b7', cardBg: '#f0fdf4', cardBorder: '#a7f3d0', textHeading: '#065f46', textBody: '#064e3b', textMuted: '#059669', pattern: 'dots', radius: '1.5rem', funEmojis: ['🌿','🍄','🦋','🐸','🌼','🐞'], headerEmoji: '🌳', rarity: 'common', animation: 'none', funShape: 'rounded' },
  { id: 'lavender-dreams', name: 'Lavender Dreams', emoji: '💜', price: 0, bgFrom: '#f5f3ff', bgTo: '#ddd6fe', bgVia: '#e9d5ff', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#c4b5fd', cardBg: '#ffffff', cardBorder: '#ddd6fe', textHeading: '#5b21b6', textBody: '#4c1d95', textMuted: '#7c3aed', pattern: 'stars', radius: '2rem', funEmojis: ['💜','🌙','⭐','🦄','🔮','✨'], headerEmoji: '💜', rarity: 'common', animation: 'float', funShape: 'cloud' },
  { id: 'ocean-sparkle', name: 'Ocean Sparkle', emoji: '🌊', price: 0, bgFrom: '#dbeafe', bgTo: '#7dd3fc', bgVia: '#bae6fd', primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', cardBg: '#f0f9ff', cardBorder: '#7dd3fc', textHeading: '#075985', textBody: '#0c4a6e', textMuted: '#0284c7', pattern: 'waves', radius: '1.5rem', funEmojis: ['🌊','🐬','🐚','⭐','🐠','💙'], headerEmoji: '🌊', rarity: 'common', animation: 'none', funShape: 'wavy' },
  { id: 'sunset-glow', name: 'Sunset Glow', emoji: '🌅', price: 0, bgFrom: '#fed7aa', bgTo: '#fda4af', bgVia: '#fecdd3', primary: '#f97316', secondary: '#ec4899', accent: '#fb7185', cardBg: '#fff7ed', cardBorder: '#fed7aa', textHeading: '#9a3412', textBody: '#7c2d12', textMuted: '#c2410c', pattern: 'confetti', radius: '1.5rem', funEmojis: ['🌅','🌞','🌺','🦩','🍉','🧡'], headerEmoji: '🌅', rarity: 'common', animation: 'pulse', funShape: 'rounded' },
  { id: 'fairy-garden', name: 'Fairy Garden', emoji: '🧚', price: 0, bgFrom: '#ecfdf5', bgTo: '#fce7f3', bgVia: '#f0fdfa', primary: '#d946ef', secondary: '#10b981', accent: '#f9a8d4', cardBg: '#ffffff', cardBorder: '#fbcfe8', textHeading: '#701a75', textBody: '#831843', textMuted: '#be185d', pattern: 'hearts', radius: '2rem', funEmojis: ['🧚','🌸','🦋','🌼','🍄','✨'], headerEmoji: '🧚', rarity: 'rare', animation: 'float', funShape: 'cloud', mascotEmoji: '🧚' },
  { id: 'rainbow-sprinkles', name: 'Rainbow Sprinkles', emoji: '🌈', price: 0, bgFrom: '#ffffff', bgTo: '#fdf4ff', bgVia: '#fae8ff', primary: '#ec4899', secondary: '#8b5cf6', accent: '#facc15', cardBg: '#ffffff', cardBorder: '#fbcfe8', textHeading: '#831843', textBody: '#4c1d95', textMuted: '#be185d', pattern: 'confetti', radius: '2rem', funEmojis: ['🌈','🍭','🍩','🎈','⭐','🦄'], headerEmoji: '🌈', rarity: 'rare', animation: 'pulse', funShape: 'star' },
  { id: 'galaxy-night', name: 'Galaxy Night', emoji: '🌌', price: 0, bgFrom: '#312e81', bgTo: '#6d28d9', bgVia: '#4c1d95', primary: '#a855f7', secondary: '#ec4899', accent: '#c084fc', cardBg: '#1e1b4b', cardBorder: '#5b21b6', textHeading: '#f5f3ff', textBody: '#e9d5ff', textMuted: '#c4b5fd', pattern: 'stars', isDark: true, radius: '1.5rem', funEmojis: ['🌌','🌙','⭐','🪐','🚀','✨'], headerEmoji: '🚀', rarity: 'epic', animation: 'shimmer', funShape: 'star', mascotEmoji: '🚀' },
  { id: 'unicorn-magic', name: 'Unicorn Magic', emoji: '🦄', price: 0, bgFrom: '#fdf2f8', bgTo: '#dbeafe', bgVia: '#fae8ff', primary: '#ec4899', secondary: '#8b5cf6', accent: '#f9a8d4', cardBg: '#ffffff', cardBorder: '#fbcfe8', textHeading: '#831843', textBody: '#701a75', textMuted: '#be185d', pattern: 'stars', radius: '2rem', funEmojis: ['🦄','🌈','⭐','💎','🦋','💖'], headerEmoji: '🦄', rarity: 'epic', animation: 'shimmer', funShape: 'star', mascotEmoji: '🦄' },
  { id: 'mermaid-princess', name: 'Mermaid Princess', emoji: '🧜‍♀️', price: 0, bgFrom: '#ccfbf1', bgTo: '#fce7f3', bgVia: '#e0e7ff', primary: '#14b8a6', secondary: '#a78bfa', accent: '#5eead4', cardBg: '#f5fffe', cardBorder: '#99f6e4', textHeading: '#0f766e', textBody: '#115e59', textMuted: '#0d9488', pattern: 'waves', radius: '2rem', funEmojis: ['🧜‍♀️','🐚','💎','🌊','🐬','👑'], headerEmoji: '👑', rarity: 'epic', animation: 'glow', funShape: 'wavy', mascotEmoji: '🧜‍♀️' },
  { id: 'royal-castle', name: 'Royal Castle', emoji: '🏰', price: 0, bgFrom: '#fffbeb', bgTo: '#fef3c7', bgVia: '#fde68a', primary: '#d97706', secondary: '#92400e', accent: '#fbbf24', cardBg: '#fffff7', cardBorder: '#fde68a', textHeading: '#78350f', textBody: '#92400e', textMuted: '#b45309', pattern: 'grid', radius: '1rem', funEmojis: ['🏰','👑','⚔️','🛡️','💎','🐴'], headerEmoji: '🏰', rarity: 'epic', animation: 'glow', funShape: 'sharp', mascotEmoji: '👑' },
  { id: 'midnight-ocean', name: 'Midnight Ocean', emoji: '🌙', price: 0, bgFrom: '#0f172a', bgTo: '#134e4a', bgVia: '#1e293b', primary: '#22d3ee', secondary: '#a78bfa', accent: '#67e8f9', cardBg: '#1e293b', cardBorder: '#334155', textHeading: '#e0f2fe', textBody: '#bae6fd', textMuted: '#7dd3fc', pattern: 'dots', isDark: true, radius: '1.5rem', funEmojis: ['🌙','⭐','🐋','🌊','💎','🔮'], headerEmoji: '🌙', rarity: 'legendary', animation: 'shimmer', funShape: 'wavy', mascotEmoji: '🐋' },
]

export const STICKERS: Sticker[] = [
  // Starter mix 24 existing kept for backward compat order first 24
  '🐶','🐱','🦊','🐼','🐧','🦁','🐯','🐸','🐵','🦄','🐙','🐢',
  '🦋','🐝','🌈','🚀','🪐','⭐','🍩','🍦','🎈','🏆','👑','💎',
  // Cute pets set 12 new
  '🐰','🐹','🐭','🐨','🦉','🦔','🦡','🦝','🦘','🦒','🦓','🦜',
  // Fantasy sparkle set 12
  '🧚','🧜‍♀️','🧙‍♀️','🧞‍♀️','🧝‍♀️','🪄','✨','💫','🌟','🦄','🐲','👑',
  // Flowers garden set 12
  '🌸','🌻','🌷','🌹','🌺','🌼','🌿','🌱','🌾','🍀','🌵','🌲',
  // Sweets treats set 12
  '🍓','🧁','🍪','🍭','🍰','🍕','🧋','🍉','🍇','🍒','🍌','🥕',
  // Sea sparkle set 12
  '🐬','🐳','🦈','🦭','🦀','🐠','🦑','🦞','🦐','🐚','🌊','🐡',
  // Space magic set 12
  '🚀','🛸','👾','🪐','☄️','🌙','🌌','🛰️','👩‍🚀','🧑‍🚀','🌟','💫',
].map((emoji, i) => ({ id: `s${i}`, emoji }))

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', emoji: '🌱', name: 'First Steps', desc: 'Play your first game', test: (s) => s.stats.plays >= 1 },
  { id: 'getting-started', emoji: '🐣', name: 'Getting Started', desc: 'Play 5 rounds', test: (s) => s.stats.plays >= 5 },
  { id: 'persistent', emoji: '💪', name: 'Never Give Up', desc: 'Play 15 rounds', test: (s) => s.stats.plays >= 15 },
  { id: 'dedicated', emoji: '🎯', name: 'Dedicated', desc: 'Play 50 rounds', test: (s) => s.stats.plays >= 50 },
  { id: 'marathon', emoji: '🏃‍♀️', name: 'Marathon', desc: 'Play 100 rounds', test: (s) => s.stats.plays >= 100 },
  { id: 'century', emoji: '💯', name: 'Century Club', desc: 'Play 250 rounds', test: (s) => s.stats.plays >= 250 },
  { id: 'superstar', emoji: '⭐', name: 'Superstar', desc: 'Get 3 stars in a game', test: (s) => Object.values(s.stats.bestStarsByGame).some((v) => v >= 3) },
  { id: 'rising-star', emoji: '🌠', name: 'Rising Star', desc: 'Earn 10 stars total', test: (s) => s.stats.totalStars >= 10 },
  { id: 'star-gazer', emoji: '🌟', name: 'Star Gazer', desc: 'Earn 25 stars', test: (s) => s.stats.totalStars >= 25 },
  { id: 'constellation', emoji: '✨', name: 'Constellation', desc: 'Earn 50 stars', test: (s) => s.stats.totalStars >= 50 },
  { id: 'galaxy', emoji: '🌌', name: 'Galaxy', desc: 'Earn 100 stars', test: (s) => s.stats.totalStars >= 100 },
  { id: 'universe', emoji: '🪐', name: 'Universe', desc: 'Earn 200 stars', test: (s) => s.stats.totalStars >= 200 },
  { id: 'explorer', emoji: '🧭', name: 'Explorer', desc: 'Play 3 different games', test: (s) => s.stats.gamesPlayed.length >= 3 },
  { id: 'adventurer', emoji: '🗺️', name: 'Adventurer', desc: 'Play 6 different games', test: (s) => s.stats.gamesPlayed.length >= 6 },
  { id: 'tourist', emoji: '🧳', name: 'Tourist', desc: 'Play 9 different games', test: (s) => s.stats.gamesPlayed.length >= 9 },
  { id: 'master-explorer', emoji: '🏅', name: 'Master Explorer', desc: 'Play every game mode', test: (s) => s.stats.gamesPlayed.length >= 11 },
  { id: 'perfectionist', emoji: '🎯', name: 'Perfectionist', desc: 'Get 3 stars in 3 different games', test: (s) => Object.values(s.stats.bestStarsByGame).filter(v=>v>=3).length >= 3 },
  { id: 'polyglot-star', emoji: '🌈', name: 'Polyglot Star', desc: 'Get 3 stars in 5 different games', test: (s) => Object.values(s.stats.bestStarsByGame).filter(v=>v>=3).length >= 5 },
  { id: 'grandmaster', emoji: '👑', name: 'Grandmaster', desc: 'Get 3 stars in every game', test: (s) => Object.values(s.stats.bestStarsByGame).filter(v=>v>=3).length >= 11 },
  { id: 'coin-collector', emoji: '🪙', name: 'Coin Collector', desc: 'Earn 100 coins total', test: (s) => s.stats.coinsEarnedTotal >= 100 },
  { id: 'saver', emoji: '🐷', name: 'Saver', desc: 'Earn 250 coins total', test: (s) => s.stats.coinsEarnedTotal >= 250 },
  { id: 'rich', emoji: '💰', name: 'Rich!', desc: 'Earn 500 coins', test: (s) => s.stats.coinsEarnedTotal >= 500 },
  { id: 'millionaire', emoji: '💎', name: 'Millionaire', desc: 'Earn 1000 coins', test: (s) => s.stats.coinsEarnedTotal >= 1000 },
  { id: 'tycoon', emoji: '🏦', name: 'Tycoon', desc: 'Earn 2000 coins', test: (s) => s.stats.coinsEarnedTotal >= 2000 },
  { id: 'shopaholic', emoji: '🛍️', name: 'Shopaholic', desc: 'Buy your first avatar', test: (s) => s.ownedAvatars.length >= 2 },
  { id: 'fashionista', emoji: '👕', name: 'Fashionista', desc: 'Own 3 avatars', test: (s) => s.ownedAvatars.length >= 3 },
  { id: 'wardrobe', emoji: '👗', name: 'Wardrobe', desc: 'Own 6 avatars', test: (s) => s.ownedAvatars.length >= 6 },
  { id: 'collector-avatars', emoji: '🧸', name: 'Avatar Collector', desc: 'Own 10 avatars', test: (s) => s.ownedAvatars.length >= 10 },
  { id: 'style-icon', emoji: '💃', name: 'Style Icon', desc: 'Own 20 avatars', test: (s) => s.ownedAvatars.length >= 20 },
  { id: 'completionist-avatar', emoji: '🌟', name: 'Avatar Master', desc: 'Own every avatar', test: (s) => s.ownedAvatars.length >= AVATARS.length },
  { id: 'sticker-novice', emoji: '🌼', name: 'Sticker Novice', desc: 'Collect 5 stickers', test: (s) => s.stickers.length >= 5 },
  { id: 'sticker-star', emoji: '🌈', name: 'Sticker Star', desc: 'Collect 10 stickers', test: (s) => s.stickers.length >= 10 },
  { id: 'sticker-fan', emoji: '📒', name: 'Sticker Fan', desc: 'Collect 25 stickers', test: (s) => s.stickers.length >= 25 },
  { id: 'sticker-expert', emoji: '📘', name: 'Sticker Expert', desc: 'Collect 50 stickers', test: (s) => s.stickers.length >= 50 },
  { id: 'collector', emoji: '📖', name: 'Master Collector', desc: 'Collect every sticker', test: (s) => s.stickers.length >= STICKERS.length },
]

// ---- State ------------------------------------------------------------------

export type RewardState = {
  coins: number
  ownedAvatars: string[]
  equippedAvatar: string
  ownedThemes?: string[]
  equippedTheme?: string
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
    ownedThemes: THEMES.map(t=>t.id), // all themes unlocked for testing phase; later restrict to [DEFAULT_THEME] when coin shop enabled
    equippedTheme: DEFAULT_THEME,
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

export function themeById(id: string) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export function buyTheme(id: string): boolean {
  const s = getRewards()
  const t = THEMES.find((x) => x.id === id)
  const owned = s.ownedThemes ?? []
  if (!t || owned.includes(id) || s.coins < t.price) return false
  s.coins -= t.price
  s.ownedThemes = [...owned, id]
  s.equippedTheme = id
  save(s)
  return true
}

export function equipTheme(id: string): void {
  const s = getRewards()
  const owned = s.ownedThemes ?? [DEFAULT_THEME]
  if (!owned.includes(id)) return
  s.equippedTheme = id
  save(s)
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
