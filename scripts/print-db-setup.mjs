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
   supabase/migrations/20260822_collection_invite_links.sql

3. Authentication → Providers:
   - Enable Email
   - Confirm email can stay on; the prepare-email-login Edge Function marks
     first-time OTP users confirmed so they get a magic code, not a
     "confirm your email" link. (OTP is the proof they own the inbox.)
   - Enable Google (Web client ID/secret from Google Cloud). Redirect URI:
     https://cfzssslioogdnjyuxpvu.supabase.co/auth/v1/callback
   Site URL should be the production app
   (https://trevoraquino.me/board-game-shelf/). Add local, production, and
   staging /login URLs under Authentication → URL Configuration.

4. In the app: Sign in → choose a username → add games to your collection
`)
