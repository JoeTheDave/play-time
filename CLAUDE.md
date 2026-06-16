# PlayTime — Claude Code Context

## Read these first
- `VISION.md` — what this app is and why
- `PROJECT.md` — how it's built, deployed, and what conventions apply

## Critical conventions for this project
- No backend, no database, no auth — purely static frontend. Never introduce server-side code.
- Timer ref mutations in `useGameState` must stay OUTSIDE React state updater callbacks (StrictMode double-invoke bug — see PROJECT.md).
- Playwright e2e tests are part of CI — `npm run test:e2e` must pass before any merge.

## Local Dev
```bash
npm install
npm run dev     # http://localhost:5173
```

## Deployment
```bash
fly deploy --remote-only   # production (app: playtime)
```
