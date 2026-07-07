# Funtime — Design Document

**Date:** 2026-07-01 (refreshed to reflect delivered v1)
**Status:** v1 built — four games shipped, runs locally

## Overview

Funtime is an open-source web app offering fun, educational mini-games for
**kids aged 7–10 (elementary)**. It is intended to become a **real product**,
and grew from an initial two-game plan into **four polished games** in v1.

**v1 games (all built):**
- 🧠 **Who Wants to Be a Smarty?** — a kid-flavored *Who Wants to Be a
  Millionaire* quiz: a 15-rung money ladder to £1,000,000, safe havens, walk
  away, and three lifelines (50:50, Ask the Audience, Swap the question).
- ⌨️ **Typing Adventure** — copy short passages with live WPM and accuracy.
- 🌧️ **Word Rain** — a falling-words typing game (3 lives, ramps up with score,
  a "bomb blast" effect when a word is popped).
- 🎨 **Draw Along** — step-by-step guided drawing on a canvas (8 drawings),
  with colors, brush sizes, undo/clear, and save-as-PNG.

Tic-Tac-Toe remains deferred.

## Goals & Constraints

- Real product for children → age-appropriate design and safety matter.
- **No accounts.** Scores/progress saved locally in the browser
  (localStorage). Collecting no personal data sidesteps most children's-privacy
  law (COPPA/GDPR-K).
- **No backend.** All content shipped as static data bundled with the app.
- **Design stays flexible** so a NestJS backend can be plugged in later with
  minimal change (the Content Provider seam, below).
- **Open source** on GitHub (MIT). Runs locally first; hosting deferred.
- **No external assets.** Sounds/music are synthesized in code; no audio/image
  files are fetched or bundled.

## Tech Stack (as built)

- **React 19 + Vite + TypeScript** — fast dev, type-safe content models.
- **Tailwind CSS v4** (via the `@tailwindcss/vite` plugin) — kid-friendly styling.
- **React Router** — routes: `/`, `/quiz`, `/typing`, `/falling`, `/draw`.
- **Zustand** — small shared state (sound on/off setting).
- **localStorage** — best scores/winnings and the sound preference.
- **Web Audio API** — all sound effects and background music, synthesized.
- **Vitest + Testing Library** — unit tests (40 passing).
- **Python 3** — offline content validator + its own tests (`scripts/`).
- **Dev server pinned to port 5180** (`strictPort`).
- **Hosting:** TBD. `npm run build` → static `dist/`, deployable anywhere.

## Key Architectural Decision — Content Provider Abstraction

All game content is accessed through a single interface, so the data *source*
can change without touching game components.

```ts
interface ContentProvider {
  getQuizCategories(): Promise<Category[]>
  getQuizQuestions(category: string): Promise<Question[]>
  getTypingLessons(): Promise<TypingLesson[]>
  getFallingWords(): Promise<FallingWord[]>
  getDrawings(): Promise<DrawingLesson[]>
}
```

- **v1:** `StaticContentProvider` reads bundled data, wrapped in `Promise`.
- **Future:** `ApiContentProvider` calls NestJS. **No game component changes** —
  they depend on the interface (via the `useContent` hook), not the source.

## Project Structure (as built)

```
funtime-kids/
├─ web/                       # the React app (runs on port 5180)
│  └─ src/
│     ├─ app/                 # Layout (top bar + sound toggle), routing
│     ├─ components/          # Loading, ErrorScreen, ResultScreen, SoundToggle
│     ├─ content/
│     │  ├─ types.ts          # Category, Question, TypingLesson, FallingWord,
│     │  │                    #   DrawShape, DrawStep, DrawingLesson
│     │  ├─ provider.ts       # ContentProvider interface
│     │  ├─ staticProvider.ts # v1 implementation
│     │  └─ data/
│     │     ├─ quiz/          # animals.json, space.json, maths.json (9 each)
│     │     ├─ typing/        # lessons.json
│     │     ├─ falling/       # words.json (difficulty-tiered)
│     │     └─ draw/          # drawings.ts (8 lessons, shape data)
│     ├─ games/
│     │  ├─ quiz/             # millionaire.ts (+test), MillionairePlay,
│     │  │                    #   MoneyLadder, Lifelines, AudienceChart,
│     │  │                    #   CategorySelect
│     │  ├─ typing/           # stats.ts (+test), TypingView, LessonSelect
│     │  ├─ falling/          # engine.ts (+test), FallingGame
│     │  └─ draw/             # guide.ts (+test), render.ts, DrawCanvas
│     ├─ lib/                 # useContent, useGameSession, sound, storage,
│     │                       #   shuffle  (each pure lib has tests)
│     └─ store/               # settings (sound on/off, persisted)
├─ scripts/                   # validate_content.py + test_validate_content.py
├─ docs/plans/                # this design + implementation plan
└─ server/                    # (future) NestJS backend — not built yet
```

## Content Model

```ts
type Category = { id: string; name: string; icon: string }

type Question = {
  id: string; category: string; prompt: string
  choices: string[]; answerIndex: number; difficulty: 1 | 2 | 3
}

type TypingLesson = { id: string; title: string; text: string; difficulty: 1 | 2 | 3 }

type FallingWord = { word: string; difficulty: 1 | 2 | 3 }

// Guide shapes for drawing lessons, in normalized 0..1 coordinates.
type DrawShape =
  | { kind: 'circle'; cx; cy; r }
  | { kind: 'ellipse'; cx; cy; rx; ry }
  | { kind: 'line'; x1; y1; x2; y2 }
  | { kind: 'rect'; x; y; w; h }
  | { kind: 'poly'; points: [number, number][]; close? }
  | { kind: 'curve'; x1; y1; cx; cy; x2; y2 }
type DrawStep = { instruction: string; shapes: DrawShape[] }
type DrawingLesson = { id: string; title: string; icon: string; steps: DrawStep[] }
```

- Quiz: 9 questions/category (3 per difficulty), 27 total. **"Mixed" is computed**
  (gathered + shuffled), never stored.
- Falling words and drawings are data-only, so contributors extend content
  without touching code.

## Games — Design Notes

### Who Wants to Be a Smarty? (Millionaire)
- Pick a category → a **15-rung ladder** (£100 → £1,000,000) built easy→hard,
  preferring the chosen category and topping up from the full pool.
- **Safe havens** at £1,000 (rung 5) and £32,000 (rung 10). Wrong answer drops
  to the last passed safe haven; **Walk away** banks current winnings.
- **Lifelines** (once each): 50:50, Ask the Audience (weighted bar chart), Swap.
- Suspense: lock answer → ~1.3s pause → reveal green/red. Dark-navy + gold theme.
- Pure logic in `millionaire.ts` (ladder, safe havens, lifelines) — unit tested.

### Typing Adventure
- Pick a lesson (by difficulty) → type the passage; per-char green/red coloring;
  live **WPM** and **accuracy**. Best WPM saved per lesson.
- Pure stats in `stats.ts` — unit tested.

### Word Rain
- Words fall; type a word to pop it (auto-clear on exact match). **3 lives**;
  fall speed + spawn rate + word difficulty ramp with score. Game over at 0 lives.
- **Blast effect** (cosmetic): a bomb flies up, a ghost word waits, then a
  particle explosion — layered on top of the tested engine.
- Pure rules in `engine.ts` (movement, matching, lives, scoring, curves) —
  unit tested. Best score saved.

### Draw Along
- Pick a subject (8) → each step reveals a dashed guide shape + instruction;
  earlier steps stay faint. Kid draws over guides on a canvas (pointer/touch).
- Tools: 9-color palette, 3 brush sizes, undo/clear, save-as-PNG (guides +
  drawing on white). Drawings are shape data (0..1 coords).
- Pure step logic in `guide.ts` (done vs. current shapes) — unit tested;
  canvas rendering isolated in `render.ts`.

## Cross-Cutting Systems

- **Sound & music** (`lib/sound.ts`): synthesized Web Audio effects (click,
  correct, wrong, lifeline, win, lose, pop, key, tick) + a gentle looping
  background melody during play. Every effect no-ops when muted. A master 🔊
  toggle in the top bar persists to localStorage (`store/settings.ts`); the
  AudioContext resumes on first user gesture (autoplay-safe).
- **Best scores** (`lib/storage.ts`): `loadBest`/`saveBest` under a
  `funtime:best:` prefix; keeps the max; corrupt values degrade to 0. Unit tested.
- **Loading/error states**: shared `Loading` and kid-friendly `ErrorScreen`
  ("Oops! This game is taking a nap 😴") used by every `useContent` consumer.

## Data Flow

1. Screen mounts → calls a `ContentProvider` method via the `useContent` hook
   (which exposes `loading` / `error` / `data`).
2. Games run on local component state (or a small pure engine) and play sounds.
3. On finish → `saveBest(...)` writes to localStorage; results screen shows best.

Swapping to `ApiContentProvider` later requires **zero** changes in the games.

## Testing (as built)

- **40 Vitest unit tests** focused on logic: quiz ladder/lifelines, typing
  stats, falling engine, shuffle, storage, game session, provider/mixed, draw
  guide. UI verified by manual playtest at each milestone checkpoint.
- **Python validator** checks quiz/typing/falling JSON (fields, `answerIndex`
  range, difficulty, unique ids, lowercase falling-words) with its own tests.

## Repository / OSS

- Root files: `README.md`, MIT `LICENSE`, `.gitignore`.
- `CONTRIBUTING.md` still deferred.
- Contributors: `cd app && npm install && npm run dev` (http://localhost:5180).

## Deferred / Future

- Tic-Tac-Toe.
- NestJS backend (content API, then possibly accounts/leaderboards).
- Accounts & cross-device progress (careful kids'-data + parental consent).
- Hosting selection; publishing to GitHub.
- `CONTRIBUTING.md`; per-category 15-rung quiz ladders (needs ~15 Q/category);
  an eraser tool and more drawings.
