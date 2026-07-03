# Dartz

A multiplayer 501 darts web app. Create a lobby, invite friends, take turns on
an interactive 3D dartboard, and track your match history and stats over time.

Test it live at [dartz.finn-koehler.com](https://dartz.finn-koehler.com).

## Features

### Gameplay

- **Real-time multiplayer 501** with authoritative server-side scoring. Throws,
  busts, checkouts, and turn order are all validated by the Game Server, so
  clients can't cheat or desync.
- **Match formats** — play a single leg, first-to-N legs, or best-of-sets with
  configurable targets.
- **Two input modes per turn**: click directly on a 3D dartboard rendered with
  Three.js / react-three-fiber, or enter scores manually with multiplier
  toggles. Switch freely between them mid-turn.
- **Live checkout suggestions** appear under your score whenever a finish is
  possible from your current total.
- **Bust detection** — busts preserve the starting score and record a zero
  throw so averages stay consistent.
- **Undo** — the lobby owner can revert the most recent turn.
- **Play Again** after a match resets scores, legs, and sets for the same
  lobby without requiring everyone to re-join.
- Three game modes, all played with the same legs/sets match format:
  - **501** — classic countdown; first to exactly zero wins the leg.
  - **Around the Clock** — hit 1 through 20 in order (any multiplier counts),
    then finish on the Bull.
  - **Double Training** — hit D1 through D20 in order; only doubles on the
    current target count.

### Lobbies and presence

- **Shareable lobby codes** so friends can join by code or by clicking an
  invite in their notifications.
- **Spectator fallback** — joining a lobby where the game has already started
  drops you in as a spectator who still sees live score and dart-position
  updates.
- **Live dart position sync** — while the active player is aiming, spectators
  see the darts land on the board in real time (not just the final score).
- **Disconnect handling** — leaving the tab keeps you in the lobby as
  "disconnected" so you can reconnect without losing your score.
- **Skip-vote** — when a player goes offline mid-turn, the remaining connected
  players can vote to skip their turn instead of waiting them out.
- **Automatic cleanup** of fully-abandoned lobbies after an idle timeout.

### Friends and social

- **Friend requests** with accept/decline from an in-app notifications
  popover.
- **Online status** for friends, updated in real time when they connect or
  disconnect.
- **Lobby invites** — invite friends directly from the friend list; invites
  clear automatically when the lobby is deleted or the invite is accepted,
  kept in sync across open tabs.

### Profile and history

- **User profiles** with avatar, bio, member-since date, and customizable dart
  color.
- **Match history** — paginated list of every completed match, including
  opponents, format, and outcome.
- **Match detail / replay view** — inspect every leg, turn, and individual
  dart from a past match.
- **Statistics** — 3-dart average, 100+ scores, highest score, win rate,
  per-opponent head-to-head, a GitHub-style activity heatmap, and an
  average-per-match trend line over time.
- **Settings** — theme switcher (light/dark), profile edits, logout.

## Architecture

Three services make up the app:

- **Web** — Next.js 14 frontend hosted on Vercel. Source: [`dartz/`](dartz/).
- **REST API** — ASP.NET Core 8 handling auth, match history, stats, and
  friends CRUD. PostgreSQL-backed. Hosted on Render as a Docker service.
  Source: [`api/dartz-api/`](api/dartz-api/).
- **Game Server** — ASP.NET Core 8 + SignalR (WebSockets). Holds lobby and
  game state in memory and is the authority for 501 game logic. Hosted on
  Render as a Docker service. Source: [`api/Dartz.GameServer/`](api/Dartz.GameServer/).

The REST API persists to PostgreSQL. The Game Server posts completed matches
to the REST API via `ApiBaseUrl` for historization, so the authoritative game
logic and the history store stay consistent.

## Running locally

Prerequisites: .NET 8 SDK, Node.js 20+, a PostgreSQL instance.

```bash
# 1. REST API (port 7128)
cd api/dartz-api
# configure DB_SERVER / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD / DB_TRUST_CERT
dotnet run

# 2. Game Server (port 5063)
cd api/Dartz.GameServer
dotnet run

# 3. Frontend (port 3000)
cd dartz
npm install
# dartz/.env:
#   NEXT_PUBLIC_BASE_URL=https://localhost:7128/
#   NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:5063
npm run dev
```

## Tests

Server-side tests live in [`api/Dartz.GameServer.Tests/`](api/Dartz.GameServer.Tests/).
They cover pure game logic (throws, busts, checkouts, set/leg transitions),
in-memory state services (lobbies, presence, invites), and end-to-end SignalR
flows (spectators, skip votes, disconnect, play-again, invite lifecycle)
driven by real `HubConnection` clients against an in-memory TestServer.

```bash
dotnet test api/Dartz.GameServer.Tests/Dartz.GameServer.Tests.csproj
```

## CI and deployment

GitHub Actions (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml))
runs on every pull request and on pushes to `master`:

- `GameServer tests` — restore, build, run the xUnit suite, upload results.
- `REST API build` — restore and build the REST API project.

Pushes to `master` trigger auto-deploys on Render (REST API, Game Server) and
Vercel (frontend). Branch protection on `master` requires both CI checks to
pass before a PR can merge, so red CI blocks a deploy.
