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

**Never push to `main` and never open a PR into `main`.** Production is
only updated by the **Promote staging to production** workflow, which
points `main` at the current `staging` commit. After a promote, `main`
and `staging` are the same SHA, so `main` cannot get ahead of `staging`.

Never `git push origin HEAD:main`, never merge locally onto `main`, and
never retarget a feature PR at `main`.

### Ship a change to staging

1. Branch from `origin/staging` (not `main`).
2. Implement, commit, push the feature branch.
3. Open a PR **into `staging`**, not `main`.
4. After it merges, a push to `staging` triggers **Trigger staging Pages
   deploy**, which starts **Deploy GitHub Pages** on `main`. That rebuilds
   production from `main` and staging from `staging`, then publishes both.
5. Staging is live at `/board-game-shelf/staging/` within a minute or two.

A push to `staging` does not deploy from the `staging` ref; it only pings
`main` to republish.

### Promote staging to production

1. Actions → **Promote staging to production** → Run workflow.
2. Use workflow from **`staging`** (required until the workflow itself
   has been promoted once).
3. Type `promote` in the confirm field.
4. The job fast-forwards `main` to `origin/staging`, then dispatches
   **Deploy GitHub Pages**.

Keep production-only hotfixes rare. Prefer fixing on `staging` first, then
promoting.

### Protect main (repo owner)

Promote uses the default Actions token. That token **cannot** bypass a
“require a pull request” rule on a personal repo (GitHub Actions does
not appear in the bypass picker). Agents cannot edit rulesets (API 403).

Edit [Protect main](https://github.com/trev4ev/board-game-shelf/rules/21155803):

1. **Turn off Require a pull request before merging.** Leave it on and
   the promote push is rejected.
2. **Do not enable Restrict updates.** That also blocks `GITHUB_TOKEN`.
3. Keep **Restrict deletions** and **Block force pushes**.
4. Leave the bypass list empty. No PAT and no extra secret.

Promote only fast-forwards: `staging` must already contain every commit
on `main`. After a successful run they are the same SHA.

Anyone with write access can still push to `main` (including other
Actions jobs). Do not do that. Never open a PR into `main`. The
**Block pull requests into main** check fails those PRs; it is not a
required check unless you add it.

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
