Board Game Shelf
================

A web app to catalog the board games you own, filter the collection for
game night, and pick something to play — manually or at random.


Core functionality
------------------
- Add, edit, and remove games from your collection
- Store game details aligned with BoardGameGeek fields (players, play
  time, categories, mechanics, complexity 1–5, images, etc.) plus collection
  fields (favorites, last played, play count, notes)
- Search by game name
- Filter with multi-select support for players, time, category, complexity,
  favorites, and other stored fields
- Browse the filtered list and select a game
- Randomly pick a game from the current (filtered) results
- Guest (view-only) vs owner (edit) access
- Mobile-friendly layout for use at the table
- Share or allow others to browse and filter the collection

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
