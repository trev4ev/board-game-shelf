# Board Game Shelf — developer setup

Product overview: see `readme.txt`
Tech plan / data shape / BGG seam: see `tech-stack.txt`

## Run locally

```bash
cp .env.example .env   # add Project URL, publishable key, BGG_API_TOKEN
npm install
npm run dev
```

Set `VITE_BGG_LOOKUP_ENABLED=true` to search BoardGameGeek through the local
Vite proxy (`/api/bgg`). The token stays on the Vite server.

## Stack

- Vite + React + TypeScript, deployed to GitHub Pages
- React Router (`basename` matches `VITE_BASE_PATH` on Pages)
- Supabase (publishable key) for the games table + owner email auth
- BGG lookup: Vite proxy in dev; Supabase Edge Function `bgg` in production

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run test:bgg` — check `BGG_API_TOKEN` against xmlapi2

## Production

GitHub Actions builds on `main` and deploys to Pages
(`https://trev4ev.github.io/board-game-shelf/` or the repo’s Pages custom domain).

Required GitHub Actions secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

In the Supabase dashboard, add the Pages URL (and `/login`) to Auth redirect
allow-list. The Edge Function `bgg` reads `BGG_API_TOKEN` from function secrets.
