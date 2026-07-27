import { Link, Outlet } from 'react-router-dom'
import SoundToggle from '../components/SoundToggle'
import RewardBar from '../components/RewardBar'
import { useRewards, themeById } from '../lib/rewards'

function patternStyle(p?: string) {
  const opacity = '0.07'
  switch (p) {
    case 'dots':
      return { backgroundImage: `radial-gradient(circle at 12px 12px, rgba(0,0,0,${opacity}) 2px, transparent 3px)`, backgroundSize: '24px 24px' } as React.CSSProperties
    case 'stars':
      return { backgroundImage: `radial-gradient(circle at 10px 10px, rgba(255,255,255,0.25) 1.5px, transparent 2.5px), radial-gradient(circle at 30px 30px, rgba(0,0,0,${opacity}) 1.5px, transparent 2.5px)`, backgroundSize: '40px 40px' } as React.CSSProperties
    case 'hearts':
      return { backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext y='28' font-size='20' opacity='0.07'%3E💜%3C/text%3E%3C/svg%3E")`, backgroundSize: '40px 40px' } as React.CSSProperties
    case 'waves':
      return { backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 18px, rgba(0,0,0,${opacity}) 19px, transparent 20px)`, backgroundSize: '28px 28px' } as React.CSSProperties
    case 'grid':
      return { backgroundImage: `linear-gradient(rgba(0,0,0,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,${opacity}) 1px, transparent 1px)`, backgroundSize: '28px 28px' } as React.CSSProperties
    case 'confetti':
      return { backgroundImage: `radial-gradient(circle at 8px 8px, rgba(236,72,153,0.12) 3px, transparent 4px), radial-gradient(circle at 24px 24px, rgba(59,130,246,0.12) 3px, transparent 4px), radial-gradient(circle at 16px 32px, rgba(16,185,129,0.12) 3px, transparent 4px)`, backgroundSize: '32px 32px' } as React.CSSProperties
    default:
      return {}
  }
}

export default function Layout() {
  const r = useRewards()
  const theme = themeById(r.equippedTheme ?? 'sunny')
  const bgStyle = { background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgTo})` }
  const headerStyle = { backgroundColor: theme.primary, color: '#fff' }
  const pat = patternStyle(theme.pattern)
  return (
    <div className="min-h-screen relative" style={bgStyle}>
      <div className="pointer-events-none absolute inset-0" style={pat} />
      <div className="relative">
      <header className="flex items-center gap-4 px-6 py-4 text-white shadow-md" style={headerStyle}>
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
    </div>
  )
}
