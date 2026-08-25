Board Game Shelf
================

A web app to catalog the board games you own, filter the collection for
game night, and pick something to play — manually or at random.


Core functionality
------------------
- Create an account (Google, or email) and choose a username
- Create collections; invite other users as co-owners (the original
  creator cannot be removed by others). Share an invite link, or add
  someone by username
- Add, edit, and remove games from a collection you co-own
- Store game details aligned with BoardGameGeek fields (players, play
  time, categories, mechanics, complexity 1–5, images, etc.) plus collection
  fields (favorites, last played, play count, notes)
- Search by game name
- Filter with multi-select support for players, time, category, complexity,
  favorites, and other stored fields
- Browse the filtered list and select a game
- Randomly pick a game from the current (filtered) results
- Add friends by username; tag friends or co-owners when logging a play
- Browse friends' collections from the home page or a friend's profile
- Guest names (no account) can still be recorded on a play
- Anyone with a collection URL can browse, filter, and random-pick
- Mobile-friendly layout for use at the table

BoardGameGeek prefill (after API token is approved)
---------------------------------------------------
- Search BGG by name when adding a game; prefill the form; edit; save
- Manual entry ships first; lookup plugs in behind a GameLookup seam
  (see tech-stack.txt Phasing / BGG seam)


Deferred ideas (not in scope yet)
---------------------------------
- Expansion / base-game linking
- Exclude recently played games from random pick
- Photos beyond the BGG thumbnail/image we already store
- Shortlist / "tonight's candidates" before random pick
