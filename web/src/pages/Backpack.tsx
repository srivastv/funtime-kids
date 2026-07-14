import { useState } from 'react'
import { sound } from '../lib/sound'
import { useRewards, buyAvatar, equipAvatar, AVATARS, STICKERS, ACHIEVEMENTS } from '../lib/rewards'

type Tab = 'avatars' | 'stickers' | 'trophies'

export default function Backpack() {
  const r = useRewards()
  const [tab, setTab] = useState<Tab>('avatars')

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-violet-700">My Backpack 🎒</h1>
        <span className="rounded-full bg-amber-100 px-4 py-1.5 font-bold text-amber-800">🪙 {r.coins}</span>
      </div>

      {/* Kid-friendly "how to earn" explainer */}
      <div className="mb-6 rounded-3xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
        <p className="text-center text-lg font-extrabold">How do I get coins? 🪙</p>
        <ul className="mx-auto mt-2 max-w-md space-y-1 text-sm font-semibold">
          <li>🎮 <b>Play any game</b> — you get coins just for trying!</li>
          <li>⭐ <b>Earn more stars</b> to get more coins.</li>
          <li>🏅 <b>Beat your best score</b> for a bonus and a surprise sticker!</li>
          <li>🛍️ <b>Spend coins</b> here on cool avatars.</li>
          <li>🏆 Keep playing to unlock <b>trophies</b> and fill your <b>sticker album</b>!</li>
        </ul>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {([
          { id: 'avatars', label: '🧑‍🚀 Avatars' },
          { id: 'stickers', label: `🌟 Stickers (${r.stickers.length}/${STICKERS.length})` },
          { id: 'trophies', label: `🏆 Trophies (${r.achievements.length}/${ACHIEVEMENTS.length})` },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => { sound.click(); setTab(t.id) }}
            className={`rounded-full px-4 py-2 text-sm font-bold shadow transition ${tab === t.id ? 'bg-violet-500 text-white' : 'bg-white text-violet-700 hover:bg-violet-50'}`}
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
              <div key={a.id} className={`flex flex-col items-center rounded-2xl border-2 bg-white p-4 shadow-sm ${equipped ? 'border-violet-400' : 'border-slate-100'}`}>
                <div className="text-5xl">{a.emoji}</div>
                <div className="mt-1 font-bold text-slate-700">{a.name}</div>
                {owned ? (
                  <button
                    onClick={() => { sound.click(); equipAvatar(a.id) }}
                    disabled={equipped}
                    className={`mt-2 rounded-full px-4 py-1.5 text-sm font-bold ${equipped ? 'bg-violet-100 text-violet-500' : 'bg-violet-500 text-white hover:bg-violet-600'}`}
                  >
                    {equipped ? 'Equipped ✓' : 'Wear'}
                  </button>
                ) : (
                  <button
                    onClick={() => { if (buyAvatar(a.id)) sound.correct(); else sound.wrong() }}
                    disabled={!canBuy}
                    className="mt-2 rounded-full bg-amber-400 px-4 py-1.5 text-sm font-bold text-amber-900 shadow hover:bg-amber-300 disabled:opacity-40"
                  >
                    🪙 {a.price}
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
