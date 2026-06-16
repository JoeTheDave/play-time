# PlayTime — Technical Reference

## What This Is
Browser-based per-player turn timer for board game sessions. Purely static frontend — no backend, no database, no auth. Deployed as an nginx container on Fly.io.

## Workflow
```yaml
deployments:
  prod:
    branch: master
# feature branches auto-merge to master on CI green; no staging environment
```

## Intentional Deviations from STANDARDS.md
- **No backend or database** — purely static frontend; no Express, no Prisma, no Postgres
- **No auth** — no login, sessions, or user management
- **No staging environment** — feature branches auto-merge to master; single deploy target
- **Source at root `src/`** — not under `client/src/`; no monorepo split needed for frontend-only project
- **Codified E2E tests** — Playwright e2e in `tests/e2e/` (small suite, ~6 scenarios); run in CI
- **No ESLint/Prettier** — code quality enforced via TypeScript strict config only

## Stack
| Layer | In Use |
|-------|--------|
| Frontend | React 18, TypeScript, Tailwind CSS v4, Vite, React Router v6 |
| Backend | None |
| Database | None |
| Auth | None |
| Deployment | Fly.io, app name `playtime`, nginx container, region `dfw` |
| GitHub | https://github.com/JoeTheDave/play-time (public) |
| Node | 20 |

## Repo Structure
```
play-time/
├── src/
│   ├── components/     # PlayerSetupCard, PlayerCard, GameTimer, ErrorBoundary
│   ├── pages/          # SetupPage, GamePage
│   ├── hooks/          # useGameState, useTileLayout, useInterval
│   ├── context/        # GameContext
│   ├── lib/            # colors.ts, formatTime.ts
│   └── types/          # index.ts (Player, GameState interfaces)
├── tests/
│   ├── client/         # Vitest + React Testing Library (119 tests)
│   └── e2e/            # Playwright smoke suite (game-flow.spec.ts)
├── .github/workflows/  # ci.yml (build+test+e2e+auto-merge), deploy-production.yml
├── nginx.conf
├── Dockerfile
└── fly.toml
```

## Data Models
No Prisma schema — no database. Key TypeScript interfaces (`src/types/index.ts`):

```typescript
interface Player {
  id: string
  name: string
  color: string           // hex from PLAYER_COLORS palette
  totalMs: number
  isActive: boolean
  turnHistory: number[]   // most-recent-first list of completed turn durations in ms
}
```

## API Endpoints
None — no backend.

## Frontend Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | SetupPage | Configure 2–12 players (names, colors, order) |
| `/game` | GamePage | Active game with per-player tiles and timers |

## Environment Variables
None — purely static frontend with no server-side config.

## Non-Obvious Conventions

### Timer Logic
Pause/resume uses time-offset accumulators (not wall-clock snapshots):
- `pausedGameMs` / `pausedTurnMs` — accumulated ms at time of pause
- On pause: snapshot elapsed → accumulators; stop interval
- On resume: reset wall-clock refs to `Date.now()`; restart interval
- Computed values: `accumulator + (now - wallClockRef)`

Player switch: elapsed turn time added to outgoing player's `totalMs`; incoming player's turn resets to 0.

### StrictMode-Safe Ref Mutation Pattern
All ref side-effects in `setActivePlayer` and `togglePause` run in the function body, AFTER `setPlayers()`/`setIsPaused()` — never inside the updater callback. React calls updater functions twice in StrictMode; refs inside updaters get double-clobbered.

### Grid Layout
Dynamic viewport-filling tile layout via `useTileLayout` (ResizeObserver-driven). Algorithm: iterate column counts 1..n, pick the count that maximizes `Math.min(tileW, tileH)`. Grid uses inline CSS (`gridTemplateColumns`, `gridAutoRows`) — no Tailwind grid-cols classes. Gap of 10px between tiles accounted for: `(containerSize - gap * (cols - 1)) / cols`.

### Player Colors
Fixed 12-color palette in `PLAYER_COLORS` (`src/lib/colors.ts`), user-selectable at setup. Applied via `backgroundColor` inline style (hex strings, not Tailwind classes). Active player gets a solid inner border of `lightenColor(player.color)` (HSL-based, +25% lightness). Color conflict on setup resolves by swapping the two players' colors.

Two helpers in `src/lib/colors.ts`:
- `lightenColor(hex, amount=0.25)` — HSL-based lightening for active-card border
- `firstUnusedColor(usedColors)` — returns first `PLAYER_COLORS` entry not in the given list

### Context Architecture
`GameContext` carries only the setup player list (SetupPage → GamePage). All in-game state lives in `useGameState` inside `GamePage`. `GameContext` is exported directly for use in tests (no custom `useGameContext` wrapper required).

### No Persistence
Browser refresh resets the session entirely — by design.

## GitHub Secrets
| Secret | Purpose |
|--------|---------|
| `FLY_API_TOKEN` | Production deploy via GitHub Actions |
| `REPO_TOKEN` | CI auto-merge to master |
| `CC_WEBHOOK_SECRET` | Central Command webhook notification |

## Tagged Versions
(None yet)
