console.log(`
Board Game Shelf — database setup
---------------------------------
1. Open the SQL editor:
   https://supabase.com/dashboard/project/cfzssslioogdnjyuxpvu/sql/new

2. Paste and run, in order:
   supabase/migrations/20260812_create_games.sql
   supabase/migrations/20260819_create_plays.sql
   supabase/migrations/20260820_accounts_collections.sql
   supabase/migrations/20260821_protect_collection_creator.sql

3. Authentication → Providers:
   - Enable Email
   - Enable Google (Web client ID/secret from Google Cloud). Redirect URI:
     https://cfzssslioogdnjyuxpvu.supabase.co/auth/v1/callback
   Add local and GitHub Pages /login URLs under Authentication → URL Configuration.

4. In the app: Sign in → choose a username → add games to your collection
`)
