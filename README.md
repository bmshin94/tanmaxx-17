# GainsMax

> A single-user lifting tracker that uses every TanStack library. Built as the demo app for the "tanmax" video — a tour of TanStack in a silly format.

Local-first lifting tracker with offline-friendly set logging and AI-generated programs. Centerpiece is **The Maxx** — a Ranger-driven intensity slider that controls program generation *and* the entire app's visual style, going progressively more unhinged as it climbs (Deload → Volume → Hypertrophy → Strength → Peaking → Sendmode → **GIGAMAXX** → **INJURY ZONE**).

## Library matrix

| # | Library | Role |
|---|---|---|
| 1 | **CLI** (`create-tanstack`) | Cold-open scaffold |
| 2 | **Config** (`@tanstack/config`) | Shared build/lint presets — opt-in |
| 3 | **Start** (`@tanstack/react-start`) | App shell, SSR, server functions, API routes |
| 4 | **Router** (`@tanstack/react-router`) | File-based routes, type-safe nav, search-param state |
| 5 | **Store** (`@tanstack/store`) | Ephemeral session state (current exercise, rest timer, sync counter, Maxx) |
| 6 | **Query** (`@tanstack/react-query`) | Read-heavy server data + SSR-query integration |
| 7 | **Virtual** (`@tanstack/react-virtual`) | `/exercises` 5,238-row catalog |
| 8 | **Table** (`@tanstack/react-table`) | `/history` sortable view |
| 9 | **Form** (`@tanstack/react-form`) | Live set logging on `/session/$id` |
| 10 | **DB** (`@tanstack/db`) | Reactive client collections with optimistic mutations |
| 11 | **Pacer** (`@tanstack/react-pacer`) | Debounced exercise search |
| 12 | **Hotkeys** (`@tanstack/react-hotkeys`) | Keyboard-driven logging + vim chord nav (`gg`/`gh`/`gs`) |
| 13 | **AI** (Vercel `ai` + `@ai-sdk/anthropic`) | Natural-language set entry, program generation, generative reports |
| 14 | **Ranger** (`@tanstack/react-ranger`) | The Maxx two-handle slider — drives the theme engine |
| 15 | **Intent** (`@tanstack/intent`) | Ships `packages/skill` as a discoverable Agent Skill |
| 16 | **Devtools** (`@tanstack/react-devtools`) | Stacked panels — the punchline shot |

## Monorepo layout

```
gainsmax/
├── apps/
│   └── web/                        # TanStack Start app
│       ├── src/
│       │   ├── routes/             # File-based routes (incl. /api/parse-set, /api/chat)
│       │   ├── server/             # DB, server functions, AI provider/tools
│       │   ├── db/                 # @tanstack/db collections + hook
│       │   ├── state/              # @tanstack/store: session, maxx, sync
│       │   ├── components/         # AppShell, MaxxSlider, NLSetInput, …
│       │   └── hooks/              # use-app-hotkeys, use-maxx-style
│       ├── scripts/                # generate-skill.ts (regenerates SKILL.md)
│       └── public/fonts/           # Self-hosted Anton (GIGAMAXX font)
├── packages/
│   ├── shared/                     # Zod schemas + types
│   └── skill/                      # Agent Skill discoverable by @tanstack/intent
│       └── skills/gainsmax-core/SKILL.md
└── pnpm-workspace.yaml
```

## Quickstart

Requires Node 24+ (for `--experimental-strip-types` in seed/generator scripts) and pnpm.

```bash
pnpm install
echo "ANTHROPIC_API_KEY=sk-ant-…" > apps/web/.env.local

pnpm --filter @gainsmax/web exec drizzle-kit push   # create SQLite schema
pnpm --filter @gainsmax/web seed                    # 5,238 exercises + demo data
pnpm dev                                            # http://localhost:3000
```

## Routes

| Path | Notes |
|---|---|
| `/` | Dashboard |
| `/exercises` | 5,238 virtualized rows + Pacer-debounced search |
| `/programs`, `/programs/$id` | Programs (read-only for the video) |
| `/session/$id` | Hotkey-driven logger; press `?` for the binding sheet |
| `/history` | Sortable react-table |
| `/agent` | Streaming chat with `logSet` / `queryPRs` / `generateProgram` tools |
| `/api/parse-set` | Non-streaming NL → set parser (`generateObject`) |
| `/api/chat` | Streaming chat endpoint (`streamText` + tools) |

## Hotkeys (on `/session/$id`)

| Key | Action |
|---|---|
| `space` | Log current set |
| `↑` / `↓` | ±5 lb |
| `←` / `→` | ±1 rep |
| `r` | Start 90s rest timer |
| `s` | Skip set |
| `[` / `]` | Prev / next exercise |
| `gg` | Dashboard |
| `gh` | History |
| `gs` | Current session |
| `?` | Help overlay |

## The Maxx

Two-handle slider, 0–110. The upper handle drives the theme; both feed the AI as `%1RM` intensity bounds. State persisted to localStorage; an inline pre-hydration script restores it before React boots (no FOUC at GIGAMAXX). Self-hosted Anton font preloaded so the GIGAMAXX swap is jank-free.

## Intent skill

`packages/skill` is shaped to be discoverable by `@tanstack/intent`. With the skill installed as a workspace dep of `apps/web`, it appears in `intent list` alongside the rest of the TanStack ecosystem:

```
@gainsmax/skill                  local   0.1.0     1
  gainsmax-core             [core]        Programmatically drive the GainsMax lifting tracker…
  Load: pnpm dlx @tanstack/intent@latest load @gainsmax/skill#gainsmax-core
```

Regenerate the skill from the canonical `_metadata.ts`:

```bash
pnpm gen:skill
```

## Useful scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the Start dev server (`:3000`) |
| `pnpm build` | Build for Nitro |
| `pnpm typecheck` | All workspaces |
| `pnpm gen:skill` | Re-render `packages/skill/skills/gainsmax-core/SKILL.md` from `_metadata.ts` |
| `pnpm skill:list` | `intent list` |
| `pnpm skill:validate` | `intent validate packages/skill` |
| `pnpm --filter @gainsmax/web seed` | Wipe + reseed exercises and demo sessions |

## Locked decisions

- **Persistence**: SQLite + Drizzle (server) + `@tanstack/db` collections (client). No Convex.
- **Auth**: none. Single user.
- **Seed**: yuhonas/free-exercise-db (Public Domain), fanned out to 5,238 rows via grip variants for catalog visual impact.
- **Display font (GIGAMAXX)**: Anton (SIL OFL), self-hosted, `size-adjust: 110%` against the fallback.
