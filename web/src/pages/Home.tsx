import { Link } from 'react-router-dom'
import { sound } from '../lib/sound'

const games = [
  { to: '/quiz', name: 'Who Wants to Be a Smarty?', icon: '🧠' },
  { to: '/typing', name: 'Typing Adventure', icon: '⌨️' },
  { to: '/falling', name: 'Word Rain', icon: '🌧️' },
  { to: '/draw', name: 'Draw Along', icon: '🎨' },
  { to: '/geo', name: 'World Hop', icon: '🗺️' },
  { to: '/odd', name: "Odd Science Lab", icon: '🧪' },
  { to: '/numberriver', name: 'Number River', icon: '🌉' },
  { to: '/code', name: 'Code Lab', icon: '🤖' },
  { to: '/maths', name: 'Maths Lab', icon: '🔢' },
  { to: '/backpack', name: 'My Backpack', icon: '🎒' },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-3 text-center text-4xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
        Pick a game!
      </h1>
      <Link
        to="/backpack"
        onClick={() => sound.click()}
        className="mx-auto mb-8 block max-w-xl rounded-2xl border-2 px-5 py-3 text-center font-bold shadow-sm transition hover:opacity-90"
        style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--card-bg)', color: 'var(--text-body)' }}
      >
        🪙 Play games to earn coins — even trying counts! Tap here to open your Backpack 🎒
      </Link>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <Link
            key={g.to}
            to={g.to}
            onClick={() => sound.click()}
            className="p-10 text-center shadow-lg transition hover:scale-105 hover:shadow-xl border-2"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderRadius: 'var(--radius)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
          >
            <div className="text-7xl">{g.icon}</div>
            <div className="mt-4 text-xl font-bold" style={{ color: 'var(--text-body)' }}>{g.name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
