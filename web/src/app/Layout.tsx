import { Link, Outlet } from 'react-router-dom'
import SoundToggle from '../components/SoundToggle'
import RewardBar from '../components/RewardBar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-sky-50">
      <header className="flex items-center gap-4 bg-sky-500 px-6 py-4 text-white shadow-md">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          🎈 Funtime
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <RewardBar />
          <SoundToggle />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
