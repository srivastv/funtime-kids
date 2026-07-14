import { useEffect, useRef, useState } from 'react'
import { sound } from '../../lib/sound'
import { loadBest, saveBest } from '../../lib/storage'
import ResultScreen from '../../components/ResultScreen'
import { runProgram, isWin, type Level, type Move, type Pos, type RunResult } from './robot'

const ARROW: Record<Move, string> = { U: '⬆️', D: '⬇️', L: '⬅️', R: '➡️' }
const DIR_NAME: Record<Move, string> = { U: 'up', D: 'down', L: 'left', R: 'right' }
const MOVES: Move[] = ['U', 'L', 'R', 'D']
const posKey = (p: Pos) => `${p.x},${p.y}`

type Props = {
  levels: Level[]
  title: string
  icon: string
  storageKey: string
  debug?: boolean
  onExit: () => void
  onHome: () => void
}

export default function RobotGame({ levels, title, icon, storageKey, debug, onExit, onHome }: Props) {
  const [idx, setIdx] = useState(0)
  const [program, setProgram] = useState<Move[]>([])
  const [repeat, setRepeat] = useState(1)
  const [anim, setAnim] = useState<{ path: Pos[]; step: number } | null>(null)
  const [result, setResult] = useState<RunResult | null>(null)
  const [solved, setSolved] = useState(false) // locks input during the win→next-level pause
  const [finished, setFinished] = useState(false)
  const timer = useRef<number | null>(null)

  const level = levels[idx]

  // (Re)seed the program when the level changes — Debug It! starts from the buggy program.
  useEffect(() => {
    setProgram(debug && level.buggy ? [...level.buggy.commands] : [])
    setRepeat(level.buggy?.repeat ?? 1)
    setResult(null)
    setAnim(null)
    setSolved(false)
  }, [idx, debug, level.buggy])

  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])

  const animating = anim !== null
  const locked = animating || solved

  function edit(fn: () => void) {
    if (locked) return
    setResult(null)
    fn()
  }

  function append(m: Move) { edit(() => { sound.tick(); setProgram((p) => [...p, m]) }) }
  function removeAt(i: number) { edit(() => { sound.click(); setProgram((p) => p.filter((_, j) => j !== i)) }) }
  function resetProgram() {
    edit(() => {
      sound.click()
      setProgram(debug && level.buggy ? [...level.buggy.commands] : [])
      setRepeat(level.buggy?.repeat ?? 1)
    })
  }

  function run() {
    if (locked || program.length === 0) return
    const r = runProgram(level, program, repeat)
    setResult(null)
    setAnim({ path: r.path, step: 0 })
    let i = 0
    sound.whoosh()
    timer.current = window.setInterval(() => {
      i++
      if (i >= r.path.length) {
        if (timer.current) clearInterval(timer.current)
        setAnim(null)
        finishRun(r)
      } else {
        sound.tick()
        setAnim({ path: r.path, step: i })
      }
    }, 340)
  }

  function finishRun(r: RunResult) {
    setResult(r)
    if (isWin(r)) {
      sound.win()
      setSolved(true)
      window.setTimeout(() => {
        if (idx + 1 >= levels.length) {
          if (levels.length > loadBest(storageKey)) saveBest(storageKey, levels.length)
          setFinished(true)
        } else {
          setIdx((n) => n + 1)
        }
      }, 1300)
    } else {
      sound.wrong()
    }
  }

  if (finished) {
    const best = loadBest(storageKey)
    return (
      <ResultScreen
        title={`${icon} All solved!`}
        lines={[`You finished all ${levels.length} ${title} puzzles!`]}
        starCount={3}
        best={best > 0 ? `Puzzles: ${best}` : undefined}
        onPlayAgain={() => { setIdx(0); setFinished(false) }}
        onHome={onHome}
      />
    )
  }

  const currentPos = anim ? anim.path[anim.step] : result ? result.path[result.path.length - 1] : level.start
  const traversed = anim ? anim.path.slice(0, anim.step + 1) : result ? result.path : [level.start]
  const collected = new Set(traversed.map(posKey))
  const wallSet = new Set(level.walls.map(posKey))
  const gemSet = new Set(level.gems.map(posKey))
  const won = result ? isWin(result) : false
  const totalBlocks = program.length * (level.allowRepeat ? repeat : 1)

  return (
    <div className="mx-auto max-w-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => { sound.click(); onExit() }} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow">← Code Lab</button>
        <h1 className="text-2xl font-extrabold text-indigo-700">{icon} {title}</h1>
        <span className="text-sm font-bold text-slate-500">{idx + 1}/{levels.length}</span>
      </div>

      <div className="mb-3 rounded-2xl bg-indigo-100 px-4 py-2 text-center font-bold text-indigo-800">
        {debug ? '🐞 Fix the program so the robot reaches the 🧀' : level.hint ?? 'Guide the robot to the 🧀'}
      </div>

      {/* Grid */}
      <div
        className="mx-auto grid gap-1 rounded-2xl bg-indigo-950 p-2 shadow-inner"
        style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)`, maxWidth: level.cols * 60 }}
      >
        {Array.from({ length: level.rows }).flatMap((_, y) =>
          Array.from({ length: level.cols }).map((_, x) => {
            const k = `${x},${y}`
            const isRobot = currentPos.x === x && currentPos.y === y
            const isGoal = level.goal.x === x && level.goal.y === y
            const isGem = gemSet.has(k) && !collected.has(k)
            const isWall = wallSet.has(k)
            return (
              <div
                key={k}
                className={`flex aspect-square items-center justify-center rounded-lg text-2xl transition-all ${isWall ? 'bg-slate-700' : 'bg-indigo-800/40'}`}
              >
                {isRobot ? (
                  <span className={won && isGoal ? 'animate-bounce' : ''}>🤖</span>
                ) : isWall ? '🧱' : isGoal ? '🧀' : isGem ? '💎' : ''}
              </div>
            )
          }),
        )}
      </div>

      {/* Feedback */}
      {result && (
        <div className={`mt-3 rounded-xl p-2 text-center font-bold ${won ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
          {won ? '🎉 Solved!' : result.crashed ? '💥 Crashed! Watch the walls.' : !result.reachedGoal ? '🤖 Didn’t reach the cheese — try again!' : '💎 Grab every gem too!'}
        </div>
      )}

      {/* Program */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-sm font-bold text-slate-500">
          <span>Your program {level.allowRepeat && `(×${repeat} = ${totalBlocks} steps)`}</span>
          <span>{program.length} block{program.length === 1 ? '' : 's'}</span>
        </div>
        <div className="flex min-h-[52px] flex-wrap gap-1 rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-2">
          {program.length === 0 && <span className="p-2 text-sm text-slate-400">Tap arrows below to build a program…</span>}
          {program.map((m, i) => (
            <button key={i} onClick={() => removeAt(i)} disabled={locked} title="tap to remove" aria-label={`Remove ${DIR_NAME[m]}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-xl shadow-sm hover:bg-red-100">
              {ARROW[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Palette */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {MOVES.map((m) => (
          <button key={m} onClick={() => append(m)} disabled={locked} aria-label={`Add ${DIR_NAME[m]}`}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-md transition hover:bg-indigo-50 hover:scale-105 disabled:opacity-40">
            {ARROW[m]}
          </button>
        ))}
        {level.allowRepeat && (
          <div className="flex items-center gap-1 rounded-xl bg-white px-2 py-1 shadow-md">
            <span className="text-xl">🔁</span>
            <button onClick={() => edit(() => setRepeat((r) => Math.max(1, r - 1)))} disabled={locked} className="h-8 w-8 rounded-lg bg-indigo-100 font-black">−</button>
            <span className="w-5 text-center font-bold">{repeat}</span>
            <button onClick={() => edit(() => setRepeat((r) => Math.min(10, r + 1)))} disabled={locked} className="h-8 w-8 rounded-lg bg-indigo-100 font-black">+</button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-center gap-3">
        <button onClick={resetProgram} disabled={locked} className="rounded-full bg-white px-6 py-3 font-bold text-slate-600 shadow disabled:opacity-40">↺ Reset</button>
        <button onClick={run} disabled={locked || program.length === 0} className="rounded-full bg-green-600 px-10 py-3 text-lg font-extrabold text-white shadow-lg hover:bg-green-700 disabled:opacity-40">▶ Run</button>
      </div>
    </div>
  )
}
