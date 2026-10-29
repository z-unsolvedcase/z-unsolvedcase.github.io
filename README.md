# Unsolved Case

An online co-op detective game for 1–4 players. Two cases included:

- **Case 1: The Last Ferry** — a ticket clerk vanished from the last ferry; reopen the file.
- **Case 2: The Darkened Light** — a lighthouse keeper's "accidental" fall, and the nights the lamp went dark.

Live at https://z-unsolvedcase.github.io/

## How it runs

- This repo's root is the game client, served by GitHub Pages.
- The authoritative game server (in `server/`) runs on a VPS; on `*.github.io`
  the client connects to it at `wss://3danatomie.com/ws` (see `js/net.js`).
- The server holds the solutions, enforces the four roles (Field Agent,
  Analyst, Interrogator, Archivist) and sends each player only their own view.
