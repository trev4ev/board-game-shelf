# Board Game Shelf — developer setup

Product overview: see `readme.txt`
Tech plan / data shape / BGG seam: see `tech-stack.txt`

## Run locally

```bash
cp .env.example .env   # add Project URL + publishable key
npm install
npm run dev
```

## Stack (Phase A)

- Vite + React + TypeScript
- React Router
- Supabase client (inactive until env vars are set; uses **publishable** key)
- `src/lib/gameLookup` stub — no BGG calls yet

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview production build
