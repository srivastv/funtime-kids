import { Link } from 'react-router-dom'
import { sound } from '../lib/sound'

const games = [
  { to: '/quiz', name: 'Who Wants to Be a Smarty?', icon: '🧠' },
  { to: '/typing', name: 'Typing Adventure', icon: '⌨️' },
  { to: '/falling', name: 'Word Rain', icon: '🌧️' },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-center text-4xl font-extrabold text-sky-700">
        Pick a game!
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {games.map((g) => (
          <Link
            key={g.to}
            to={g.to}
            onClick={() => sound.click()}
            className="rounded-3xl bg-white p-10 text-center shadow-lg transition hover:scale-105 hover:shadow-xl"
          >
            <div className="text-7xl">{g.icon}</div>
            <div className="mt-4 text-xl font-bold text-slate-700">{g.name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
