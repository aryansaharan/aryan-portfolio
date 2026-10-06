# aryansaharan.vercel.app

My portfolio. A single page: who I am, five products I've built, the path here, and what's on repeat.

## What's on it

- **Hero.** The mark, a marble statue, in two states, chosen by the visitor's local time (bright by day, dark after 7 pm) until they pick one: a graphite study that draws itself in on light, and the marble under a spotlight that follows the cursor on dark. Switching theme turns the drawing into stone.
- **Work.** Think Peepal, Prod AI, Trial Shift, iLumos and Ascend. Web products sit in a browser with one real moment magnified beside them; the native app is shown on phones, in its own light and dark themes. Each has a short story: the problem, the call, the build, where it is.
- **Live status.** `api/status.ts` pings every product (edge-cached for five minutes), so "All live" is measured, not claimed. The build bakes a snapshot as the fallback and refuses to build if the list of URLs drifts from `src/content/projects.ts`.
- **Path, Currently, a record player** (Fred again.., with real-audio bars), **the view**, and **say hi**.

## Stack

Vite, React 19, TypeScript, Tailwind 4, framer-motion. Deployed on Vercel; a push to `master` goes live.

## Working on it

```bash
npm install
npm run dev        # http://localhost:5173, /api/status works locally too
npm run build
```

All copy and project data live in `src/content/projects.ts`.

Helper scripts (they drive the system Chrome at `/Applications/Google Chrome.app`):

| Command | What it does |
| --- | --- |
| `npm run sketch` | Regenerates the graphite study from `public/favicon.png` |
| `npm run og` | Renders the link-preview card, `public/og.png` |
| `npm run audit` | Captures every section and plate in light, dark and on a phone |
| `node scripts/sheet.mjs out.png cols a.png b.png …` | Tiles screenshots into one contact sheet |
