# Funtime — Design Document

**Date:** 2026-07-01
**Status:** Validated (pre-implementation)

## Overview

Funtime is an open-source web app offering fun, educational mini-games for
**kids aged 7–10 (elementary)**. It is intended to become a **real product**,
starting small with two polished games and growing over time.

**v1 games:**
- **Typing Adventure** — a typing practice game.
- **Who Wants to Be a Smarty?** — a kid-flavored multiple-choice quiz
  (Who-Wants-to-Be-a-Millionaire style) with categories.

Tic-Tac-Toe is explicitly deferred to a later version.

## Goals & Constraints

- Real product for children → age-appropriate design and safety matter.
- **No accounts in v1.** Scores/progress saved locally in the browser
  (localStorage). Collecting no personal data sidesteps most children's-privacy
  law (COPPA/GDPR-K).
- **No backend in v1.** All content shipped as static JSON bundled with the app.
- **Design must stay flexible** so a NestJS backend can be plugged in later with
  minimal change (the Content Provider seam, below).
- **Open source** on GitHub, runs locally first; hosting decision deferred.

## Tech Stack

- **React + Vite + TypeScript** — fast dev, type-safe content models.
- **Tailwind CSS** — quick, consistent, kid-friendly styling.
- **React Router** — routes: `/`, `/typing`, `/quiz`.
- **Zustand** — small shared state (settings, scores).
- **localStorage** — persist high scores, typing stats, settings.
- **Python (offline only)** — scripts to generate/validate content JSON. Never
  runs in the browser.
- **Hosting:** TBD. Runs locally via `npm run dev`. Static build (`npm run
  build` → `dist/`) can be deployed to any static host (Vercel, Netlify, GitHub
  Pages, Cloudflare Pages) later with zero rework.

## Key Architectural Decision — Content Provider Abstraction

All game content is accessed through a single interface, so the data *source*
can change without touching game components.

```ts
interface ContentProvider {
  getQuizCategories(): Promise<Category[]>
  getQuizQuestions(category: string): Promise<Question[]>
  getTypingLessons(): Promise<TypingLesson[]>
}
```

- **v1:** `StaticContentProvider` reads bundled JSON, wrapped in `Promise` so the
  API is already async.
- **Future:** `ApiContentProvider` calls NestJS. **No game component changes** —
  they depend on the interface, not the source. This is the seam that keeps the
  project flexible without building a backend now.

## Project Structure

```
funtime/
├─ public/                 # static assets (icons, sounds)
├─ src/
│  ├─ app/                 # App shell, routing, layout
│  ├─ components/          # shared UI (Button, Card, ScoreBadge, Timer)
│  ├─ content/
│  │  ├─ provider.ts       # ContentProvider interface
│  │  ├─ staticProvider.ts # v1 implementation (reads JSON)
│  │  └─ data/
│  │     ├─ quiz/          # animals.json, space.json, maths.json ...
│  │     └─ typing/        # lessons.json
│  ├─ games/
│  │  ├─ typing/           # Typing game (self-contained)
│  │  └─ quiz/             # Quiz game (self-contained)
│  ├─ store/               # Zustand stores (settings, scores)
│  └─ lib/                 # helpers (localStorage, shuffle, timer)
├─ scripts/                # Python content tools
└─ (README, LICENSE, .gitignore)
```

## Content Model

```ts
type Category = { id: string; name: string; icon: string }  // "animals","space","maths"

type Question = {
  id: string
  category: string
  prompt: string
  choices: string[]        // 4 options
  answerIndex: number
  difficulty: 1 | 2 | 3
}

type TypingLesson = {
  id: string
  title: string
  text: string             // the passage to type
  difficulty: 1 | 2 | 3
}
```

- Each quiz category = one JSON file → contributors add content by editing/adding
  a file (OSS-friendly).
- **"Mixed" category is computed, not stored:** the provider gathers questions
  across categories and shuffles. No duplicate data.
- Python scripts validate each JSON file against these shapes (required fields,
  `answerIndex` in range, no duplicate ids).

## Games

### App Shell (home page)
- Colorful landing grid of game cards (Typing, Quiz), each with icon + name.
- Persistent top bar: Funtime logo, sound on/off toggle, Home button.
- Kid-friendly: large tap targets, rounded fonts, high contrast, minimal text.

### Quiz — "Who Wants to Be a Smarty?"
- Flow: pick a **category** (animals, space, maths, … + **Mixed**) → answer a
  series of multiple-choice questions.
- One question at a time, 4 big colored buttons.
- Instant feedback: correct → green + happy sound; wrong → show the right answer,
  gentle sound (no harsh fail — it's for kids).
- A **progress ladder** (points/stars) shows how far they've climbed.
- Optional per-question **timer** (configurable; off by default).
- End screen: score, stars, "Play again" / "Pick another category". High score
  per category saved to localStorage.

### Typing — "Typing Adventure"
- Pick a **lesson** (by difficulty).
- Show the passage; correct letters highlight green, mistakes red as they type.
- Live stats: **WPM** and **accuracy %**.
- No hard time limit; small celebration at the end.
- Saves best WPM/accuracy per lesson to localStorage.

### Shared pieces
- `ScoreBadge`, `Timer`, `ResultScreen`, `SoundToggle`, `Button`, `Card`.
- A `useGameSession` hook: tracks score/progress/finished generically, so future
  games (Tic-Tac-Toe) reuse it.

## Data Flow

1. Game screen mounts → calls the `ContentProvider`
   (e.g., `getQuizQuestions("space")`).
2. `StaticContentProvider` imports JSON, shuffles if needed, returns a `Promise`.
3. `useGameSession` holds runtime state (current index, score, finished).
4. On finish → write best score to localStorage via a `storage` helper.
5. Settings (sound, timer) live in a Zustand store, mirrored to localStorage.

Everything flows through the async provider + a `useContent` hook (with
`loading`/`error`/`data` states), so swapping to `ApiContentProvider` later needs
zero changes in the games.

## Error Handling

- Content fails to load → friendly kid-safe screen ("Oops! This game is taking a
  nap 😴 — try again") + retry button. Never a raw error.
- Empty/missing category → hide it from the menu rather than crash.
- Corrupt localStorage → catch, reset that key, continue (never block play).
- Python validator runs locally before commit, so bad JSON never ships.

## Testing

- **Vitest + React Testing Library** for unit/component tests: scoring logic,
  WPM/accuracy calc, shuffle, the provider, mixed-category assembly.
- Focus tests on **logic** (score, typing stats, answer checking) — highest
  value, least brittle.
- Light component tests for the two game flows.
- **pytest** for the Python JSON validator.
- Manual playtest checklist for kid-experience bits (sound, colors, feel).

## Repository / OSS

- v1 repo files: `README.md`, MIT `LICENSE`, `.gitignore`.
- `CONTRIBUTING.md` deferred to later.
- Contributors run `npm install && npm run dev`.

## Deferred / Future

- Tic-Tac-Toe (two-player vs. computer TBD).
- NestJS backend (content API, then possibly accounts/leaderboards).
- Accounts & cross-device progress (requires careful kids'-data + parental
  consent handling).
- Hosting selection.
- `CONTRIBUTING.md`.
