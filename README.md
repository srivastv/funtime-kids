# 🎈 Funtime

Fun, educational browser games for kids (ages ~7–10). No accounts, no tracking,
no ads — it runs entirely in the browser and saves progress locally.

Funtime is a free, open-source project. Contributions of new questions, words,
and drawings are especially welcome.

## Games

| Game | What it teaches |
| --- | --- |
| 🧠 **Who Wants to Be a Smarty?** | A kid-friendly "Who Wants to Be a Millionaire" quiz — 15-rung money ladder to £1,000,000, safe havens, walk away, and 50:50 / Ask the Audience / Swap lifelines. |
| ⌨️ **Typing Adventure** | Touch typing — **Practice** (copy passages with live WPM/accuracy) or **Race** (beat a pace-bot to the finish line with combo streaks). |
| 🌧️ **Word Rain** | Fast typing — pop falling words before they land (3 lives, speeds up with score). |
| 🎨 **Draw Along** | Guided drawing on a canvas (colors, brushes, undo/clear, save-as-PNG) — plus a **Trace & Score** mode that rates how neatly you traced the picture. |
| 🗺️ **World Hop** | Geography — 7 modes: flags, capitals, landmarks, **Map Drop** (drag the flag onto an accurate d3-geo map that auto-zooms to the region), **Landmark Hunt** (drag a pin to the country), **Capital Match** (connect countries to capitals), and Mixed. 3 difficulty levels, 40 countries. |
| 🧪 **Odd Science Lab** | Year 3-4 science — a lab hub with a **Science Quiz** (predict-then-test questions across all topics, 3 difficulty levels) plus 3 hands-on stations: **Sound & Pitch Lab** (xylophone + copy-the-tune), **Circuit Builder** (wire a battery & bulb, conductors vs insulators), and **Plant Grower** (balance water & light to grow a flower). |
| 🌉 **Number River** | Maths bridge builder — drag logs with + − × ÷ operations to reach target number, live total updates, beaver walks across to test. No multiple choice. 3 difficulty levels covering Y3 add/sub within 1000 and Y4 tables to 12×12. |
| 🤖 **Code Lab** | Coding concepts for ages ~8: **Robot Route** (program a robot with arrow blocks to reach the cheese — sequencing, then loops via a Repeat block) and **Debug It!** (fix an almost-right program). |

## Tech

- **React + Vite + TypeScript** single-page app, **Tailwind CSS** for styling.
- **No backend.** All content ships as static data, loaded through a
  `ContentProvider` interface — swapping in an API later needs no game changes.
- Progress is stored in the browser's `localStorage`.
- Sounds and music are **synthesized in code** (Web Audio API) — no audio files.

## Run it locally

Requires Node.js 20+.

```bash
cd web
npm install
npm run dev
# open http://localhost:5180
```

Other commands (run from `web/`):

```bash
npm test          # run unit tests (Vitest)
npm run build     # production build into web/dist
npm run preview   # preview the production build
```

Hosting is intentionally left open — `npm run build` produces a static `dist/`
folder that can be deployed to any static host (Vercel, Netlify, GitHub Pages,
Cloudflare Pages, …).

## Project structure

```
funtime-kids/
├─ web/                       # the React app (frontend)
│  └─ src/
│     ├─ app/                 # shell + routing
│     ├─ components/          # shared UI (Loading, ErrorScreen, ResultScreen, …)
│     ├─ content/             # ContentProvider + static data (JSON + drawings)
│     ├─ games/               # quiz, typing, falling, draw (each self-contained)
│     ├─ lib/                 # hooks + helpers (sound, storage, shuffle, …)
│     └─ store/               # settings (sound on/off)
├─ scripts/                   # Python content validator + tests
├─ docs/plans/                # design & implementation notes
└─ server/                    # (future) NestJS backend — not built yet
```

## Adding content

Most content is plain data:

- **Quiz questions:** add to (or create) a file in `web/src/content/data/quiz/`.
- **Typing lessons:** `web/src/content/data/typing/lessons.json`.
- **Word Rain words:** `web/src/content/data/falling/words.json`.
- **Drawings:** `web/src/content/data/draw/drawings.ts`.
- **World Hop geography:** `web/src/content/data/geography/items.json`.
- **Odd Science Lab:** `web/src/content/data/odd/` — plants.json, rocks.json, light_sound.json.
- **Number River:** `web/src/content/data/numberriver/levels.json` — curated levels, procedural generator fills rest.

Validate the JSON content before committing:

```bash
python3 scripts/validate_content.py     # checks quiz / typing / falling / geography / odd science / number river data
python3 -m pytest scripts/ -q           # runs the validator's own tests
```

## License

[MIT](./LICENSE) — free to use, modify, and share.
