import { useSettings } from '../store/settings'
import { sound } from '../lib/sound'

export default function SoundToggle() {
  const soundOn = useSettings((s) => s.soundOn)
  const toggleSound = useSettings((s) => s.toggleSound)

  return (
    <button
      type="button"
      onClick={() => {
        toggleSound()
        // Give audible feedback when turning sound on.
        if (!soundOn) sound.click()
      }}
      aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
      title={soundOn ? 'Sound on' : 'Sound off'}
      className="rounded-full bg-white/20 px-3 py-1 text-xl hover:bg-white/30"
    >
      {soundOn ? '🔊' : '🔇'}
    </button>
  )
}
