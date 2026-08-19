-- Seed the owned collection from BoardGameGeek thing+stats.
-- Looked up via the production BGG Edge Function on 2026-08-19.
-- Run in Supabase Dashboard → SQL → New query
-- Project: https://supabase.com/dashboard/project/cfzssslioogdnjyuxpvu/sql/new
--
-- Upserts on bgg_id. Existing shelf fields (play_count, last_played,
-- is_favorite, notes) are left unchanged.
--
--  36218 Dominion
-- 148228 Splendor
-- 266524 Parks
-- 275215 Namiji
-- 336986 Flamecraft
-- 298069 Cubitos
--  10547 Betrayal at House on the Hill
--    822 Carcassonne
-- 246784 Cryptid
-- 287954 Azul: Summer Pavilion
-- 282483 Escape from Iron Gate
-- 266192 Wingspan
-- 214396 Campy Creatures
-- 178900 Codenames
-- 172225 Exploding Kittens
-- 140934 Arboretum
-- 234190 Unstable Unicorns
-- 395623 Harvest (2024)
-- 229218 A Game of Thrones: Catan – Brotherhood of the Watch
-- 201808 Clank!: A Deck-Building Adventure
-- 350184 Earth
-- 202426 Sidereal Confluence
-- 295947 Cascadia
--   9209 Ticket to Ride
-- 179719 Risk: Game of Thrones
--   1111 Taboo
-- 274533 Throw Throw Burrito
-- 336622 Wrong Party
--   2453 Blokus

insert into public.games (
  bgg_id,
  name,
  year_published,
  description,
  min_players,
  max_players,
  min_play_time,
  max_play_time,
  play_time,
  min_age,
  categories,
  mechanics,
  bgg_rating,
  weight,
  thumbnail_url,
  image_url
)
select
  (g->>'bgg_id')::integer,
  g->>'name',
  (g->>'year_published')::integer,
  g->>'description',
  (g->>'min_players')::integer,
  (g->>'max_players')::integer,
  (g->>'min_play_time')::integer,
  (g->>'max_play_time')::integer,
  (g->>'play_time')::integer,
  (g->>'min_age')::integer,
  coalesce(array(select jsonb_array_elements_text(g->'categories')), '{}'::text[]),
  coalesce(array(select jsonb_array_elements_text(g->'mechanics')), '{}'::text[]),
  (g->>'bgg_rating')::double precision,
  (g->>'weight')::double precision,
  g->>'thumbnail_url',
  g->>'image_url'
from jsonb_array_elements($bggseed$
[
  {
    "bgg_id": 36218,
    "name": "Dominion",
    "year_published": 2008,
    "description": "\"You are a monarch, like your parents before you, a ruler of a small pleasant kingdom of rivers and evergreens. Unlike your parents, however, you have hopes and dreams! You want a bigger and more pleasant kingdom, with more rivers and a wider variety of trees. You want a Dominion! In all directions lie fiefs, freeholds, and feodums. All are small bits of land, controlled by petty lords and verging on anarchy. You will bring civilization to these people, uniting them under your banner.\n\nBut wait! It must be something in the air; several other monarchs have had the exact same idea. You must race to get as much of the unclaimed land as possible, fending them off along the way. To do this you will hire minions, construct buildings, spruce up your castle, and fill the coffers of your treasury. Your parents wouldn't be proud, but your grandparents, on your mother's side, would be delighted.\"\n\n—description from the back of the box\n\nIn Dominion, each player starts with an identical, very small deck of cards.  In the center of the table is a selection of other cards the players can \"buy\" as they can afford them.  Through their selection of cards to buy, and how they play their hands as they draw them, the players construct their deck on the fly, striving for the most efficient path to the precious victory points by game end.\n\nDominion is not a Collectible Card Game (CCG), but the play of the game is similar to the construction and play of a CCG deck. The game comes with 500 cards. You select 10 of the 25 Kingdom card types to include in any given play—leading to immense variety.\n\n—user summary\n\nPart of the Dominion series.",
    "min_players": 2,
    "max_players": 4,
    "min_play_time": 30,
    "max_play_time": 30,
    "play_time": 30,
    "min_age": 13,
    "categories": [
      "Card Game",
      "Medieval"
    ],
    "mechanics": [
      "Deck, Bag, and Pool Building",
      "Delayed Purchase",
      "Hand Management",
      "Open Drafting",
      "Take That",
      "Variable Set-up"
    ],
    "bgg_rating": 7.6,
    "weight": 2.34,
    "thumbnail_url": "https://cf.geekdo-images.com/j6iQpZ4XkemZP07HNCODBA__small/img/B2u2ghwlmI_qsUtCwuvcbnBcIqU=/fit-in/200x150/filters:strip_icc()/pic394356.jpg",
    "image_url": "https://cf.geekdo-images.com/j6iQpZ4XkemZP07HNCODBA__original/img/96COuakNiLRrjDLc1sM4Zxsw4WE=/0x0/filters:format(jpeg)/pic394356.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 148228,
    "name": "Splendor",
    "year_published": 2014,
    "description": "Splendor is a game of chip-collecting and card development. Players are merchants of the Renaissance trying to buy gem mines, means of transportation, shops—all in order to acquire the most prestige points. If you're wealthy enough, you might even receive a visit from a noble at some point, which of course will further increase your prestige.\n\nOn your turn, you may (1) collect chips (gems), or (2) buy and build a card, or (3) reserve one card. If you collect chips, you take either three different kinds of chips or two chips of the same kind. If you buy a card, you pay its price in chips and add it to your playing area. To reserve a card—in order to make sure you get it, or, why not, your opponents don't get it—you place it in front of you face down for later building; this costs you a round, but you also get gold in the form of a joker chip, which you can use as any gem.\n\nAll of the cards you buy increase your wealth as they give you a permanent gem bonus for later buys; some of the cards also give you prestige points. In order to win the game, you must reach 15 prestige points before your opponents do.",
    "min_players": 2,
    "max_players": 4,
    "min_play_time": 30,
    "max_play_time": 30,
    "play_time": 30,
    "min_age": 10,
    "categories": [
      "Card Game",
      "Economic",
      "Renaissance"
    ],
    "mechanics": [
      "Contracts",
      "Open Drafting",
      "Race",
      "Set Collection"
    ],
    "bgg_rating": 7.42,
    "weight": 1.77,
    "thumbnail_url": "https://cf.geekdo-images.com/vNFe4JkhKAERzi4T0Ntwpw__small/img/KKU_42Uswt4tKCpf1zY5kTzgr-g=/fit-in/200x150/filters:strip_icc()/pic8234167.png",
    "image_url": "https://cf.geekdo-images.com/vNFe4JkhKAERzi4T0Ntwpw__original/img/rqcUdtu_N4v-SpI96XVmpYHnJww=/0x0/filters:format(png)/pic8234167.png",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 266524,
    "name": "Parks",
    "year_published": 2019,
    "description": "PARKS is a celebration of the US National Parks featuring illustrious art from Fifty-Nine Parks.\n\nIn PARKS, players will take on the role of two hikers as they trek through different trails across four seasons of the year. While on the trail, these hikers will take actions and collect memories of the places your hikers visit. These memories are represented by various resource tokens like mountains and forests. Collecting these memories in sets will allow players to trade them in to visit a National Park at the end of each hike.\n\nEach trail represents one season of the year, and each season, the trails will change and grow steadily longer. The trails, represented by tiles, get shuffled in between each season and laid out anew for the next round. Resources can be tough to come by especially when someone is at the place you’re trying to reach! Campfires allow you to share a space and time with other hikers. Canteens and Gear can also be used to improve your access to resources through the game. It’ll be tough to manage building up your engine versus spending resources on parks, but we bet you’re up to the challenge. Welcome to PARKS!\n\n—description from the publisher",
    "min_players": 1,
    "max_players": 5,
    "min_play_time": 30,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 10,
    "categories": [
      "Animals",
      "Economic",
      "Environmental",
      "Travel"
    ],
    "mechanics": [
      "Contracts",
      "End Game Bonuses",
      "Events",
      "Modular Board",
      "Solo / Solitaire Game",
      "Track Movement",
      "Turn Order: Claim Action",
      "Variable Set-up",
      "Worker Placement"
    ],
    "bgg_rating": 7.61,
    "weight": 2.13,
    "thumbnail_url": "https://cf.geekdo-images.com/mF2cSNRk2O6HtE45Sl9TcA__small/img/K2AgL-KE_CTcvwahWd7zlt9YR0U=/fit-in/200x150/filters:strip_icc()/pic4852372.jpg",
    "image_url": "https://cf.geekdo-images.com/mF2cSNRk2O6HtE45Sl9TcA__original/img/_KNgPoC_4l7iN0ntbFILexOJpfc=/0x0/filters:format(jpeg)/pic4852372.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 275215,
    "name": "Namiji",
    "year_published": 2022,
    "description": "In Namiji, you are fishers from the Japan of yesteryear, navigating south of the Japanese archipelago, a few kilometers from the famous Tokaido road. You will need to have a fruitful day at sea to win the game.\n\nTo do this, you will have the opportunity to contemplate magnificent marine species, to fish with a line or a net to fill your racks with colorful fish, and haul in your crustacean traps.\n\nYou can benefit from stops to improve your fishing equipment, and you will also have to contend with the gods of the sea by setting offerings afloat, or by fulfilling their wishes that they express during your contemplation with the Sacred Rocks, for which they will reward you.\n\nNamiji features gameplay similar to Tokaido. The action spaces are laid out on the game board in a linear track, with players advancing down this track to take actions. The player who is currently last on the track takes a turn by advancing forward on the track to their desired action and taking that action, so players must choose whether to advance slowly in order to get more turns, or to travel more rapidly to beat other players to their desired action spaces. What players are doing on the track differs from what they do in Tokaido.",
    "min_players": 2,
    "max_players": 5,
    "min_play_time": 30,
    "max_play_time": 45,
    "play_time": 45,
    "min_age": 8,
    "categories": [
      "Travel"
    ],
    "mechanics": [
      "Push Your Luck",
      "Set Collection",
      "Track Movement",
      "Turn Order: Time Track",
      "Variable Player Powers"
    ],
    "bgg_rating": 7.1,
    "weight": 1.75,
    "thumbnail_url": "https://cf.geekdo-images.com/AW6IWjNVwOOLxVHepkQk1g__small/img/pDLMyt8zz2ga13wKW0ayyjVRkOw=/fit-in/200x150/filters:strip_icc()/pic4629265.jpg",
    "image_url": "https://cf.geekdo-images.com/AW6IWjNVwOOLxVHepkQk1g__original/img/vrWnwd7-67YNTr4XFra222jO3Sk=/0x0/filters:format(jpeg)/pic4629265.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 336986,
    "name": "Flamecraft",
    "year_published": 2022,
    "description": "Artisan dragons, the smaller and magically talented versions of their larger (and destructive) cousins, are sought by shopkeepers so that they may delight customers with their flamecraft. You are a Flamekeeper, skilled in the art of conversing with dragons, placing them in their ideal home and using enchantments to entice them to produce wondrous things. Your reputation will grow as you aid the dragons and shopkeepers, and the Flamekeeper with the most reputation will be known as the Master of Flamecraft.\n\nIn Flamecraft, 1-5 players take on the role of Flamekeepers, gathering items, placing dragons and casting enchantments to enhance the shops of the town. Dragons are specialized (bread, meat, iron, crystal, plant and potion) and the Flamekeepers know which shops are the best home for each. Visit a shop to gain items and a favor from one of the dragons there.  Gathered items can be used to enchant a shop, gaining reputation and the favors of all the dragons in the shop. If you are fortunate enough to attract fancy dragons then you will have opportunities to secure even more reputation.\n\n—description from the publisher",
    "min_players": 1,
    "max_players": 5,
    "min_play_time": 60,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 10,
    "categories": [
      "Animals",
      "Card Game",
      "City Building",
      "Fantasy"
    ],
    "mechanics": [
      "Contracts",
      "End Game Bonuses",
      "Hand Management",
      "Modular Board",
      "Multi-Use Cards",
      "Set Collection",
      "Solo / Solitaire Game",
      "Tags",
      "Worker Placement"
    ],
    "bgg_rating": 7.37,
    "weight": 2.19,
    "thumbnail_url": "https://cf.geekdo-images.com/EvGtnsBDcfnKiqSiXHothQ__small/img/bQcyvzYRdMFFvcdQkFVnIRiCPjE=/fit-in/200x150/filters:strip_icc()/pic6605448.jpg",
    "image_url": "https://cf.geekdo-images.com/EvGtnsBDcfnKiqSiXHothQ__original/img/7yj8nA0ObuZ1w5AYCThEOK6meWA=/0x0/filters:format(jpeg)/pic6605448.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 298069,
    "name": "Cubitos",
    "year_published": 2021,
    "description": "Be fast or be last!\n\nIn Cubitos, players take on the role of participants in the annual Cube Cup, a race of strategy and luck to determine the Cubitos Champion. Each player has a runner on the racetrack and a support team, which is represented by all the dice you roll. Each turn, you roll dice and use their results to move along the racetrack, buy new dice, and use abilities — but you must be careful not to push your luck rolling too much or you could bust!\n\n—description from the publisher",
    "min_players": 2,
    "max_players": 4,
    "min_play_time": 30,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 10,
    "categories": [
      "Dice",
      "Racing"
    ],
    "mechanics": [
      "Catch the Leader",
      "Deck, Bag, and Pool Building",
      "Delayed Purchase",
      "Dice Rolling",
      "Grid Movement",
      "Market",
      "Movement Points",
      "Push Your Luck",
      "Race",
      "Re-rolling and Locking",
      "Variable Set-up"
    ],
    "bgg_rating": 7.35,
    "weight": 2.17,
    "thumbnail_url": "https://cf.geekdo-images.com/_WY_JrQQRrSUlVof11hMpQ__small/img/YBgLAPTM5xOW3fDj_if3-r3oDs0=/fit-in/200x150/filters:strip_icc()/pic5226311.png",
    "image_url": "https://cf.geekdo-images.com/_WY_JrQQRrSUlVof11hMpQ__original/img/x5IICp6q86ozlyzJjTcoNkMELnI=/0x0/filters:format(png)/pic5226311.png",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 10547,
    "name": "Betrayal at House on the Hill",
    "year_published": 2004,
    "description": "Betrayal at House on the Hill quickly builds suspense and excitement as players explore a haunted mansion of their own 'design', encountering spirits and frightening omens that foretell their fate.\n\nBetrayal at House on the Hill is a tile game that allows players to lay out the haunted house room by room, tile by tile, creating a new game board every time. The game is designed for three to six people, each of whom plays one of six possible characters.\n\nPlayers explore the haunted house, gathering items and discovering secrets, until one of the characters triggers a haunt and a monster hunts the rest of the party. The innocent members of the party must defeat the monster in their midst before the monster gets them!\n\nWith 50 possible haunts and variable character powers each game, the games has great replayability.",
    "min_players": 3,
    "max_players": 6,
    "min_play_time": 60,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 12,
    "categories": [
      "Adventure",
      "Exploration",
      "Horror"
    ],
    "mechanics": [
      "Dice Rolling",
      "Map Addition",
      "Modular Board",
      "Player Elimination",
      "Role Playing",
      "Storytelling",
      "Team-Based Game",
      "Traitor Game",
      "Variable Player Powers"
    ],
    "bgg_rating": 7.01,
    "weight": 2.4,
    "thumbnail_url": "https://cf.geekdo-images.com/lqmt2Oti_qJS65XqHcB8AA__small/img/EDOmDbRhLy4za2PHkJ5IbhNxZmk=/fit-in/200x150/filters:strip_icc()/pic5146864.png",
    "image_url": "https://cf.geekdo-images.com/lqmt2Oti_qJS65XqHcB8AA__original/img/7R6yYk8A2eUMmSDaxGjae5SceGI=/0x0/filters:format(png)/pic5146864.png",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 822,
    "name": "Carcassonne",
    "year_published": 2000,
    "description": "Carcassonne is a tile placement game in which the players draw and place a tile with a piece of southern French landscape represented on it. The tile might feature a city, a road, a cloister, grassland or some combination thereof, and it must be placed adjacent to tiles that have already been played, in such a way that cities are connected to cities, roads to roads, et cetera. Having placed a tile, the player can then decide to place one of their meeples in one of the areas on it: in the city as a knight, on the road as a robber, in the cloister as a monk, or in the field as a farmer. When that area is complete that meeple scores points for its owner.\n\nDuring a game of Carcassonne, players are faced with decisions like: \"Is it really worth putting my last meeple there?\" or \"Should I use this tile to expand my city, or should I place it near my opponent instead, thus making it a harder for them to complete it and score points?\" Since players place only one tile and have the option to place one meeple on it, turns proceed quickly even if it is a game full of options and possibilities.\n\nFirst game in the Carcassonne series.",
    "min_players": 2,
    "max_players": 5,
    "min_play_time": 30,
    "max_play_time": 45,
    "play_time": 45,
    "min_age": 7,
    "categories": [
      "Medieval",
      "Territory Building"
    ],
    "mechanics": [
      "Area Majority / Influence",
      "Enclosure",
      "Kill Steal",
      "Map Addition",
      "Pattern Building",
      "Square Grid",
      "Tile Placement"
    ],
    "bgg_rating": 7.42,
    "weight": 1.88,
    "thumbnail_url": "https://cf.geekdo-images.com/peUgu3A20LRmAXAMyDQfpQ__small/img/oEEslN-EGqh82sNI6Aj4_MFXYg0=/fit-in/200x150/filters:strip_icc()/pic8621446.jpg",
    "image_url": "https://cf.geekdo-images.com/peUgu3A20LRmAXAMyDQfpQ__original/img/bP18m_PYjyFOv1IBGgMOteQUneA=/0x0/filters:format(jpeg)/pic8621446.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 246784,
    "name": "Cryptid",
    "year_published": 2018,
    "description": "You've studied the footage, connected the dots, and gathered what meager evidence you could. You're close — soon the whole world will know the truth behind the Cryptid. A group of like-minded cryptozoologists have come together to finally uncover the elusive creature, but the glory of discovery is too rich to share. Without giving away some of what you know you will never succeed in locating the beast, but reveal too much and your name will be long forgotten!\n\nCryptid is a unique deduction game of honest misdirection in which players must try to uncover information about their opponents' clues while throwing them off the scent of their own. Each player holds one piece of evidence to help them find the creature, and on their turn they can try to gain more information from their opponents. Be warned; give too much away and your opponents might beat you to the mysterious animal and claim the glory for themselves!\n\nThe game includes a modular board, five clue books, and a deck of set-up cards with hundreds of possible set-ups across two difficulty levels. It is also supported by an entirely optional digital companion, allowing for faster game set-up and a near-infinite range of puzzles.\n\n—description from the publisher\n\nNote: some copies have a delta clue booklet with misprints in eight clues:\n\n    2,#9,#13,#64 states cougar, should be bear\n    3,#63,#72,#95 states bear, should be cougar",
    "min_players": 3,
    "max_players": 5,
    "min_play_time": 30,
    "max_play_time": 50,
    "play_time": 50,
    "min_age": 10,
    "categories": [
      "Deduction"
    ],
    "mechanics": [
      "Deduction",
      "Hexagon Grid",
      "Induction",
      "Modular Board",
      "Pattern Recognition",
      "Race"
    ],
    "bgg_rating": 7.42,
    "weight": 2.25,
    "thumbnail_url": "https://cf.geekdo-images.com/qrPLpAnhFgc470ZRuXlvbg__small/img/ZFL0o-lhnuWE21Sa9YS8qi8ayGU=/fit-in/200x150/filters:strip_icc()/pic4037705.jpg",
    "image_url": "https://cf.geekdo-images.com/qrPLpAnhFgc470ZRuXlvbg__original/img/QenUCVaFRry4-wlimHmeLn226Bo=/0x0/filters:format(jpeg)/pic4037705.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 287954,
    "name": "Azul: Summer Pavilion",
    "year_published": 2019,
    "description": "At the turn of the 16th Century, King Manuel I commissioned Portugal's greatest artisans to construct grandiose buildings. After completing the Palaces of Evora and Sintra, the king sought to build a summer pavilion to honor the most famous members of the royal family. This construction was intended for the most talented artisans — whose skills meet the splendor that the royal family deserves. Sadly, King Manuel I died before construction ever began.\n\nIn Azul: Summer Pavilion, players return to Portugal to accomplish the task that never began. As a master artisan, you must use the finest materials to create the summer pavilion while carefully avoiding wasting supplies. Only the best will rise to the challenge to honor the Portuguese royal family.\n\nAzul: Summer Pavilion lasts six rounds, and in each round players draft tiles, then place them on their individual player board to score points. Each of the six colors of tiles is wild during one of the rounds.\n\nAt the start of each round, draw tiles at random from the bag to refill each of the five, seven, or nine factories with four tiles each. Draw tiles as needed to refill the ten supply spaces on the central scoring board. Players then take turns drafting tiles. You can choose to take all of the tiles of a non-wild color on a factory and place them next to your board; if any wild tiles are on this factory, you must take one of them. Place all remaining tiles in the center of the table. Alternatively, you can take all tiles of a non-wild color from the center of play; you must also take one wild tile, if present.\n\nAfter all tiles have been claimed, players then take turns placing tiles on their individual boards. Each board depicts seven stars that would be composed of six tiles; each space on a star shows a number from 1-6, and six of the stars are for tiles of a single color while the seventh will be composed of one tile of each color. To place a tile on the blue 5, for example, you must discard five blue or wild tiles from next to your player board (with at least one blue being required), placing one blue tile in the blue 5 space and the rest in the discard tower. You score 1 point for this tile and 1 point for each tile within this star connected to the newly placed tile.\n\nIf you completely surround a pillar, statue, or window on your game board with tiles, you get an immediate bonus, taking 1-3 tiles from the central supply spaces and placing them next to your board. At the end of the round, you can carry over at most four tiles to the next round; discard any others, losing 1 point for each such tile.\n\nAfter six rounds, you score a bonus for each of the seven stars that you've filled completely. Additionally, you score a bonus for having covered all seven spaces of value 1, 2, 3 or 4. You lose 1 point for each remaining tile unused, then whoever has the most points wins.\n\n—description from the publisher",
    "min_players": 2,
    "max_players": 4,
    "min_play_time": 30,
    "max_play_time": 45,
    "play_time": 45,
    "min_age": 8,
    "categories": [
      "Abstract Strategy",
      "Puzzle"
    ],
    "mechanics": [
      "End Game Bonuses",
      "Open Drafting",
      "Pattern Building",
      "Set Collection",
      "Tile Placement",
      "Turn Order: Claim Action"
    ],
    "bgg_rating": 7.56,
    "weight": 2.08,
    "thumbnail_url": "https://cf.geekdo-images.com/843kZ6WR0HfyXWEybA6L7A__small/img/sOiQSPo_DM7G1Om0PF1T2Z8ACcA=/fit-in/200x150/filters:strip_icc()/pic4930887.jpg",
    "image_url": "https://cf.geekdo-images.com/843kZ6WR0HfyXWEybA6L7A__original/img/VtYGvhy_YCSw14FpV8FGzv0eMe4=/0x0/filters:format(jpeg)/pic4930887.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 282483,
    "name": "Escape from Iron Gate",
    "year_published": 2019,
    "description": "Welcome to Iron Gate prison.\n\nIt's not where anyone would choose to spend their time, but for now, it's home sweet cell.\n\nYou and your \"friends\" have been wrongfully accused of a crime and don’t belong behind bars. You’ve made your case first to the judge, then to the warden, but no one is buying it. Looks like there’s only one path to freedom: a good, old-fashioned prison break! Well, today is the day - you’re going to make a run for it. The good news? One of you is going to make it out. The bad news? Only one of you is going to make it out.\n\nYour objective is to escape Iron Gate Prison by moving through each of the four areas on the board – from the Cellblock to The Yard, The Cafeteria, The Warden’s Office, then finally to freedom! In order to progress to the next area, you’ll need to turn in the items on your Gate Card to the Commissary. Items are collected by completing puzzles, drawing, acting, and trading. The player that passes through the Final Gate first wins.\n\n—description from the publisher",
    "min_players": 3,
    "max_players": 8,
    "min_play_time": 45,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 13,
    "categories": [
      "Negotiation",
      "Party Game",
      "Puzzle"
    ],
    "mechanics": [
      "Acting",
      "Dice Rolling",
      "Hand Management",
      "Line Drawing",
      "Paper-and-Pencil",
      "Set Collection",
      "Trading"
    ],
    "bgg_rating": 5.92,
    "weight": 1.43,
    "thumbnail_url": "https://cf.geekdo-images.com/bRxwzLt1CL8pIoYgL5wQBQ__small/img/QW29K8y2RSfeLml2UkE3fuF1ne8=/fit-in/200x150/filters:strip_icc()/pic4800602.jpg",
    "image_url": "https://cf.geekdo-images.com/bRxwzLt1CL8pIoYgL5wQBQ__original/img/GKXX2TiYXT3lNdtDrYUrl0CWotk=/0x0/filters:format(jpeg)/pic4800602.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 266192,
    "name": "Wingspan",
    "year_published": 2019,
    "description": "Wingspan is a competitive, medium-weight, card-driven, engine-building board game from Stonemaier Games. It's designed by Elizabeth Hargrave and features 180 birds illustrated by Natalia Rojas and Ana Maria Martinez.\n\nYou are bird enthusiasts—researchers, bird watchers, ornithologists, and collectors—seeking to discover and attract the best birds to your network of wildlife preserves. Each bird extends a chain of powerful combinations in one of your habitats (actions). These habitats  focus on several key aspects of growth:\n\n\n     Gain food tokens via custom dice in a birdfeeder dice tower\n     Lay eggs using egg miniatures in a variety of colors\n     Draw from hundreds of unique bird cards and play them\n\n\nThe winner is the player with the most points after 4 rounds.\n\n—description from the publisher\n\nFrom the 7th printing on, the base game box includes Wingspan: Swift-Start Promo Pack.",
    "min_players": 1,
    "max_players": 5,
    "min_play_time": 40,
    "max_play_time": 70,
    "play_time": 70,
    "min_age": 10,
    "categories": [
      "Animals",
      "Card Game",
      "Educational"
    ],
    "mechanics": [
      "Action Queue",
      "Dice Rolling",
      "End Game Bonuses",
      "Hand Management",
      "Once-Per-Game Abilities",
      "Open Drafting",
      "Set Collection",
      "Solo / Solitaire Game",
      "Turn Order: Progressive"
    ],
    "bgg_rating": 8.0,
    "weight": 2.48,
    "thumbnail_url": "https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__small/img/VNToqgS2-pOGU6MuvIkMPKn_y-s=/fit-in/200x150/filters:strip_icc()/pic4458123.jpg",
    "image_url": "https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__original/img/cI782Zis9cT66j2MjSHKJGnFPNw=/0x0/filters:format(jpeg)/pic4458123.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 214396,
    "name": "Campy Creatures",
    "year_published": 2017,
    "description": "Players are mad scientists in need of precious mortals for future experiments. Rather than getting your hands dirty, your army of campy creatures awaits to do your bidding. Capture the most valuable mortals over the course of three nights to win. But be warned — the mortals won't go down without a fight.\n\nCampy Creatures is a ghoulish game of bluffing, deduction, and set collection for 2-5 players. Players begin each round with the same hand of creatures. Their goal is to capture valuable mortals by outguessing their opponents with the creatures they play. Each player has perfect information at the start, so knowing what a person might do in a particular situation is key.",
    "min_players": 2,
    "max_players": 5,
    "min_play_time": 20,
    "max_play_time": 30,
    "play_time": 30,
    "min_age": 10,
    "categories": [
      "Bluffing",
      "Card Game",
      "Deduction",
      "Horror"
    ],
    "mechanics": [
      "Auction / Bidding",
      "Hand Management",
      "Set Collection",
      "Simultaneous Action Selection"
    ],
    "bgg_rating": 7.0,
    "weight": 1.57,
    "thumbnail_url": "https://cf.geekdo-images.com/MV4Mym_m1P-YDvSXN3HbTw__small/img/tSbDggMHFyWvnZjf__VpvI6bxA4=/fit-in/200x150/filters:strip_icc()/pic4350783.jpg",
    "image_url": "https://cf.geekdo-images.com/MV4Mym_m1P-YDvSXN3HbTw__original/img/uWioWIQIzr-bWVnJVHGKCt2A-vw=/0x0/filters:format(jpeg)/pic4350783.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 178900,
    "name": "Codenames",
    "year_published": 2015,
    "description": "Two rival spymasters know the secret identities of 25 agents. Their teammates know the agents only by their codenames — single-word labels like \"disease\", \"Germany\", and \"carrot\". Yes, carrot. It's a legitimate codename. Each spymaster wants their team to identify their agents first...without uncovering the assassin by mistake.\n\nIn Codenames, two teams compete to see who can make contact with all of their agents first. Lay out 25 cards, each bearing a single word. The spymasters look at a card showing the identity of each card, then take turns clueing their teammates. A clue consists of a single word and a number, with the number suggesting how many cards in play have some association to the given clue word. The teammates then identify one agent they think is on their team; if they're correct, they can keep guessing up to one more than the stated number of times; if the agent belongs to the opposing team or is an innocent bystander, the team's turn ends; and if they fingered the assassin, they lose the game.\n\nSpymasters continue giving clues until one team has identified all of their agents or the assassin has removed one team from play.",
    "min_players": 2,
    "max_players": 8,
    "min_play_time": 15,
    "max_play_time": 15,
    "play_time": 15,
    "min_age": 10,
    "categories": [
      "Card Game",
      "Deduction",
      "Party Game",
      "Spies / Secret Agents",
      "Word Game"
    ],
    "mechanics": [
      "Communication Limits",
      "Deduction",
      "Memory",
      "Race",
      "Team-Based Game"
    ],
    "bgg_rating": 7.52,
    "weight": 1.25,
    "thumbnail_url": "https://cf.geekdo-images.com/nC6ifPCDnAItwoKSKXVrnw__small/img/1iZav_8ZqurrDbvkZA9GcFhB5x0=/fit-in/200x150/filters:strip_icc()/pic8907965.jpg",
    "image_url": "https://cf.geekdo-images.com/nC6ifPCDnAItwoKSKXVrnw__original/img/Id-jjIer_61ZbvI2_RVRCeBZFY4=/0x0/filters:format(jpeg)/pic8907965.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 172225,
    "name": "Exploding Kittens",
    "year_published": 2015,
    "description": "Exploding Kittens is a kitty-powered version of Russian Roulette. Players take turns drawing cards until someone draws an exploding kitten and loses the game. The deck is made up of cards that let you avoid exploding by peeking at cards before you draw, forcing your opponent to draw multiple cards, or shuffling the deck.\n\nThe game gets more and more intense with each card you draw because fewer cards left in the deck means a greater chance of drawing the kitten and exploding in a fiery ball of feline hyperbole.",
    "min_players": 2,
    "max_players": 5,
    "min_play_time": 15,
    "max_play_time": 15,
    "play_time": 15,
    "min_age": 7,
    "categories": [
      "Animals",
      "Card Game",
      "Comic Book / Strip",
      "Humor"
    ],
    "mechanics": [
      "Hand Management",
      "Hot Potato",
      "Player Elimination",
      "Push Your Luck",
      "Set Collection",
      "Take That"
    ],
    "bgg_rating": 6.07,
    "weight": 1.08,
    "thumbnail_url": "https://cf.geekdo-images.com/N8bL53-pRU7zaXDTrEaYrw__small/img/3tH4pIc1Udzkd0tXc6MgVQ59BC0=/fit-in/200x150/filters:strip_icc()/pic2691976.png",
    "image_url": "https://cf.geekdo-images.com/N8bL53-pRU7zaXDTrEaYrw__original/img/0ciN1VZYifUd0qIDO0e8cGXmiss=/0x0/filters:format(png)/pic2691976.png",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 140934,
    "name": "Arboretum",
    "year_published": 2015,
    "description": "Arboretum is a strategy card game for 2-4 players, aged 10 and up, that combines set collection, tile-laying and hand management while playing in about 25 minutes. Players try to have the most points at the end of the game by creating beautiful garden paths for their visitors.\n\nThe deck has 80 cards in ten different colors, with each color featuring a different species of tree; each color has cards numbered 1 through 8, and the number of colors used depends on the number of players. Players start with a hand of seven cards. On each turn, a player draws two cards (from the deck or one or more of the discard piles), lays a card on the table as part of her arboretum, then discards a card to her personal discard pile.\n\nWhen the deck is exhausted, players compare the cards that remain in their hands to determine who can score each color. For each color, the player(s) with the highest value of cards in hand of that color scores for a path of trees in her arboretum that begins and ends with that color; a path is a orthogonally adjacent chain of cards with increasing values. For each card in a path that scores, the player earns one point; if the path consists solely of trees of the color being scored, the player scores two points per card. If a player doesn't have the most value for a color, she scores zero points for a path that begins and ends with that color. Whoever has the most points wins.",
    "min_players": 2,
    "max_players": 4,
    "min_play_time": 30,
    "max_play_time": 30,
    "play_time": 30,
    "min_age": 8,
    "categories": [
      "Card Game",
      "Number"
    ],
    "mechanics": [
      "Connections",
      "Hand Management",
      "Move Through Deck",
      "Open Drafting",
      "Ordering",
      "Pattern Building",
      "Set Collection",
      "Square Grid"
    ],
    "bgg_rating": 7.24,
    "weight": 2.11,
    "thumbnail_url": "https://cf.geekdo-images.com/XYOn10oXBrDqHySf0jvnyQ__small/img/X6V1M2nZOinTgwE0KIBfup_QrCw=/fit-in/200x150/filters:strip_icc()/pic4172124.png",
    "image_url": "https://cf.geekdo-images.com/XYOn10oXBrDqHySf0jvnyQ__original/img/RMi0pEsP8agfH-tgYkeRGilD3oo=/0x0/filters:format(png)/pic4172124.png",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 234190,
    "name": "Unstable Unicorns",
    "year_published": 2017,
    "description": "Build a Unicorn Army. Betray your friends. Unicorns are your friends now.\n\nUnstable Unicorns is a strategic card game about everyone’s two favorite things: Destruction and Unicorns!\n\nPlayers draw and discard cards in a race to build an army of 7 unicorns. Sound easy? Not so fast. Someone could have a Neigh Card (Get it? Neigh?) or Downgrade cards to stop you in your tracks. But you can do the same to them.\n\nThe first person to complete their Unicorn Army shall hereafter be known as The Righteous Ruler of All Things Magical.\n\n—description from the publisher",
    "min_players": 2,
    "max_players": 8,
    "min_play_time": 30,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 8,
    "categories": [
      "Card Game",
      "Humor",
      "Party Game"
    ],
    "mechanics": [
      "Hand Management",
      "Set Collection",
      "Take That"
    ],
    "bgg_rating": 6.22,
    "weight": 1.47,
    "thumbnail_url": "https://cf.geekdo-images.com/8_5xvpsrrX5JVzO7eBLSgw__small/img/fV4UWCHC1ImGFUN7lcJju9K8_zo=/fit-in/200x150/filters:strip_icc()/pic3912914.jpg",
    "image_url": "https://cf.geekdo-images.com/8_5xvpsrrX5JVzO7eBLSgw__original/img/XkKaT-quh8xGl2uHD5zULSWTpuM=/0x0/filters:format(jpeg)/pic3912914.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 395623,
    "name": "Harvest",
    "year_published": 2024,
    "description": "Salutations, neighbor, and welcome to Furroughfield, the Commonwealth of Free Beasts! Ours is a budding farm town with soil ripe for planting.\n\nIn Harvest, you take on the role of a farmer, each with their own unique penchant for working the land, and choose a farmhouse with its own special round-to-round benefit. Each round, you draft sunrise cards that give you a one-time income and determine turn order for the round. Following that turn order, move your wheelbarrows around town to gather resources that you'll use to manage your fields. Plant seeds, tend the land, and harvest crops to make money and score points. Clear land to expand your farm, and construct buildings that make your land more efficient and give you endgame bonuses. By the end of harvest season, the farmer with the most points wins!\n\n—description from the publisher",
    "min_players": 1,
    "max_players": 4,
    "min_play_time": 30,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 10,
    "categories": [
      "Animals",
      "Farming"
    ],
    "mechanics": [
      "Open Drafting",
      "Variable Player Powers",
      "Worker Placement"
    ],
    "bgg_rating": 7.4,
    "weight": 2.58,
    "thumbnail_url": "https://cf.geekdo-images.com/GY6u68JwrMHKNDxRkyaZAg__small/img/bcgNy8nfsP8F7ZGpaL9wJiaSE2w=/fit-in/200x150/filters:strip_icc()/pic7696599.jpg",
    "image_url": "https://cf.geekdo-images.com/GY6u68JwrMHKNDxRkyaZAg__original/img/WORSJBgHkxOyc67_NaY4S9WpOtQ=/0x0/filters:format(jpeg)/pic7696599.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 229218,
    "name": "A Game of Thrones: Catan – Brotherhood of the Watch",
    "year_published": 2017,
    "description": "The Brothers of the Night's Watch seek a new leader from among their ranks. Jeor Mormont wishes to promote one who can improve the infrastructure of the Gift, the bountiful and undeveloped area south of the Wall bestowed to the Watch by the Starks thousands of years ago. Drawing sustenance from the unforgiving landscape of the north offers enough challenges, but whomever takes up this task must also man and defend the Wall against the onslaught of Wildlings fighting their way into Westeros. Many brothers now compete to build, defend, and do what they can to protect Westeros, but only one shall rise above their brothers to become the new Lord Commander. But be wary — the north holds many dangers, and winter is coming.\n\nA Game of Thrones Catan: Brotherhood of the Watch is based on the classic Settlers of Catan base game. In this game, each area in the Gift supplies one of five resources: lumber, brick, wool, grain, and ore. The barren Ice Fields, however, produce nothing. Players take on the role of Brothers of the Night's Watch and use these resources to strengthen their hold on the north by building roads, settlements, and keeps; recruiting guards for their patrol; or buying development cards. Each of these acts bring players increased power and recognition through the awarding of victory points. The objective will be familiar to players of the original Catan; the first player to achieve ten victory points wins the game and becomes the new Lord Commander of the Night's Watch.\n\nBut this is not as easy as it sounds as the area surrounding the Gift can be treacherous. Wildings from north of the Wall have crossed over and follow their own rules of honor, which often conflict with the laws of Westeros. One of their ranks, Tormund Giantsbane, does not respect the Watch's claim to the land as he moves throughout the Gift, robbing resources from the Brothers sent to provide for their Order. While Tormund runs amok south of the Wall, Wildling forces gather in the Frostfangs, awaiting an opportune moment of weakness to breach the Watch's defenses and spread throughout the fruitful lands of Westeros. In addition to building within the Gift, players must strategically balance their resources to defend the Realm from Wildling raiders.\n\nEach player may recruit up to seven brothers from the prisons of Westeros to don their specific color and man their section of the Wall. When the Wildings attack, each player must use their guards to fend off the onslaught. If there are more guards than Wildings, the Wall stands. If there are not, the Wildings invade the Gift and pillage the settlements and keeps therein. Yet loyalty only goes so far — guards are useless defending the Wall from Climbers who slip past them, and if they encounter a Giant, at least one guard is bound to desert his post.\n\nEach player also has a hero to aide in their toil, based on the order of play. The first player will utilize the talents of the Lord Commander himself, Jeor Mormont, while the second player will enjoy the company of Samwell Tarly, the third will work with Bowen Marsh, and the fourth will employ the services of Master Builder Othell Yarwyck. Each hero offers a unique ability to each player which they can use up to twice during the game. Once a hero's ability has been used, players have a choice to keep that hero or choose another of the eleven heroes to aide them. Players should factor the heroes' abilities into their strategy to quickly earn victory points and gain renown within the Watch.\n\nThe Wildling invasion marks the truest test of the Brothers of the Watch and your own competency as a commander. A failure at the Wall has a devastating impact on the Gift, even if it does not destroy the players. A Game of Throne Catan: Brotherhood of the Watch has two forms of victory, though one may feel hollower than the other. Victory occurs when a player has both improved the infrastructure of the Gift and successfully kept it safe from invaders. This is shown when a player has achieved ten victory points by any combination of building keeps, roads, and settlements; hiring three or more guards to keep the Wall safe; and buying development cards to increase their prestige, all while safeguarding the Gift.\n\nHowever, if the Wildlings breach the wall three times throughout the game, an alternate victory takes place. If this occurs, the game ends immediately as the Brotherhood of the Night's Watch can no longer delay their decision. The player commanding the most guards holding their posts on the Wall gains the title of Lord Commander and wins the game.\n\n—description from the publisher",
    "min_players": 3,
    "max_players": 4,
    "min_play_time": 60,
    "max_play_time": 75,
    "play_time": 75,
    "min_age": 14,
    "categories": [
      "Civilization",
      "Negotiation",
      "Novel-based"
    ],
    "mechanics": [
      "Dice Rolling",
      "Hand Management",
      "Modular Board",
      "Network and Route Building",
      "Trading"
    ],
    "bgg_rating": 7.15,
    "weight": 2.57,
    "thumbnail_url": "https://cf.geekdo-images.com/6cT3pVSblsXXbh4u49h77A__small/img/PB2PU7tdRh7KLJMmg3GMFIIbHMI=/fit-in/200x150/filters:strip_icc()/pic3764169.jpg",
    "image_url": "https://cf.geekdo-images.com/6cT3pVSblsXXbh4u49h77A__original/img/mvDtQpHX7xbcq7Ck_u78jWEB6l8=/0x0/filters:format(jpeg)/pic3764169.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 201808,
    "name": "Clank!: A Deck-Building Adventure",
    "year_published": 2016,
    "description": "Burgle your way to adventure in the deck-building board game Clank! Sneak into an angry dragon's mountain lair to steal precious artifacts. Delve deeper to find more valuable loot. Acquire cards for your deck and watch your thievish abilities grow. Be quick and be quiet. One false step and CLANK! Each careless sound draws the attention of the dragon, and each artifact stolen increases its rage. You can enjoy your plunder only if you make it out of the depths alive!\n\nClank! is a deck-building game. Each player has their own deck, and building yours up is part of playing the game. You start each of your turns with five cards in your hand, and you'll play them all in any order you choose. Most cards will generate resources, of which there are three different kinds:\n\n\n    Skill, which is used to acquire new cards for your deck.\n    Swords, which are used to fight the monsters that infest the dungeon.\n    Boots, which are used to move around the board.\n\n\nEvery time you acquire a new card, you put it face up in your discard pile. Whenever you need to draw a card and find your deck empty, you shuffle your discard pile and turn it face down to form a new deck. With each shuffle, your newest cards become part of a bigger and better deck! Each player starts with the same cards in their deck, but they’ll acquire different cards during their turns. Because cards can do many different things, each player’s deck (and strategy) will become more and more different as the game unfolds.\n\nDuring the game, you have two goals:\n\n    Retrieve an Artifact token and escape the dragon by returning to the place you started, outside of the dungeon.\n    Accumulate enough points with your Artifact and other loot to beat out your opponents and earn the title of Greatest Thief in the Realm!",
    "min_players": 2,
    "max_players": 4,
    "min_play_time": 30,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 12,
    "categories": [
      "Adventure",
      "Fantasy"
    ],
    "mechanics": [
      "Action Points",
      "Deck, Bag, and Pool Building",
      "Delayed Purchase",
      "End Game Bonuses",
      "Movement Points",
      "Open Drafting",
      "Player Elimination",
      "Point to Point Movement",
      "Push Your Luck",
      "Variable Set-up"
    ],
    "bgg_rating": 7.76,
    "weight": 2.23,
    "thumbnail_url": "https://cf.geekdo-images.com/DPjV1iI0ygo5Bl3XLNRiIg__small/img/O2WnqJew5gNjQqPUH3gqmTBc1pQ=/fit-in/200x150/filters:strip_icc()/pic4449526.jpg",
    "image_url": "https://cf.geekdo-images.com/DPjV1iI0ygo5Bl3XLNRiIg__original/img/cXqOdM3BLyIeRt0GP3M3V--gF1M=/0x0/filters:format(jpeg)/pic4449526.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 350184,
    "name": "Earth",
    "year_published": 2023,
    "description": "Earth is a tableau builder with simple rules and countless strategic possibilities. With its encyclopedic nature and a near-infinite number of tableau combinations, every single game will allow you to discover new synergies and connections, just as our vast and fascinating world allows us to do!\n\nIt’s time to jump into these rich environments and create some amazing natural synergies that replicate and extrapolate on Earth’s amazing versatility and plethora of natural resources.  Over thousands of years of evolution and adaptation the flora and fauna of this unique planet have grown and developed into amazing life forms, creating symbiotic ecosystems and habitats.\n\nPlayers create a self-supporting engine of growth, expansion and supply where even your unused plants become compost for future growth. They use their cards to choose actions (which affect all players) and gain resources. The first player to complete their Tableau triggers the end of the game. The player with the most points wins.\n\n—description from the publisher",
    "min_players": 1,
    "max_players": 5,
    "min_play_time": 45,
    "max_play_time": 90,
    "play_time": 90,
    "min_age": 13,
    "categories": [
      "Animals",
      "Card Game",
      "Environmental"
    ],
    "mechanics": [
      "Contracts",
      "End Game Bonuses",
      "Follow",
      "Hand Management",
      "Pattern Building",
      "Solo / Solitaire Game",
      "Tags",
      "Team-Based Game",
      "Tile Placement",
      "Variable Set-up",
      "Victory Points as a Resource"
    ],
    "bgg_rating": 7.61,
    "weight": 2.91,
    "thumbnail_url": "https://cf.geekdo-images.com/0xqF_KyOb7V26Lu5YT3fxw__small/img/ABTwzzMGekkz2jVl01LC4789TcQ=/fit-in/200x150/filters:strip_icc()/pic6699821.jpg",
    "image_url": "https://cf.geekdo-images.com/0xqF_KyOb7V26Lu5YT3fxw__original/img/uqxMcj1QPt-U34drYdL6mmv2eos=/0x0/filters:format(jpeg)/pic6699821.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 202426,
    "name": "Sidereal Confluence",
    "year_published": 2017,
    "description": "Sidereal Confluence: Trading and Negotiation in the Elysian Quadrant is a singularly unique trading and negotiation game for 4-9 players. Over the course of the game, each race must trade and negotiate with the rest to acquire the resource cubes necessary to fund their economy and allow it to produce goods for the next turn. Scheming, dealing, and mutually beneficial agreements are key to success. While technically a competitive game, Sidereal Confluence has a cooperative feel during the trading phase as no race has the ability to thrive on its own. Trade well, and you'll develop technologies and colonize planets to form a civilization that is the envy of the galaxy.\n\nEach player chooses one of the nine unique and asymmetrical alien races that have come together to form a trade federation in their quadrant. Each race has its own deck of cards representing all the existing and future technologies it might research. Some races also have other cards related to unique features of their culture. These cards represent portions of the culture's economy and require spending some number of cubes to use, resulting in an output of more cubes, ships, and possibly victory points. Since each culture's outputs rarely match their inputs, players need to trade goods with one another to run their converters to create the resources they truly need to run their society most efficiently and have an effective economy. Almost everything is negotiable, including colonies, ships, and all kinds of resources.\n\nEach game round contains an open trading phase in which all players can negotiate and execute deals for cubes, ships, colonies, even the temporary use of technologies! Players with enough resources can also research technologies, upgrade colonies, and spend resources on their race's special cards during this phase. Once complete, all players simultaneously run their economies, spending resources to gain more resources. The Confluence follows, starting with players sharing newly researched technologies with all other races and following with bidding to acquire new colonies and research teams. Researching a new technology grants many victory points for the prestige of helping galactic society advance. When one race builds a new technology, it is shared with everyone else. Technologies can be upgraded when combined with other technologies.\n\nThe ultimate goal is victory points, which are acquired by researching technologies, using your economy to convert resources to goods, and converting your leftover goods into points at the end of the game.\n\nThe game is almost all simultaneous play.\n\nSidereal Confluence: Remastered Edition features the same gameplay as the first edition of the game from 2017, but features an updated card layout, a teaching guide, and an improved rulebook for easy set-up and learning with more visual examples and clear key terms.",
    "min_players": 4,
    "max_players": 9,
    "min_play_time": 120,
    "max_play_time": 180,
    "play_time": 180,
    "min_age": 14,
    "categories": [
      "Economic",
      "Negotiation",
      "Real-time",
      "Science Fiction",
      "Space Exploration"
    ],
    "mechanics": [
      "Auction: Sealed Bid",
      "Hidden Victory Points",
      "Income",
      "Negotiation",
      "Real-Time",
      "Simultaneous Action Selection",
      "Tech Trees / Tech Tracks",
      "Trading",
      "Variable Player Powers"
    ],
    "bgg_rating": 7.76,
    "weight": 3.57,
    "thumbnail_url": "https://cf.geekdo-images.com/3V1Nmee3P4qSpVmWO9uGgw__small/img/ptUAPVk_LoqX7qDUt7ngtDXe-Qw=/fit-in/200x150/filters:strip_icc()/pic4981297.jpg",
    "image_url": "https://cf.geekdo-images.com/3V1Nmee3P4qSpVmWO9uGgw__original/img/1D98HsjtX5IzcwUMvd-67z1xzKo=/0x0/filters:format(jpeg)/pic4981297.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 295947,
    "name": "Cascadia",
    "year_published": 2021,
    "description": "Cascadia is a puzzly tile-laying and token-drafting game featuring the habitats and wildlife of the Pacific Northwest.\n\nIn the game, you take turns building out your own terrain area and populating it with wildlife. You start with three hexagonal habitat tiles (with the five types of habitat in the game), and on a turn you choose a new habitat tile that's paired with a wildlife token, then place that tile next to your other ones and place the wildlife token on an appropriate habitat. (Each tile depicts 1-3 types of wildlife from the five types in the game, and you can place at most one token on a habitat.) Four tiles are on display, with each tile being paired at random with a wildlife token, so you must make the best of what's available — unless you have a nature token to spend so that you can pick your choice of each item.\n\nIdeally you can place habitat tiles to create matching terrain that reduces fragmentation and creates wildlife corridors, mostly because you score for the largest area of each type of habitat at game's end, with a bonus if your group is larger than each other player's. At the same time, you want to place wildlife tokens so that you can maximize the number of points scored by them, with the wildlife goals being determined at random by one of the four scoring cards for each type of wildlife. Maybe hawks want to be separate from other hawks, while foxes want lots of different animals surrounding them and bears want to be in pairs. Can you make it happen?",
    "min_players": 1,
    "max_players": 4,
    "min_play_time": 30,
    "max_play_time": 45,
    "play_time": 45,
    "min_age": 10,
    "categories": [
      "Animals",
      "Environmental"
    ],
    "mechanics": [
      "Chaining",
      "End Game Bonuses",
      "Hexagon Grid",
      "Line of Sight",
      "Open Drafting",
      "Pattern Building",
      "Solo / Solitaire Game",
      "Tile Placement",
      "Variable Set-up"
    ],
    "bgg_rating": 7.88,
    "weight": 1.84,
    "thumbnail_url": "https://cf.geekdo-images.com/MjeJZfulbsM1DSV3DrGJYA__small/img/tVSFjSxYEcw7sKj3unIIQV8kxoc=/fit-in/200x150/filters:strip_icc()/pic5100691.jpg",
    "image_url": "https://cf.geekdo-images.com/MjeJZfulbsM1DSV3DrGJYA__original/img/B374C04Eip7fmQBGJzgiOTp-jyQ=/0x0/filters:format(jpeg)/pic5100691.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 9209,
    "name": "Ticket to Ride",
    "year_published": 2004,
    "description": "With elegantly simple gameplay, Ticket to Ride can be learned in under 15 minutes. Players collect cards of various types of train cars they then use to claim railway routes in North America. The longer the routes, the more points they earn. Additional points come to those who fulfill Destination Tickets – goal cards that connect distant cities; and to the player who builds the longest continuous route.\n\n\"The rules are simple enough to write on a train ticket – each turn you either draw more cards, claim a route, or get additional Destination Tickets,\" says Ticket to Ride author, Alan R. Moon. \"The tension comes from being forced to balance greed – adding more cards to your hand, and fear – losing a critical route to a competitor.\"\n\nTicket to Ride continues in the tradition of Days of Wonder's big format board games featuring high-quality illustrations and components including: an oversize board map of North America, 225 custom-molded train cars, 144 illustrated cards, and wooden scoring markers.\n\nSince its introduction and numerous subsequent awards, Ticket to Ride has become the BoardGameGeek epitome of a \"gateway game\" -- simple enough to be taught in a few minutes, and with enough action and tension to keep new players involved and in the game for the duration.\n\nPart of the Ticket to Ride series.",
    "min_players": 2,
    "max_players": 5,
    "min_play_time": 30,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 8,
    "categories": [
      "Trains"
    ],
    "mechanics": [
      "Connections",
      "Contracts",
      "End Game Bonuses",
      "Hand Management",
      "Network and Route Building",
      "Open Drafting",
      "Push Your Luck",
      "Set Collection"
    ],
    "bgg_rating": 7.38,
    "weight": 1.82,
    "thumbnail_url": "https://cf.geekdo-images.com/kdWYkW-7AqG63HhqPL6ekA__small/img/5G46jv8MFh_BfX67iMSouTMhKxc=/fit-in/200x150/filters:strip_icc()/pic8937637.jpg",
    "image_url": "https://cf.geekdo-images.com/kdWYkW-7AqG63HhqPL6ekA__original/img/rWF8r4JXXCQQ7QhiWHhmT-rQ3Pc=/0x0/filters:format(jpeg)/pic8937637.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 179719,
    "name": "Risk: Game of Thrones",
    "year_published": 2015,
    "description": "Description from the publisher:\n\nRisk: Game of Thrones, based on the epic HBO series, features two ways to play, including factions of noble Houses vying for control of Westeros during the time of The War of the Five Kings, as well as Daenerys Targaryen's rise to power in Essos.\n\nWar and chaos have descended upon the realms of Men. In Westeros, the death of Robert Baratheon has created a power vacuum with rival Houses competing for control of The Iron Throne. Meanwhile, in Essos, Daenerys Targaryen is building an army to contest the rule of the Ghiscari slavers, before returning to reclaim The Iron Throne. There are 3 different ways to play RISK Game of Thrones:\n\n1. SKIRMISH\nBasic version designed as an introduction to RISK Game of Thrones game play. Once you are comfortable, move on to Dominion.\n\n2. DOMINION\nAdvanced version of RISK Game of Thrones including Objectives, Characters, and Maester cards, offering more in-depth strategic action.\n\n3. WORLD AT WAR\nPlay with both maps and up to seven players using either the Skirmish or Dominion rules.\n\nRISK Game of Thrones includes two game board maps and seven House armies. Westeros map is for 3-5 player game and Essos map is for 2 player game. There is a deck of territory cards for each map, and these function in a similar way to the original RISK gameplay. When playing Dominion rules, the character cards can grant special abilities to your House, the maester cards can grant tactical advantages during deployment and battles, and objective cards create goals and strategies for earning Victory Points.\n\nSkirmish rules are most similar to the original RISK rules. There are minor thematic variations to suit the new map. The winner is determined by which player controls the most territories, castles and ports when the end game card is revealed.\n\nDominion rules add the additional mechanics and cards described above. Instead of simply trying to control the most territories, castles, and ports you are now trying to achieve specific Objectives to earn Victory Points, furthering your efforts to consolidate power and establish dominion over the rival Houses. Objectives are worth from 1 to 4 Victory Points, based on the difficulty to achieve them. The first player to earn 10 Victory Points while also controlling their Seat of Power wins the game.",
    "min_players": 2,
    "max_players": 7,
    "min_play_time": 120,
    "max_play_time": 240,
    "play_time": 240,
    "min_age": 18,
    "categories": [
      "Movies / TV / Radio theme",
      "Territory Building",
      "Wargame"
    ],
    "mechanics": [
      "Area Majority / Influence",
      "Area Movement",
      "Dice Rolling",
      "Player Elimination"
    ],
    "bgg_rating": 6.63,
    "weight": 2.71,
    "thumbnail_url": "https://cf.geekdo-images.com/UNici3J_3qZIYeEapfaLpg__small/img/omzrXKLCEvYqZR8Kf0zeSZbRw3g=/fit-in/200x150/filters:strip_icc()/pic2568573.jpg",
    "image_url": "https://cf.geekdo-images.com/UNici3J_3qZIYeEapfaLpg__original/img/-tLVMbJGo46jhRpmxVX1bmWoDCA=/0x0/filters:format(jpeg)/pic2568573.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 1111,
    "name": "Taboo",
    "year_published": 1989,
    "description": "In the party game Taboo, you're trying to give clues to your teammates so that they'll guess a particular word, but you can't say just anything you like. Some clues are off limits!\n\nWhen you're the active player, hold the deck of cards so that you and the opposing team can see the top card. At the top of the card is the word your teammate must say to score the card, and you can anything you want to help them figure out what to guess other than the word itself (duh!) or the five words/phrases listed on the bottom of the card.\n\nFor example, can you get your teammates to say \"bacon\" without saying \"pig\", \"eggs\", \"breakfast\", \"sausage\", or \"eat\"? If you do, you score the card, then move on to the next card, trying to guess as many cards as possible before time runs out. However, if you say a taboo word (or make gestures), the opposing team will buzz a buzzer and score the card themselves.\n\nHow well can you describe things without breaking the taboo?",
    "min_players": 4,
    "max_players": 10,
    "min_play_time": 20,
    "max_play_time": 20,
    "play_time": 20,
    "min_age": 12,
    "categories": [
      "Party Game",
      "Real-time",
      "Word Game"
    ],
    "mechanics": [
      "Communication Limits",
      "Team-Based Game"
    ],
    "bgg_rating": 6.32,
    "weight": 1.2,
    "thumbnail_url": "https://cf.geekdo-images.com/TdOB9V-wTf0LenXk8QWo-A__small/img/FU6jPnm6yzKxH8au69ZAJwC2wpY=/fit-in/200x150/filters:strip_icc()/pic8377520.jpg",
    "image_url": "https://cf.geekdo-images.com/TdOB9V-wTf0LenXk8QWo-A__original/img/mhYaJYFxGrVZaP7ZL08ZuFJj5Ak=/0x0/filters:format(jpeg)/pic8377520.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 274533,
    "name": "Throw Throw Burrito",
    "year_published": 2019,
    "description": "The world's first dodgeball card game. Collect cards. Play your hand. Throw things at your friends.\n\nThrow Throw Burrito is what you get when you cross a card game with dodgeball. Try to collect matching sets of cards faster than your opponents while simultaneously ducking, dodging, and throwing squishy airborne burritos. The cards you collect earn points, but getting hit by flying burritos loses them. So clear some space and put away the antiques, because you’ve never played a card game quite like this before.\n\nHow it works: Place a pair of burritos on a table and draw cards. Keep your cards a secret. Rack up points by finding sets of three in the deck. Find matches before anyone else does. If someone plays Burrito Cards, a Battle ensues. Steal points from your opponents by hitting them with squishy toy burritos. Declare war on your friends. Some battles only involve a handful of players. Others force the entire table to engage in a Burrito War. Duel to determine the winner. During a Burrito Duel, two players must stand back to back, walk three paces, and FIRE.\n\n—description from the designer",
    "min_players": 2,
    "max_players": 6,
    "min_play_time": 15,
    "max_play_time": 15,
    "play_time": 15,
    "min_age": 7,
    "categories": [
      "Action / Dexterity",
      "Card Game",
      "Party Game"
    ],
    "mechanics": [
      "Real-Time",
      "Set Collection",
      "Take That"
    ],
    "bgg_rating": 6.21,
    "weight": 1.09,
    "thumbnail_url": "https://cf.geekdo-images.com/5ClVKrQcLkzRdBGiEfjevQ__small/img/FJa46kpICy-6AF4n7W-v9ICP_yo=/fit-in/200x150/filters:strip_icc()/pic7073068.jpg",
    "image_url": "https://cf.geekdo-images.com/5ClVKrQcLkzRdBGiEfjevQ__original/img/NDGN_eKZmO7uJD0l5JIKJkAX24o=/0x0/filters:format(jpeg)/pic7073068.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 336622,
    "name": "Wrong Party",
    "year_published": 2021,
    "description": "Consider this your invitation to Wrong Party! In this delightfully quirky draft-style card game, compete with your friends to create the GGLOAT—that is, the Greatest Guest List of All Time—by choosing from a variety of mismatched characters and party themes. Will you host the perfect party or kill the vibe?\n\n\n     2-5 player card game\n     30-60 minute playtime\n     Ages 12+\n     Box contains: 152 game cards, 1 Score Tracker, and 5 Party Hats\n\n\nWhat happens when you invite a Baby, your Dentist, a Drug-Sniffing Dog, and a Mall Santa to Slay a Dragon? And what Murder Mystery Party would be complete without a Proud Mom of an Honor Roll Student and a Cult Leader butting heads? If the front row of your Royal Wedding doesn’t feature a Killer Clown, are you really doing it right?\n\nIn Wrong Party, players earn points by matching a wide range of characters to different Party Themes while actively sabotaging their opponents. Send cards to your Party Area or Uninvited Guests pile, and then pass on the rest of your hand to the next player. Once your Party Area is full, it’s time to count up your points. The player with the most points after 3 rounds wins the game. Don’t let your party flop!",
    "min_players": 2,
    "max_players": 5,
    "min_play_time": 30,
    "max_play_time": 60,
    "play_time": 60,
    "min_age": 12,
    "categories": [
      "Card Game",
      "Fantasy",
      "Humor",
      "Party Game"
    ],
    "mechanics": [
      "Closed Drafting",
      "Hand Management",
      "Memory",
      "Set Collection",
      "Take That"
    ],
    "bgg_rating": 6.4,
    "weight": 1.18,
    "thumbnail_url": "https://cf.geekdo-images.com/_61XZmQmixaiDqWmgjqi1Q__small/img/kZzIHiLogWxzeBsacDtuywHoEqw=/fit-in/200x150/filters:strip_icc()/pic6149837.jpg",
    "image_url": "https://cf.geekdo-images.com/_61XZmQmixaiDqWmgjqi1Q__original/img/pTnMMHPF5zpqR2waGzxCHwn_YlM=/0x0/filters:format(jpeg)/pic6149837.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  },
  {
    "bgg_id": 2453,
    "name": "Blokus",
    "year_published": 2000,
    "description": "Blokus (officially pronounced \"Block us\") is an abstract strategy game with transparent, Tetris-shaped, colored pieces that players are trying to play onto the board.  The only caveat to placing a piece is that it may not lie adjacent to your other pieces, but instead must be placed touching at least one corner of your pieces already on the board.\n\nThere is a solitaire variation where one player tries to get rid of all the pieces in a single sitting.\n\nGoal of the Game:\n\nEach player has to fit as many of his/her 21 pieces on the board as possible.\n\nComponents:\nBlokus Game Board (400 squares)\n84 game pieces (four 21-piece sets of red, green, blue, and yellow)\nEach color inlcudes:\n\n     1 one-square piece\n     1 piece with 2 squares\n     2 pieces with 3 squares\n     5 pieces with 4 squares\n     12 pieces with 5 squares",
    "min_players": 2,
    "max_players": 4,
    "min_play_time": 30,
    "max_play_time": 30,
    "play_time": 30,
    "min_age": 7,
    "categories": [
      "Abstract Strategy",
      "Territory Building"
    ],
    "mechanics": [
      "Chaining",
      "Enclosure",
      "Grid Coverage",
      "Hand Management",
      "Player Elimination",
      "Square Grid",
      "Tile Placement"
    ],
    "bgg_rating": 6.86,
    "weight": 1.73,
    "thumbnail_url": "https://cf.geekdo-images.com/96YA5wUJDxtPkmPxemr5Qg__small/img/EBt2y7Awj5djyo185R7g6FV3P9g=/fit-in/200x150/filters:strip_icc()/pic2197702.jpg",
    "image_url": "https://cf.geekdo-images.com/96YA5wUJDxtPkmPxemr5Qg__original/img/sdX6o0TZpXjsDMw071k2P80wpYw=/0x0/filters:format(jpeg)/pic2197702.jpg",
    "last_played": null,
    "play_count": 0,
    "is_favorite": false,
    "notes": null
  }
]
$bggseed$::jsonb) as g
on conflict (bgg_id) do update set
  name = excluded.name,
  year_published = excluded.year_published,
  description = excluded.description,
  min_players = excluded.min_players,
  max_players = excluded.max_players,
  min_play_time = excluded.min_play_time,
  max_play_time = excluded.max_play_time,
  play_time = excluded.play_time,
  min_age = excluded.min_age,
  categories = excluded.categories,
  mechanics = excluded.mechanics,
  bgg_rating = excluded.bgg_rating,
  weight = excluded.weight,
  thumbnail_url = excluded.thumbnail_url,
  image_url = excluded.image_url;
