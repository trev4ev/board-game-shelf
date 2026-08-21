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
4. The job force-with-lease updates `main` to `origin/staging`, then
   dispatches **Deploy GitHub Pages**.

Keep production-only hotfixes rare. Prefer fixing on `staging` first, then
promoting.

### Protect main (repo owner)

This is a personal repo. The bypass picker will **not** offer GitHub
Actions. Eligible bypass actors are repository roles, installed GitHub
Apps, and (on orgs) teams — not `github-actions[bot]`. The promote
workflow therefore pushes with a PAT that belongs to you, not with
`GITHUB_TOKEN`.

Agents cannot change rulesets or secrets (API 403).

**1. Bypass actor you can actually select**

Edit [Protect main](https://github.com/trev4ev/board-game-shelf/rules/21155803)
→ **Add bypass** → under Suggestions choose **Repository admin** →
**Always allow**.

That is the role you already have. A PAT created by you matches it; the
default Actions token does not.

**2. Fine-grained PAT stored as `PROMOTE_TOKEN`**

1. [Fine-grained tokens](https://github.com/settings/personal-access-tokens)
   → Generate new token.
2. Resource owner: your account. Repository access: **Only select
   repositories** → `board-game-shelf`.
3. Permissions → **Contents: Read and write**. Nothing else.
4. Generate, then repo Settings → Secrets and variables → Actions →
   New repository secret named **`PROMOTE_TOKEN`**.

**3. Other ruleset settings**

1. **Restrict deletions:** on.
2. **Block force pushes:** on (the PAT still bypasses).
3. **Turn off Require a pull request before merging.** That rule is
   meant for a PR-into-main workflow. Squash merges onto `main` create
   commits that are not on `staging`.
4. Optional: **Restrict updates** on, so only bypass actors can move
   `main` (blocks everyone who is not an admin).

Because the bypass identity is **you**, `git push origin HEAD:main` from
your laptop will also succeed. Do not do that; only run **Promote
staging to production**. Other people, and agents using `GITHUB_TOKEN`,
stay blocked.

To lock even the owner out, create a GitHub App, install it on this
repo, add **that app** (it will appear under Apps in the bypass picker),
and stop using Repository admin as a bypass. The PAT path above is
enough for this repo.

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
