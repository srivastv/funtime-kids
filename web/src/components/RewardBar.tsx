import { Link } from 'react-router-dom'
import { useRewards, avatarEmoji } from '../lib/rewards'
import { sound } from '../lib/sound'

export default function RewardBar() {
  const r = useRewards()
  return (
    <Link
      to="/backpack"
      onClick={() => sound.click()}
      className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 font-bold transition hover:bg-white/30"
      title="Open your backpack"
    >
      <span className="text-xl leading-none">{avatarEmoji(r.equippedAvatar)}</span>
      <span className="tabular-nums">🪙 {r.coins}</span>
    </Link>
  )
}
