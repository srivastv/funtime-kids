# 🎈 Funtime

Fun, educational browser games for kids (ages ~7–10). No accounts, no tracking,
no ads — it runs entirely in the browser and saves progress locally.

Funtime is a free, open-source project. Contributions of new questions, words,
and drawings are especially welcome.

## Games

| Game | What it teaches |
| --- | --- |
| 🧠 **Who Wants to Be a Smarty?** | A kid-friendly "Who Wants to Be a Millionaire" quiz — 15-rung money ladder to £1,000,000, safe havens, walk away, and 50:50 / Ask the Audience / Swap lifelines. |
| ⌨️ **Typing Adventure** | Touch typing — copy short passages with live WPM and accuracy. |
| 🌧️ **Word Rain** | Fast typing — pop falling words before they land (3 lives, speeds up with score). |
| 🎨 **Draw Along** | Step-by-step guided drawing on a canvas, with colors, brushes, undo/clear, and save-as-PNG. |

## Tech

- **React + Vite + TypeScript** single-page app, **Tailwind CSS** for styling.
- **No backend.** All content ships as static data, loaded through a
  `ContentProvider` interface — swapping in an API later needs no game changes.
- Progress is stored in the browser's `localStorage`.
- Sounds and music are **synthesized in code** (Web Audio API) — no audio files.

## Run it locally

Requires Node.js 20+.

```bash
cd app
npm install
npm run dev
# open http://localhost:5180
```

Other commands (run from `app/`):

```bash
npm test          # run unit tests (Vitest)
npm run build     # production build into app/dist
npm run preview   # preview the production build
```

Hosting is intentionally left open — `npm run build` produces a static `dist/`
folder that can be deployed to any static host (Vercel, Netlify, GitHub Pages,
Cloudflare Pages, …).

## Project structure

```
funtime/
├─ app/                       # the React app
│  └─ src/
│     ├─ app/                 # shell + routing
│     ├─ components/          # shared UI (Loading, ErrorScreen, ResultScreen, …)
│     ├─ content/             # ContentProvider + static data (JSON + drawings)
│     ├─ games/               # quiz, typing, falling, draw (each self-contained)
│     ├─ lib/                 # hooks + helpers (sound, storage, shuffle, …)
│     └─ store/               # settings (sound on/off)
├─ scripts/                   # Python content validator + tests
└─ docs/plans/                # design & implementation notes
```

## Adding content

Most content is plain data:

- **Quiz questions:** add to (or create) a file in `app/src/content/data/quiz/`.
- **Typing lessons:** `app/src/content/data/typing/lessons.json`.
- **Word Rain words:** `app/src/content/data/falling/words.json`.
- **Drawings:** `app/src/content/data/draw/drawings.ts`.

Validate the JSON content before committing:

```bash
python3 scripts/validate_content.py     # checks quiz / typing / falling data
python3 -m pytest scripts/ -q           # runs the validator's own tests
```

## License

[MIT](./LICENSE) — free to use, modify, and share.
