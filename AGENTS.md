# Agent notes — Board Game Shelf

This repo ships a static Vite app to GitHub Pages, with data in one
Supabase project. Read `readme.txt` for product scope and `tech-stack.txt`
for stack decisions.

## Branches and deploys

GitHub Pages has **one site** and the `github-pages` environment only
allows deploys from **`main`**. Staging is a second app in the same
artifact, built from the `staging` branch.

| URL | Source branch |
| --- | --- |
| https://trevoraquino.me/board-game-shelf/ | `main` (production) |
| https://trevoraquino.me/board-game-shelf/staging/ | `staging` |

**Do not push to `main`.** It is PR-only. Never `git push origin HEAD:main`
or merge locally onto `main`.

If a direct push to `main` still succeeds, the repo owner needs to turn
on branch protection (agents cannot: the API returns 403). Settings →
Rules → Rulesets → New branch ruleset targeting `main`: require a pull
request (0 approvals is fine), block force pushes and deletions, and do
not add bypass actors.

### Ship a change to staging

1. Branch from `origin/staging` (not `main`, unless staging is behind and
   you intend to reset).
2. Implement, commit, push the feature branch.
3. Open a PR **into `staging`**, not `main`.
4. After it merges, a push to `staging` triggers **Trigger staging Pages
   deploy**, which starts **Deploy GitHub Pages** on `main`. That rebuilds
   production from `main` and staging from `staging`, then publishes both.
5. Staging is live at `/board-game-shelf/staging/` within a minute or two.

A push to `staging` does not deploy from the `staging` ref; it only pings
`main` to republish.

### Promote staging to production

1. Open a PR **from `staging` into `main`**.
2. Merge it (do not fast-forward on the remote by pushing to `main`).
3. The merge to `main` runs **Deploy GitHub Pages** and updates production.
   Staging is rebuilt from `staging` in the same run, so it stays in sync.

Keep production-only hotfixes rare. Prefer fixing on `staging` first, then
promoting.

## Database and auth

Staging and production share the same Supabase project. Schema changes
apply to real user data. Prefer a new file in `supabase/migrations/` and
apply it with care.

Auth redirect URLs must include:

- `https://trevoraquino.me/board-game-shelf/login`
- `https://trevoraquino.me/board-game-shelf/staging/login`

## Local

```bash
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev
```

`npm run lint` and `npm run build` before you finish. Pages CI is the
deploy workflow, not a PR check.
