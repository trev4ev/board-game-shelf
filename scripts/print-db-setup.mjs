console.log(`
Board Game Shelf — database setup
---------------------------------
1. Open the SQL editor:
   https://supabase.com/dashboard/project/cfzssslioogdnjyuxpvu/sql/new

2. Paste and run the contents of:
   supabase/migrations/20260812_create_games.sql

3. Paste and run the collection seed (BoardGameGeek lookup):
   supabase/migrations/20260819_seed_collection.sql

4. Authentication → Providers → enable Email
   (optional for local: disable "Confirm email" under Auth settings)

5. In the app: Owner login → create your account → Add game → Save
`)
