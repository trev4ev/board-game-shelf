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
- Supabase (publishable key) for collections, games, plays, friends, and auth
- Auth: Google OAuth (primary) plus email/password and email OTP
- BGG lookup: Vite proxy in dev; Supabase Edge Function `bgg` in production

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run test:bgg` — check `BGG_API_TOKEN` against xmlapi2

## Production and staging

GitHub Actions rebuilds **both** sites on every push to `main` (the
`github-pages` environment only allows deploys from `main`):

- Production (`main`): https://trevoraquino.me/board-game-shelf/  
  (also https://trev4ev.github.io/board-game-shelf/)
- Staging (`staging` branch): https://trevoraquino.me/board-game-shelf/staging/

Push feature work to `staging`, then either merge to `main` or run
**Actions → Deploy GitHub Pages → Run workflow** on `main` to publish both.
A push to `staging` alone does not update GitHub Pages.

Staging uses the same Supabase project as production. Add these Redirect URLs
in Authentication → URL Configuration before signing in on staging:

- `https://trevoraquino.me/board-game-shelf/staging/login`
- `https://trev4ev.github.io/board-game-shelf/staging/login`

A failed deploy opens or comments on a `deploy-failure` GitHub issue (assigned to
the repo owner), which emails you if Issues notifications are on.

To get GitHub’s own failed-workflow emails (and GitHub Mobile push):

1. Watch this repository (you already do if you own it).
2. Open [Notification settings](https://github.com/settings/notifications).
3. Under **System → Actions**, enable **Email** and/or **On GitHub**, and check
   **Only notify for failed workflows**.
4. Optional: install [GitHub Mobile](https://github.com/mobile) for push alerts.

Required GitHub Actions secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### Auth redirects (required)

In the Supabase dashboard:

1. Authentication → Providers → enable **Google**. Add the Google Cloud OAuth
   Web client ID and secret. Authorized redirect URI:
   `https://<project-ref>.supabase.co/auth/v1/callback`
2. Authentication → URL Configuration → Redirect URLs: add the local origin
   `/login`, production Pages `/login`, and staging Pages `/login`:
   `https://trevoraquino.me/board-game-shelf/login`,
   `https://trevoraquino.me/board-game-shelf/staging/login`,
   `https://trev4ev.github.io/board-game-shelf/login`,
   `https://trev4ev.github.io/board-game-shelf/staging/login`.
3. Run SQL in `supabase/migrations/` if the remote schema is behind the repo
   (`20260821_protect_collection_creator.sql` stops co-owners from removing
   the original collection creator).

The Edge Function `bgg` reads `BGG_API_TOKEN` from function secrets.
