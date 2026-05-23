# PlayTime — Claude Code Context

## What This Is
A browser-based per-player turn timer for board game sessions, tracking each player's total turn time and current turn duration.

## Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Vite, React Router v6
- **Backend**: None — purely static client-side app
- **Database**: None
- **Deployment**: Fly.io — app name `playtime`, served via nginx container
- **Node**: 20

## Repo Structure
```
play-time/
├── src/
│   ├── components/     # PlayerSetupCard, PlayerCard, GameTimer, ErrorBoundary
│   ├── pages/          # SetupPage, GamePage
│   ├── hooks/          # useGameState
│   ├── context/        # GameContext
│   ├── lib/            # colors.ts, formatTime.ts
│   └── types/          # index.ts (Player, GameState interfaces)
├── tests/
│   ├── client/         # Vitest + React Testing Library
│   └── e2e/            # Playwright
├── .github/workflows/  # ci.yml, deploy-production.yml
├── nginx.conf
├── Dockerfile
└── fly.toml
```

## Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | SetupPage | Configure 2–12 players |
| `/game` | GamePage | Active game with timers |

## Key Conventions
- All timer math in milliseconds; `formatTime(ms)` converts to `H:MM:SS`
- Pause/resume uses time-offset accumulators (not wall-clock snapshots)
- Player colors: `PLAYER_COLORS` array in `src/lib/colors.ts`, assigned by index at setup
- Clicking a player card while paused is a no-op (guarded in `GamePage`)
- Player 1 (index 0) starts as active when game begins
- Grid columns determined by player count: 2→2col, 3-4→2col, 5-6→3col, 7-9→3col, 10-12→4col

## Local Dev
```bash
npm install
npm run dev     # http://localhost:5173
```

## Deployment
```bash
fly deploy --remote-only   # production (app: playtime)
```

## GitHub Secrets Required
- `FLY_API_TOKEN` — for production deploy workflow
- `REPO_TOKEN` — for CI auto-merge
- `CC_WEBHOOK_SECRET` — for Central Command webhook
