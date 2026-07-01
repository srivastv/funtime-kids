# Plan: Funtime — v1 Implementation

**Goal**: Ship a locally-runnable, open-source React app with two educational
kid games (Typing Adventure + "Who Wants to Be a Smarty?" quiz), reaching a
clickable POC as fast as possible.

**Architecture**: React + Vite + TypeScript SPA, no backend. All content served
through a `ContentProvider` interface (v1 = static JSON) so a NestJS backend can
be swapped in later with zero game-component changes. State via Zustand; progress
via localStorage.

**Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, React Router, Zustand,
Vitest + React Testing Library, Python 3 + pytest (offline content validation).

**Design ref**: `docs/plans/2026-07-01-funtime-design.md`

---

## Execution Order

| Milestone | Steps | Outcome |
|-----------|-------|---------|
| M1: Runnable skeleton (POC) | 1–6 | `npm run dev` shows home + routed placeholder games |
| M2: Content seam | 7–10 | Provider interface + static JSON wired in |
| M3: Quiz game | 11–16 | Full quiz flow with tested scoring |
| M4: Typing game | 17–21 | Full typing flow with tested WPM/accuracy |
| M5: Polish & repo | 22–27 | localStorage, sound, error screens, README/LICENSE |

Steps within a milestone are sequential unless noted. Reach a **runnable state at
the end of every milestone** so the design can be reviewed as it grows.

---

# Milestone 1 — Runnable Skeleton (the POC)

## Step 1: Scaffold the Vite React+TS app

**Dir**: `/Users/srivastv/projects/funtime` (project root)

### 1a. Create the app
```bash
cd /Users/srivastv/projects/funtime
npm create vite@latest app -- --template react-ts
cd app
npm install
```

### 1b. Verify it runs
```bash
npm run dev
# open http://localhost:5173 — default Vite page renders
```

### 1c. Commit
```bash
git init && git add -A && git commit -m "chore: scaffold Vite React+TS app"
```

> Note: all subsequent paths are relative to `/Users/srivastv/projects/funtime/app`
> unless stated. The design doc lives one level up in the repo `docs/`.

---

## Step 2: Install core dependencies

### 2a. Install
```bash
npm install react-router-dom zustand
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

### 2b. Configure Tailwind — `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

### 2c. Replace `src/index.css` with Tailwind directives
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2d. Verify Tailwind works — temporarily set `src/App.tsx` root div to
`className="text-3xl font-bold text-blue-600"`, run `npm run dev`, confirm styled
text. Revert the temp change.

### 2e. Commit
```bash
git add -A && git commit -m "chore: add router, zustand, tailwind, vitest"
```

---

## Step 3: Configure Vitest

**File**: `vite.config.ts`

### 3a. Add test config
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

### 3b. Create `src/test/setup.ts`
```ts
import '@testing-library/jest-dom'
```

### 3c. Add scripts to `package.json`
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

### 3d. Smoke test — create `src/test/smoke.test.ts`
```ts
import { describe, it, expect } from 'vitest'
describe('smoke', () => { it('runs', () => { expect(1 + 1).toBe(2) }) })
```
Run: `npm test` → passes.

### 3e. Commit
```bash
git add -A && git commit -m "chore: configure vitest"
```

---

## Step 4: Define shared domain types

**File**: `src/content/types.ts`

### 4a. Create types
```ts
export type Category = { id: string; name: string; icon: string }

export type Question = {
  id: string
  category: string
  prompt: string
  choices: string[]
  answerIndex: number
  difficulty: 1 | 2 | 3
}

export type TypingLesson = {
  id: string
  title: string
  text: string
  difficulty: 1 | 2 | 3
}
```

### 4b. Verify build
```bash
npm run build
```

### 4c. Commit
```bash
git add -A && git commit -m "feat: add shared content types"
```

---

## Step 5: App shell + routing

**Files**: `src/app/Layout.tsx`, `src/app/routes.tsx`, `src/pages/Home.tsx`,
`src/games/quiz/QuizPage.tsx`, `src/games/typing/TypingPage.tsx`, `src/App.tsx`,
`src/main.tsx`

### 5a. Placeholder game pages
```tsx
// src/games/quiz/QuizPage.tsx
export default function QuizPage() {
  return <div className="p-8 text-2xl">Quiz — coming soon</div>
}
```
```tsx
// src/games/typing/TypingPage.tsx
export default function TypingPage() {
  return <div className="p-8 text-2xl">Typing — coming soon</div>
}
```

### 5b. Layout with top bar
```tsx
// src/app/Layout.tsx
import { Link, Outlet } from 'react-router-dom'
export default function Layout() {
  return (
    <div className="min-h-screen bg-sky-50">
      <header className="flex items-center gap-4 bg-sky-500 px-6 py-4 text-white">
        <Link to="/" className="text-2xl font-bold">🎈 Funtime</Link>
      </header>
      <main><Outlet /></main>
    </div>
  )
}
```

### 5c. Home page with game cards
```tsx
// src/pages/Home.tsx
import { Link } from 'react-router-dom'
const games = [
  { to: '/quiz', name: 'Who Wants to Be a Smarty?', icon: '🧠' },
  { to: '/typing', name: 'Typing Adventure', icon: '⌨️' },
]
export default function Home() {
  return (
    <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2">
      {games.map((g) => (
        <Link key={g.to} to={g.to}
          className="rounded-3xl bg-white p-8 text-center shadow-lg hover:scale-105 transition">
          <div className="text-6xl">{g.icon}</div>
          <div className="mt-4 text-xl font-bold">{g.name}</div>
        </Link>
      ))}
    </div>
  )
}
```

### 5d. Wire routes — `src/App.tsx`
```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './app/Layout'
import Home from './pages/Home'
import QuizPage from './games/quiz/QuizPage'
import TypingPage from './games/typing/TypingPage'

const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: 'quiz', element: <QuizPage /> },
    { path: 'typing', element: <TypingPage /> },
  ]},
])
export default function App() { return <RouterProvider router={router} /> }
```
Ensure `src/main.tsx` renders `<App />` and imports `./index.css`.

### 5e. Verify
```bash
npm run dev
# home shows two cards; clicking each routes to its placeholder; logo returns home
```

### 5f. Commit
```bash
git add -A && git commit -m "feat: app shell, home page, routing (POC)"
```

---

## Step 6: POC checkpoint

### 6a. Full check
```bash
npm run build && npm test && npm run dev
```

### 6b. **STOP & REVIEW** — this is the first clickable POC. Play with it locally,
note any design changes before continuing.

---

# Milestone 2 — Content Seam

## Step 7: ContentProvider interface

**File**: `src/content/provider.ts`
```ts
import type { Category, Question, TypingLesson } from './types'
export interface ContentProvider {
  getQuizCategories(): Promise<Category[]>
  getQuizQuestions(category: string): Promise<Question[]>
  getTypingLessons(): Promise<TypingLesson[]>
}
```
Commit: `feat: add ContentProvider interface`

---

## Step 8: Sample content JSON

**Files**: `src/content/data/quiz/animals.json`, `.../space.json`,
`.../maths.json`, `src/content/data/typing/lessons.json`

### 8a. Example — `animals.json`
```json
[
  { "id": "an1", "category": "animals", "prompt": "Which animal says moo?",
    "choices": ["Dog", "Cow", "Cat", "Duck"], "answerIndex": 1, "difficulty": 1 }
]
```
Add 3–5 questions per category file, and 2–3 lessons in `lessons.json`
(`{ "id","title","text","difficulty" }`).

Commit: `feat: add sample quiz + typing content`

---

## Step 9: StaticContentProvider (with mixed-category logic)

**File**: `src/content/staticProvider.ts`

### 9a. Write failing test — `src/content/staticProvider.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { staticProvider } from './staticProvider'

describe('staticProvider', () => {
  it('lists categories including Mixed', async () => {
    const cats = await staticProvider.getQuizCategories()
    expect(cats.some(c => c.id === 'mixed')).toBe(true)
  })
  it('mixed returns questions from more than one category', async () => {
    const qs = await staticProvider.getQuizQuestions('mixed')
    const cats = new Set(qs.map(q => q.category))
    expect(cats.size).toBeGreaterThan(1)
  })
})
```
Run `npm test` → fails (module missing).

### 9b. Implement
```ts
import type { Category, Question, TypingLesson } from './types'
import type { ContentProvider } from './provider'
import animals from './data/quiz/animals.json'
import space from './data/quiz/space.json'
import maths from './data/quiz/maths.json'
import lessons from './data/typing/lessons.json'

const banks: Record<string, Question[]> = {
  animals: animals as Question[],
  space: space as Question[],
  maths: maths as Question[],
}
const categories: Category[] = [
  { id: 'animals', name: 'Animals', icon: '🐾' },
  { id: 'space', name: 'Space', icon: '🚀' },
  { id: 'maths', name: 'Maths', icon: '➕' },
  { id: 'mixed', name: 'Mixed', icon: '🎲' },
]
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
export const staticProvider: ContentProvider = {
  async getQuizCategories() { return categories },
  async getQuizQuestions(category: string) {
    if (category === 'mixed') return shuffle(Object.values(banks).flat())
    return banks[category] ?? []
  },
  async getTypingLessons() { return lessons as TypingLesson[] },
}
```
Enable JSON imports: ensure `resolveJsonModule` is on (Vite/TS default true).

### 9c. Run `npm test` → passes.

Commit: `feat: static content provider with mixed category`

---

## Step 10: useContent hook (loading/error/data)

**File**: `src/lib/useContent.ts`
```ts
import { useEffect, useState } from 'react'
export function useContent<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  useEffect(() => {
    let alive = true
    setLoading(true); setError(null)
    fn().then(d => { if (alive) setData(d) })
       .catch(e => { if (alive) setError(e) })
       .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { data, loading, error }
}
```
Verify `npm run build`. Commit: `feat: useContent hook`

---

# Milestone 3 — Quiz Game

## Step 11: Quiz scoring logic (pure, tested)

**File**: `src/games/quiz/scoring.ts`

### 11a. Failing test — `src/games/quiz/scoring.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { isCorrect, nextScore } from './scoring'

describe('quiz scoring', () => {
  it('detects correct answer', () => {
    expect(isCorrect({ answerIndex: 2 } as any, 2)).toBe(true)
    expect(isCorrect({ answerIndex: 2 } as any, 0)).toBe(false)
  })
  it('adds a point on correct only', () => {
    expect(nextScore(3, true)).toBe(4)
    expect(nextScore(3, false)).toBe(3)
  })
})
```

### 11b. Implement
```ts
import type { Question } from '../../content/types'
export const isCorrect = (q: Question, choice: number) => q.answerIndex === choice
export const nextScore = (score: number, correct: boolean) => correct ? score + 1 : score
```
Run `npm test` → passes. Commit: `feat: quiz scoring logic`

---

## Step 12: useGameSession hook

**File**: `src/lib/useGameSession.ts`

### 12a. Failing test — `src/lib/useGameSession.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameSession } from './useGameSession'

describe('useGameSession', () => {
  it('advances index and finishes', () => {
    const { result } = renderHook(() => useGameSession(2))
    expect(result.current.index).toBe(0)
    act(() => result.current.next())
    expect(result.current.index).toBe(1)
    act(() => result.current.next())
    expect(result.current.finished).toBe(true)
  })
})
```

### 12b. Implement
```ts
import { useState, useCallback } from 'react'
export function useGameSession(total: number) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const next = useCallback(() => {
    setIndex(i => {
      const n = i + 1
      if (n >= total) { setFinished(true); return i }
      return n
    })
  }, [total])
  const addScore = useCallback((p: number) => setScore(s => s + p), [])
  const reset = useCallback(() => { setIndex(0); setScore(0); setFinished(false) }, [])
  return { index, score, finished, next, addScore, reset }
}
```
Run `npm test` → passes. Commit: `feat: useGameSession hook`

---

## Step 13: Category select screen

**File**: `src/games/quiz/CategorySelect.tsx` — grid of category cards from
`staticProvider.getQuizCategories()` via `useContent`; each card calls an
`onPick(categoryId)` prop. Loading → simple "Loading…"; error → friendly message.
Commit: `feat: quiz category select`

---

## Step 14: Question view

**File**: `src/games/quiz/QuestionView.tsx` — props: `question`, `onAnswer(idx)`.
Renders prompt + 4 big buttons; on click, highlights chosen (green if correct,
red if wrong) and reveals correct answer, then shows a "Next" button that calls
`onAnswer`. Commit: `feat: quiz question view`

---

## Step 15: Result screen (shared)

**File**: `src/components/ResultScreen.tsx` — props: `score`, `total`,
`onPlayAgain`, `onHome`. Shows stars/score + two buttons. Reused by typing later.
Commit: `feat: shared result screen`

---

## Step 16: Assemble QuizPage

**File**: `src/games/quiz/QuizPage.tsx` — replace placeholder. State machine:
`select` → load questions for picked category → play via `useGameSession` +
`QuestionView` + `scoring` → `ResultScreen`.

### 16a. Verify end-to-end
```bash
npm run dev
# pick a category → answer questions → see result → play again / home
npm test && npm run build
```
### 16b. **STOP & REVIEW** — quiz playable. Commit: `feat: complete quiz game`

---

# Milestone 4 — Typing Game

## Step 17: Typing stats logic (pure, tested)

**File**: `src/games/typing/stats.ts`

### 17a. Failing test — `src/games/typing/stats.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { accuracy, wpm } from './stats'

describe('typing stats', () => {
  it('computes accuracy %', () => {
    expect(accuracy('hello', 'hello')).toBe(100)
    expect(accuracy('hxllo', 'hello')).toBe(80)
  })
  it('computes wpm (5 chars = 1 word)', () => {
    // 25 correct chars in 60s => 5 words / 1 min = 5 wpm
    expect(wpm(25, 60000)).toBe(5)
  })
})
```

### 17b. Implement
```ts
export function accuracy(typed: string, target: string): number {
  if (typed.length === 0) return 100
  let correct = 0
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correct++
  return Math.round((correct / typed.length) * 100)
}
export function wpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  const minutes = elapsedMs / 60000
  return Math.round((correctChars / 5) / minutes)
}
```
Run `npm test` → passes. Commit: `feat: typing stats logic`

---

## Step 18: Lesson select screen

**File**: `src/games/typing/LessonSelect.tsx` — list lessons from
`getTypingLessons()` via `useContent`; `onPick(lesson)`. Commit: `feat: typing lesson select`

---

## Step 19: Typing view

**File**: `src/games/typing/TypingView.tsx` — props: `lesson`, `onFinish(stats)`.
Captures keystrokes (hidden input or `onKeyDown`), renders the target text with
per-char coloring (green correct / red wrong / grey pending), shows live WPM +
accuracy, starts the timer on first keystroke, calls `onFinish` when the typed
length reaches the target length. Commit: `feat: typing view`

---

## Step 20: Assemble TypingPage

**File**: `src/games/typing/TypingPage.tsx` — replace placeholder: `select` →
`TypingView` → `ResultScreen` (show WPM/accuracy). Commit: `feat: complete typing game`

---

## Step 21: Typing checkpoint
```bash
npm run dev   # pick lesson → type → see WPM/accuracy → play again
npm test && npm run build
```
**STOP & REVIEW.**

---

# Milestone 5 — Polish & Repo Hygiene

## Step 22: localStorage helper (tested)

**File**: `src/lib/storage.ts`

### 22a. Failing test — `src/lib/storage.test.ts`
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { loadBest, saveBest } from './storage'

describe('storage', () => {
  beforeEach(() => localStorage.clear())
  it('keeps the higher score', () => {
    saveBest('quiz:animals', 3)
    saveBest('quiz:animals', 2)
    expect(loadBest('quiz:animals')).toBe(3)
  })
  it('survives corrupt values', () => {
    localStorage.setItem('quiz:x', 'not-json')
    expect(loadBest('quiz:x')).toBe(0)
  })
})
```

### 22b. Implement — read/parse with try/catch (return 0 on corrupt), write max.
Run `npm test` → passes. Commit: `feat: localStorage best-score helper`

---

## Step 23: Wire best scores into both result screens
Save on finish; show "Best: N" on category/lesson select. Commit: `feat: persist best scores`

---

## Step 24: Settings store + sound toggle

**Files**: `src/store/settings.ts` (Zustand: `soundOn`, `toggleSound`, mirror to
localStorage), `src/components/SoundToggle.tsx` in the top bar. Play sounds only
when `soundOn`. Commit: `feat: sound toggle + settings store`

---

## Step 25: Friendly error + loading states
Add a shared `<Loading/>` and `<ErrorScreen/>` ("Oops! This game is taking a nap
😴") used by `useContent` consumers. Hide empty categories. Commit: `feat: kid-friendly loading/error states`

---

## Step 26: Python content validator

**Files**: `scripts/validate_content.py`, `scripts/test_validate_content.py`

### 26a. Validator: load every JSON under `app/src/content/data/`, assert required
fields, `0 <= answerIndex < len(choices)`, `difficulty in {1,2,3}`, unique ids.
Exit non-zero on any error.

### 26b. `pytest` test with a good and a bad fixture.
```bash
cd /Users/srivastv/projects/funtime
python -m pytest scripts/ -q
python scripts/validate_content.py   # exits 0 on current content
```
Commit: `feat: python content validator + tests`

---

## Step 27: Repo hygiene + final E2E

### 27a. Root files
- `README.md` — what Funtime is, how to run (`cd app && npm install && npm run
  dev`), how to validate content, project layout, roadmap (Tic-Tac-Toe, backend).
- `LICENSE` — MIT.
- `.gitignore` — ensure `node_modules`, `dist`, `__pycache__`, `.DS_Store`.

### 27b. Full end-to-end verification
```bash
cd /Users/srivastv/projects/funtime/app
npm install && npm test && npm run build && npm run preview
# In browser: home → quiz (incl. Mixed) full round → typing full round →
#   best scores persist across reload → sound toggle works → error state on
#   forced content failure.
cd /Users/srivastv/projects/funtime && python scripts/validate_content.py
```

### 27c. Final commit
```bash
git add -A && git commit -m "feat: Funtime v1 — quiz + typing, polish, docs"
```

---

## Notes for the executor
- Keep each step small; commit after each.
- Prioritise reaching **Step 6 (POC)** before any game logic.
- Tests target **logic** (scoring, stats, storage, provider) — the highest-value,
  least-brittle surface. UI is verified by manual playtest at each checkpoint.
- Do not add a backend, accounts, or Tic-Tac-Toe — explicitly deferred.
