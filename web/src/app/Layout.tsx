import { Link, Outlet } from 'react-router-dom'
import SoundToggle from '../components/SoundToggle'
import RewardBar from '../components/RewardBar'
import { useRewards, themeById } from '../lib/rewards'

function patternStyle(p?: string, isDark?: boolean) {
  const opacity = isDark ? '0.08' : '0.07'
  const lightOp = isDark ? '0.15' : '0.07'
  switch (p) {
    case 'dots':
      return { backgroundImage: `radial-gradient(circle at 12px 12px, rgba(0,0,0,${opacity}) 2.5px, transparent 3.5px)`, backgroundSize: '28px 28px' } as React.CSSProperties
    case 'stars':
      return { backgroundImage: `radial-gradient(circle at 10px 10px, rgba(255,255,255,${lightOp}) 2px, transparent 3px), radial-gradient(circle at 30px 30px, rgba(255,215,0,0.18) 2px, transparent 3px), radial-gradient(circle at 50px 15px, rgba(0,0,0,${opacity}) 1.5px, transparent 2.5px)`, backgroundSize: '60px 60px' } as React.CSSProperties
    case 'hearts':
      return { backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext y='32' font-size='24' opacity='0.09'%3E💖%3C/text%3E%3C/svg%3E")`, backgroundSize: '48px 48px' } as React.CSSProperties
    case 'waves':
      return { backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 16px, rgba(0,0,0,${opacity}) 17px, transparent 18px), repeating-linear-gradient(45deg, transparent, transparent 16px, rgba(255,255,255,0.04) 17px, transparent 18px)`, backgroundSize: '32px 32px' } as React.CSSProperties
    case 'grid':
      return { backgroundImage: `linear-gradient(rgba(0,0,0,${opacity}) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(0,0,0,${opacity}) 1.5px, transparent 1.5px)`, backgroundSize: '32px 32px' } as React.CSSProperties
    case 'confetti':
      return { backgroundImage: `radial-gradient(circle at 10px 10px, rgba(236,72,153,0.14) 4px, transparent 5px), radial-gradient(circle at 30px 25px, rgba(59,130,246,0.14) 4px, transparent 5px), radial-gradient(circle at 50px 10px, rgba(16,185,129,0.14) 4px, transparent 5px), radial-gradient(circle at 20px 40px, rgba(245,158,11,0.14) 4px, transparent 5px)`, backgroundSize: '56px 56px' } as React.CSSProperties
    case 'bubbles':
      return { backgroundImage: `radial-gradient(circle at 15px 15px, rgba(255,255,255,0.25) 6px, transparent 7px), radial-gradient(circle at 35px 35px, rgba(255,255,255,0.15) 4px, transparent 5px)`, backgroundSize: '50px 50px' } as React.CSSProperties
    case 'sparkles':
      return { backgroundImage: `radial-gradient(circle at 12px 12px, rgba(255,215,0,0.22) 2px, transparent 3px), radial-gradient(circle at 36px 36px, rgba(255,255,255,0.2) 2px, transparent 3px)`, backgroundSize: '48px 48px' } as React.CSSProperties
    case 'clouds':
      return { backgroundImage: `radial-gradient(ellipse at 20px 20px, rgba(255,255,255,0.22) 12px, transparent 13px), radial-gradient(ellipse at 50px 35px, rgba(255,255,255,0.18) 10px, transparent 11px)`, backgroundSize: '70px 70px' } as React.CSSProperties
    case 'scales':
      return { backgroundImage: `radial-gradient(circle at 14px 14px, rgba(0,0,0,${opacity}) 10px, transparent 11px), radial-gradient(circle at 28px 28px, rgba(0,0,0,${opacity}) 10px, transparent 11px)`, backgroundSize: '28px 28px' } as React.CSSProperties
    default:
      return {}
  }
}

export default function Layout() {
  const r = useRewards()
  const theme = themeById(r.equippedTheme ?? 'sunny')
  const bg = theme.bgVia ? `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgVia}, ${theme.bgTo})` : `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgTo})`
  const bgStyle = { background: bg } as React.CSSProperties
  const headerStyle = { backgroundColor: theme.primary, color: '#fff', boxShadow: `0 4px 20px ${theme.primary}55` } as React.CSSProperties
  const pat = patternStyle(theme.pattern, theme.isDark)
  const cssVars = {
    '--primary': theme.primary,
    '--secondary': theme.secondary,
    '--accent': theme.accent,
    '--card-bg': theme.cardBg,
    '--card-border': theme.cardBorder,
    '--text-heading': theme.textHeading,
    '--text-body': theme.textBody,
    '--text-muted': theme.textMuted,
    '--radius': theme.radius || '1.5rem',
  } as React.CSSProperties
  const floating = theme.funEmojis ?? []
  const rarity = theme.rarity ?? 'common'
  const animationClass = theme.animation === 'shimmer' ? 'theme-shimmer' : theme.animation === 'glow' ? 'theme-glow' : theme.animation === 'float' ? 'theme-float' : theme.animation === 'pulse' ? 'theme-bounce-slow' : ''
  const bgAnimationClass = rarity === 'epic' || rarity === 'legendary' ? 'theme-gradient-animated' : ''
  const mascot = theme.mascotEmoji
  return (
    <div className={`min-h-screen relative overflow-hidden ${bgAnimationClass}`} style={{ ...bgStyle, ...cssVars, backgroundSize: '200% 200%' }}>
      <div className="pointer-events-none absolute inset-0" style={pat} />
      {/* floating fun emojis decoration - more for higher rarity */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floating.map((em, i) => (
          <div
            key={i}
            className={`absolute opacity-[0.14] ${rarity === 'epic' || rarity === 'legendary' ? 'theme-float' : 'animate-bounce'}`}
            style={{
              left: `${6 + (i * 13) % 88}%`,
              top: `${8 + (i * 19) % 84}%`,
              fontSize: `${26 + (i % 4) * 14}px`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${3.5 + (i % 3)}s`,
              filter: theme.isDark ? 'brightness(1.5) drop-shadow(0 0 6px rgba(255,255,255,0.25))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
              transform: `rotate(${(i*37)%60 -30}deg)`,
            }}
          >
            {em}
          </div>
        ))}
        {/* extra sparkles for epic legendary */}
        {(rarity === 'epic' || rarity === 'legendary') && [...Array(8)].map((_, i) => (
          <div key={`spark-${i}`} className="absolute text-2xl opacity-20 theme-bounce-slow" style={{ left: `${10 + i*11}%`, top: `${5 + (i*17)%90}%`, animationDelay: `${i*0.4}s` }}>✨</div>
        ))}
      </div>
      {/* mascot corner character for higher band themes */}
      {mascot && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 hidden sm:block">
          <div className={`text-7xl drop-shadow-2xl ${theme.animation === 'float' || rarity==='legendary' ? 'theme-float' : 'theme-bounce-slow'}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }}>
            {mascot}
          </div>
          {rarity === 'legendary' && (
            <div className="absolute -inset-3 rounded-full opacity-40 blur-xl" style={{ background: `radial-gradient(circle, ${theme.accent}88, transparent 70%)` }} />
          )}
        </div>
      )}
      <div className="relative">
      <header className={`flex items-center gap-4 px-6 py-4 text-white shadow-md relative overflow-hidden ${animationClass}`} style={headerStyle}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 40%)' }} />
        <Link to="/" className="relative text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
          <span>{theme.headerEmoji || '🎈'}</span> Funtime
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
