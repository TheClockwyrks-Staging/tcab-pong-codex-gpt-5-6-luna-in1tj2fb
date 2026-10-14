# Carom

Carom is a browser-based top-down paddle duel. Return the ball across the
field, use paddle motion to add spin, and bank shots around the two gold
obstacles. First to 11 points with a two-point lead wins.

## Install and run

```bash
npm ci
npm run dev
```

Open the local Vite URL shown in the terminal. To create the production site:

```bash
npm run build
```

The finished static site is written to `dist/` and can be served from any
static web host.

## Controls

- Solo: `W`/`S` or either arrow key pair moves your paddle; `Enter` starts the
  highlighted menu item.
- Versus: player one uses `W`/`S`; player two uses `↑`/`↓`.
- `P` pauses during a match, `Escape` pauses or goes back, and `M` toggles
  sound.

Everything is drawn and simulated locally in the browser. No network service,
account, or runtime asset download is required.
