import { useState } from 'react'
import { sound } from '../lib/sound'
import { useRewards, buyAvatar, equipAvatar, AVATARS, STICKERS, ACHIEVEMENTS, THEMES, equipTheme } from '../lib/rewards'

type Tab = 'avatars' | 'stickers' | 'trophies' | 'themes'

export default function Backpack() {
  const r = useRewards()
  const [tab, setTab] = useState<Tab>('avatars')

  return (
    <div className="mx-auto max-w-3xl p-6" style={{ color: 'var(--text-body)' }}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-heading)' }}>My Backpack 🎒</h1>
        <span className="rounded-full px-4 py-1.5 font-bold shadow" style={{ backgroundColor: 'var(--accent)', color: 'var(--text-heading)' }}>🪙 {r.coins}</span>
      </div>

      {/* Kid-friendly "how to earn" explainer */}
      <div className="mb-6 rounded-3xl border-2 p-4 shadow-sm" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--card-bg)', color: 'var(--text-body)', borderRadius: 'var(--radius)' }}>
        <p className="text-center text-lg font-extrabold">How do I get coins? 🪙</p>
        <ul className="mx-auto mt-2 max-w-md space-y-1 text-sm font-semibold">
          <li>🎮 <b>Play any game</b> — you get coins just for trying!</li>
          <li>⭐ <b>Earn more stars</b> to get more coins.</li>
          <li>🏅 <b>Beat your best score</b> for a bonus and a surprise sticker!</li>
          <li>🛍️ <b>Spend coins</b> here on cool avatars and themes.</li>
          <li>🏆 Keep playing to unlock <b>trophies</b> and fill your <b>sticker album</b>!</li>
          <li>🎨 Try different <b>themes</b> to change colours across the whole app!</li>
        </ul>
      </div>

      <div className="mb-6 flex justify-center gap-2 flex-wrap">
        {([
          { id: 'avatars', label: '🧑‍🚀 Avatars' },
          { id: 'themes', label: `🎨 Themes (${(r.ownedThemes?.length ?? 0)}/${THEMES.length})` },
          { id: 'stickers', label: `🌟 Stickers (${r.stickers.length}/${STICKERS.length})` },
          { id: 'trophies', label: `🏆 Trophies (${r.achievements.length}/${ACHIEVEMENTS.length})` },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => { sound.click(); setTab(t.id) }}
            className="rounded-full px-4 py-2 text-sm font-bold shadow transition"
            style={ tab === t.id ? { backgroundColor: 'var(--primary)', color: 'white' } : { backgroundColor: 'var(--card-bg)', color: 'var(--text-heading)', border: '2px solid var(--card-border)' } }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'avatars' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {AVATARS.map((a) => {
            const owned = r.ownedAvatars.includes(a.id)
            const equipped = r.equippedAvatar === a.id
            const canBuy = !owned && r.coins >= a.price
            return (
              <div key={a.id} className="flex flex-col items-center border-2 p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: equipped ? 'var(--primary)' : 'var(--card-border)', borderRadius: 'var(--radius)' }}>
                <div className="text-5xl">{a.emoji}</div>
                <div className="mt-1 font-bold" style={{ color: 'var(--text-body)' }}>{a.name}</div>
                {owned ? (
                  <button
                    onClick={() => { sound.click(); equipAvatar(a.id) }}
                    disabled={equipped}
                    className="mt-2 rounded-full px-4 py-1.5 text-sm font-bold shadow"
                    style={ equipped ? { backgroundColor: 'var(--card-bg)', color: 'var(--primary)', border: '2px solid var(--primary)' } : { backgroundColor: 'var(--primary)', color: 'white' } }
                  >
                    {equipped ? 'Equipped ✓' : 'Wear'}
                  </button>
                ) : (
                  <button
                    onClick={() => { if (buyAvatar(a.id)) sound.correct(); else sound.wrong() }}
                    disabled={!canBuy}
                    className="mt-2 rounded-full px-4 py-1.5 text-sm font-bold shadow disabled:opacity-40"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--text-heading)' }}
                  >
                    🪙 {a.price}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'themes' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {THEMES.map((t) => {
            const owned = (r.ownedThemes ?? []).includes(t.id)
            const equipped = (r.equippedTheme ?? 'sunny') === t.id
            const rarity = (t as any).rarity || 'common'
            const rarityBadge = rarity === 'legendary' ? '👑 Legendary' : rarity === 'epic' ? '✨ Epic' : rarity === 'rare' ? '💎 Rare' : '🌱 Common'
            const rarityColor = rarity === 'legendary' ? '#fbbf24' : rarity === 'epic' ? '#a855f7' : rarity === 'rare' ? '#0ea5e9' : '#10b981'
            const animClass = t.animation === 'shimmer' ? 'theme-shimmer' : t.animation === 'glow' ? 'theme-glow' : t.animation === 'float' ? 'theme-float' : t.animation === 'pulse' ? 'theme-bounce-slow' : ''
            return (
              <div key={t.id} className={`flex flex-col items-center border-2 p-4 shadow-sm relative overflow-hidden ${animClass}`} style={{ background: `linear-gradient(135deg, ${t.bgFrom}, ${t.bgTo})`, borderColor: equipped ? 'var(--primary)' : 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius)', boxShadow: equipped ? '0 0 0 3px var(--accent), 0 10px 28px rgba(0,0,0,0.15)' : '0 6px 16px rgba(0,0,0,0.1)' }}>
                <div className="absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow" style={{ backgroundColor: rarityColor, color: 'white' }}>{rarity.toUpperCase()}</div>
                <div className="text-5xl drop-shadow" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}>{t.emoji}</div>
                <div className="mt-1 font-bold text-center" style={{ color: t.isDark ? '#fff' : '#1e293b', textShadow: t.isDark ? '0 1px 3px rgba(0,0,0,0.6)' : '0 1px 2px rgba(255,255,255,0.9)' }}>{t.name}</div>
                <div className="text-[10px] opacity-70" style={{ color: t.isDark ? '#ddd' : '#334155' }}>{rarityBadge}</div>
                <div className="mt-1 flex gap-1">
                  <div className="h-4 w-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: t.primary }} title="primary" />
                  <div className="h-4 w-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: t.secondary }} title="secondary" />
                  <div className="h-4 w-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: t.cardBg }} title="card" />
                </div>
                {owned ? (
                  <button
                    onClick={() => { sound.click(); equipTheme(t.id) }}
                    disabled={equipped}
                    className="mt-2 rounded-full px-4 py-1.5 text-sm font-bold shadow"
                    style={ equipped ? { backgroundColor: 'rgba(255,255,255,0.85)', color: t.primary, border: '2px solid white' } : { backgroundColor: 'var(--primary)', color: 'white' } }
                  >
                    {equipped ? 'Active ✓' : 'Use Theme'}
                  </button>
                ) : (
                  <button
                    disabled={true}
                    className="mt-2 rounded-full px-4 py-1.5 text-sm font-bold shadow"
                    style={{ backgroundColor: 'rgba(100,100,100,0.25)', color: 'rgba(255,255,255,0.9)' }}
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'stickers' && (
        <>
          <p className="mb-3 text-center text-sm text-slate-500">Win games to collect stickers — some are a surprise!</p>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {STICKERS.map((s) => {
              const have = r.stickers.includes(s.id)
              return (
                <div key={s.id} className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-4xl ${have ? 'border-amber-300 bg-amber-50' : 'border-dashed border-slate-200 bg-slate-50 opacity-60'}`}>
                  {have ? s.emoji : '❓'}
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'trophies' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const got = r.achievements.includes(a.id)
            return (
              <div key={a.id} className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${got ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white opacity-70'}`}>
                <div className={`text-4xl ${got ? '' : 'grayscale'}`}>{got ? a.emoji : '🔒'}</div>
                <div>
                  <div className="font-bold text-slate-700">{a.name}</div>
                  <div className="text-sm text-slate-500">{a.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
