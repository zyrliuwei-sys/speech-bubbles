/**
 * Question-style searches per topic, answered in one or two sentences. Each
 * `q` mirrors how people phrase the search in Google, so keep it verbatim.
 * Answers must only restate facts already checked on the topic page.
 */
export const TOPIC_FAQ: Record<string, { q: string; a: string }[]> = {
  meowdoku: [
    {
      q: 'What are the rules of Meowdoku?',
      a: 'Place exactly one cat in every row, every column and every colored region. Cats cannot touch along an edge or at a corner.',
    },
    {
      q: 'Can you play Meowdoku online?',
      a: 'Yes. Meowdoku.gg has a free independent browser version with a daily puzzle and unlimited boards.',
    },
    {
      q: 'Is Meowdoku free to download?',
      a: 'Yes. Oakever’s app is free to download on Google Play and the App Store, with ads and in-app purchases.',
    },
    {
      q: 'Can you play Meowdoku offline?',
      a: 'Oakever’s Google Play listing says the Android app supports offline play.',
    },
  ],
  loftia: [
    {
      q: 'When did Loftia come out?',
      a: 'Loftia entered Early Access on November 3, 2026 at 1 p.m. EST on Windows and Mac.',
    },
    {
      q: 'Is Loftia free to play?',
      a: 'Loftia is a paid game. The US Early Access base price is $29.99, with an introductory price of $24.89.',
    },
    {
      q: 'Is Loftia on Nintendo Switch?',
      a: 'Qloud Games plans a Nintendo Switch release in 2027. Early Access is available on Windows and Mac.',
    },
    {
      q: 'Can you play Loftia offline?',
      a: 'Loftia requires an internet connection. You can still play solo and progress through most of the game on your own.',
    },
  ],
  'fortnite-shop-token': [
    {
      q: 'Are Fortnite shop tokens and Item Shop tokens the same thing?',
      a: 'Yes. Both search terms refer to Pirate Shop Access, a rare Treasure Hunters chest reward.',
    },
    {
      q: 'How do you get a Fortnite Item Shop token?',
      a: 'Open Battle Royale chests during Treasure Hunters. The reward is random, and GamesRadar reports that ordinary chests can drop it.',
    },
    {
      q: 'How long does the Fortnite shop token last?',
      a: 'Each activation gives 14 days of access. The 2026 token must be activated by December 15, 2026; Destructoid lists the second token’s activation window as January 1–December 15, 2027.',
    },
    {
      q: 'Does the Fortnite shop token make everything free?',
      a: 'It covers eligible V-Bucks Item Shop offers. GamesRadar excludes gifting, pass levels and real-money bundles, and limits the reward to one free Sidekick you do not already own.',
    },
  ],
  'pokemon-30th-upc': [
    {
      q: 'What does Pokemon 30th UPC stand for?',
      a: 'UPC means Ultra-Premium Collection here. The 30th Celebration product comes in Day and Night versions.',
    },
    {
      q: 'When does the Pokemon 30th UPC come out?',
      a: 'Pokémon’s official product gallery lists November 6, 2026 for both Day and Night versions.',
    },
    {
      q: 'What is the difference between the Day and Night 30th UPC?',
      a: 'Day features Espeon ex and a day-themed Pikachu ex; Night features Umbreon ex and a night-themed Pikachu ex. Pack counts and accessory quantities match.',
    },
    {
      q: 'How many packs are in the Pokemon 30th UPC?',
      a: 'Each box has 30 packs: 29 regular 30th Celebration packs and one three-card Classic Collection pack.',
    },
  ],
  'ragdoll-robot-boxing': [
    {
      q: 'Is Ragdoll Robot Boxing free?',
      a: 'Yes. Ragdoll Robot Boxing is free to play on Roblox on PC, phone and controller.',
    },
    {
      q: 'How do you get new robots in Ragdoll Robot Boxing?',
      a: 'By spinning — each robot has its own special move, and some are very rare.',
    },
  ],
  'lumber-tycoon-2-secret-badge': [
    {
      q: 'Can you still get the Lumber Tycoon 2 secret badge?',
      a: 'No. The quest stopped working for new runs when The Hunt: Roblox 20 ended on September 28, 2026. Players who already own the Glorbaxe keep it.',
    },
  ],
  'clover-legends-codes': [
    {
      q: 'How do you redeem codes in Clover Legends?',
      a: 'Click the menu button (three lines) in the top-right corner of the game, enter the code in the codes box and redeem it.',
    },
  ],
  'jjs-codes': [
    {
      q: 'How do you redeem codes in Jujutsu Shenanigans?',
      a: 'Click the Shop icon near the top-left, open the Codes tab, paste the code and press Redeem.',
    },
  ],
  'lagos-life-game': [
    {
      q: 'Is Lagos Life free?',
      a: 'Yes. Lagos Life is free to play in your browser with no download.',
    },
  ],
  'steal-an-egg-wisp': [
    {
      q: 'How do you get the Enchanted Mutation in Steal An Egg?',
      a: 'Catch butterflies during Butterfly Bloom, craft Enchanted Essence at the Enchanted Mutation Shrine inside the Enchanted Tree, and use it on an egg — it guarantees the mutation.',
    },
    {
      q: 'How do you get Wisp in Steal An Egg?',
      a: 'Reach at least 50 billion Speed, then go to the Enchanted Forest — Wisp spawns at the yellow circle. Talk to it to start its quests.',
    },
  ],
  'illegal-soccer': [
    {
      q: 'Are there codes for Illegal Soccer?',
      a: 'No. Illegal Soccer has no code redemption menu as of October 2026.',
    },
  ],
  'asta-fortnite': [
    {
      q: 'How much is Asta in Fortnite?',
      a: 'The Asta outfit costs 1,500 V-Bucks and includes a second style and a Devil Transformation emote.',
    },
  ],
  'deadlock-tier-list': [
    {
      q: 'Who is the best hero in Deadlock right now?',
      a: 'By win rate in October 2026: Graves, Victor, Paige and Seven, each winning about 55–57% of games.',
    },
  ],
  'ride-a-pet-fuse': [
    {
      q: 'How do you unlock the Fuse Machine in Ride A Pet?',
      a: 'Complete Rebirth 1 ($1M Cash and a Horse pet). The machine is left of the Ride Pet with Friends board near spawn.',
    },
  ],
  'break-and-steal-an-egg-codes': [
    {
      q: 'Are there codes for Break and Steal an Egg?',
      a: 'No. The game has no codes menu and no working codes as of October 2026.',
    },
  ],
  'fut-champions-fc-27': [
    {
      q: 'How many points do you need to qualify for FUT Champions in FC 27?',
      a: '1,000 Champions Qualification Points (CQP), earned from Division Rivals and Squad Battles.',
    },
  ],
  'way-of-the-hunter-2': [
    {
      q: 'When did Way of the Hunter 2 come out?',
      a: 'The full release was September 29, 2026 on PC, PS5 and Xbox Series X|S.',
    },
  ],
  'world-space-week-pokemon-go': [
    {
      q: 'Can Astronaut Pikachu be shiny?',
      a: 'Yes. Shiny Astronaut Pikachu can appear from one-star raids and the Timed Research encounter during World Space Week (October 4–10, 2026).',
    },
  ],
  'anime-breaker-codes': [
    {
      q: 'What is the newest Anime Breaker code?',
      a: 'SORRYFORGRIMS (250 emeralds, T3 potions and juices) was the newest on October 5, 2026.',
    },
  ],
  'anime-mysterious-codes': [
    {
      q: 'Where do you redeem codes in Anime Mysterious?',
      a: 'Talk to Naruto in the spawn area, type the code and click Redeem.',
    },
  ],
  'cloverfall-codes': [
    {
      q: 'Is CloverFall the same game as Clover Legends?',
      a: 'No. CloverFall (Malphite Studios), Clover Legends and Clover Time are three different Black Clover–inspired Roblox games with separate codes.',
    },
  ],
  'clover-time-roblox': [
    {
      q: 'Why are my Clover Time codes not working?',
      a: 'You must join the game’s Roblox group first, and codes are case-sensitive — copy and paste them.',
    },
  ],
  'creator-smp-4': [
    {
      q: 'When does Creator SMP 4 start and end?',
      a: 'It runs from October 4 to the finale on October 25, 2026.',
    },
  ],
  'signal-veil': [
    {
      q: 'When does Signal Veil come out?',
      a: 'No release date has been announced. It is coming to PS5, Xbox Series X|S, Switch 2 and PC.',
    },
  ],
  tuffymon: [
    {
      q: 'What is the 110-0 challenge in TuffyMon?',
      a: 'Draft six Pokémon (each pick from a random generation and type), then try to beat every gym leader, Elite Four member and champion in the series without a loss.',
    },
  ],
  pokesurvivor: [
    {
      q: 'Is PokéSurvivor free?',
      a: 'Yes. It is free in the browser with no ads or purchases. Make an account if you want your progress saved.',
    },
  ],
  'mw4-multiplayer': [
    {
      q: 'When does MW4 DMZ early access start?',
      a: 'It started on October 20, 2026 at 10:00 a.m. PT (17:00 UTC) for everyone with a digital pre-order, including the Standard Edition.',
    },
    {
      q: 'What time does MW4 multiplayer come out?',
      a: 'October 23, 2026 at midnight local time on every platform, including PC.',
    },
    {
      q: 'Is Modern Warfare 4 on Game Pass?',
      a: 'Not at launch.',
    },
  ],
  'minecraft-preview-26-70-21': [
    {
      q: 'What are packed ice bricks in Minecraft?',
      a: 'A new building set added in Minecraft Preview 26.70.21: packed ice bricks plus slabs, stairs, walls and chiseled blocks. They do not melt.',
    },
  ],
  'zzz-3-3-countdown': [
    {
      q: 'What time does ZZZ 3.3 come out?',
      a: 'It went live on October 21, 2026 at 11:00 a.m. UTC+8 (October 20, 11:00 p.m. ET / 8:00 p.m. PT).',
    },
    {
      q: 'Who is on the ZZZ 3.3 banners?',
      a: 'Phoenix in Phase 1 (October 21 – November 11) and Severian in Phase 2 (November 11 – December 1), with a Norma rerun.',
    },
  ],
  'castlevania-belmonts-curse': [
    {
      q: "How long is Castlevania: Belmont's Curse?",
      a: 'About 10–15 hours for the main ending and 20+ hours to complete everything.',
    },
    {
      q: "How much is Belmont's Curse?",
      a: '$29.99 for the Standard Edition, $39.99 for the Midnight Edition.',
    },
  ],
  'wow-forever': [
    {
      q: 'When does WoW Forever come out?',
      a: 'The global launch is scheduled for November 4, 2026 at 3:00 p.m. PST (23:00 UTC), which is November 5 at 07:00 UTC+8.',
    },
    {
      q: 'Do I need to buy WoW Forever?',
      a: 'Base access is included with your World of Warcraft subscription or Game Time. The Skyborne upgrade packs and Warcraft Forever Collection are optional purchases with additional benefits.',
    },
    {
      q: 'What is the WoW Forever level cap?',
      a: 'The launch adventure runs from level 1 to level 60. The Legacy System provides additional account-wide horizontal progression.',
    },
  ],
  'hsr-livestream-codes': [
    {
      q: 'What are the HSR 4.7 livestream codes?',
      a: 'The October 30, 2026 Special Program codes are NEVERGONNAGIVE, NEVERGONNAMAKE and AHABLESSYOU, worth 300 Stellar Jade in total. Their announced deadline is October 31, 2026 at 23:59 (UTC+8).',
    },
    {
      q: 'When do HSR 4.7 livestream codes expire?',
      a: 'October 31, 2026 at 23:59 (UTC+8), or 15:59 UTC, according to HoYoverse’s official recap. This code set is expired after that deadline.',
    },
    {
      q: 'Where do I redeem HSR livestream codes?',
      a: 'Use hsr.hoyoverse.com/gift, sign in to your linked HoYoverse account, choose your server and character, and enter each code. Collect the rewards from your in-game Mail.',
    },
  ],
  'fortnite-treasure-hunters-battle-pass': [
    {
      q: 'When does the Fortnite Treasure Hunters Battle Pass come out?',
      a: 'It arrives with the Treasure Hunters mini-season on November 1, 2026.',
    },
    {
      q: 'What skins are in the Fortnite Treasure Hunters Battle Pass?',
      a: 'Epic has announced Portgas D. Ace, Nico Robin, and anime versions of Jonesy, Cuddle Team Leader and Charlotte.',
    },
    {
      q: 'Is Luffy in the Fortnite Treasure Hunters Battle Pass?',
      a: 'Epic lists Luffy in the Item Shop at season launch. Ace and Nico Robin are announced as Battle Pass rewards.',
    },
  ],
  'terrible-lizards': [
    {
      q: 'When did Terrible Lizards come out?',
      a: 'Terrible Lizards launched on October 29, 2026 for PC, PlayStation 5 and Xbox Series X|S.',
    },
    {
      q: 'Is Terrible Lizards free?',
      a: 'The full game is paid: the Steam US list price is $24.99, checked October 31, 2026. A free demo is available from the main Steam store page.',
    },
    {
      q: 'Is Terrible Lizards multiplayer?',
      a: 'Terrible Lizards is a single-player horror parkour game.',
    },
  ],
  'tenebris-somnia': [
    {
      q: 'Is Tenebris Somnia worth it?',
      a: 'Players rate it “Very Positive” on Steam (about 92%). It suits fans of classic Silent Hill / Resident Evil-style horror who enjoy puzzles and live-action story scenes.',
    },
  ],
  'lumber-tycoon-2-work-light': [
    {
      q: 'How to turn on work light in Lumber Tycoon 2?',
      a: 'Click the button on the left side of the Worklight. Green means it is on and lit; red means it is off.',
    },
  ],
  'minecraft-the-sift': [
    {
      q: 'Is The Sift coming to Minecraft?',
      a: 'Yes. The Sift, Minecraft’s fourth dimension, was revealed at Minecraft Live on September 26, 2026 and comes to Java and Bedrock in 2027.',
    },
    {
      q: 'Can you play The Sift now?',
      a: 'A version of The Sift is already explorable in Minecraft Dungeons II, released September 29, 2026.',
    },
  ],
  'minecraft-redeem': [
    {
      q: 'Where do I redeem a Minecraft code?',
      a: 'At minecraft.net/redeem, signed in with your Microsoft account. Game codes, gift cards and cape codes all go there.',
    },
  ],
  'new-minecraft-cape': [
    {
      q: 'How do I get the new Minecraft cape?',
      a: 'Watch Minecraft Dungeons II streams between September 29 and October 14, 2026 to get the free Aurora Cape, then redeem it by October 31.',
    },
  ],
  'minecraft-dungeons-2-release-date': [
    {
      q: 'Is Minecraft Dungeons 2 cross platform?',
      a: 'Yes. It has full crossplay across PC, Xbox Series X|S, PS5, Switch and Switch 2 for parties of up to 4, using a free Microsoft account.',
    },
    {
      q: 'When did Minecraft Dungeons 2 come out?',
      a: 'Minecraft Dungeons II launched worldwide on September 29, 2026 at 8:00 AM UTC.',
    },
  ],
  'silver-light-genshin': [
    {
      q: 'How do you get Silver Light in Genshin?',
      a: 'Play the "Silverwing in Pursuit of the Moon" event (September 24 – October 12, 2026) and reach 200 Festive Cheer to claim the sword for free.',
    },
  ],
  'slenderman-fortnite': [
    {
      q: 'When is Slenderman coming to Fortnite?',
      a: 'He is part of Fortnitemares 2026, which starts October 1, 2026. His cosmetics are expected in the Item Shop during October.',
    },
  ],
  'gta-6-release-date': [
    {
      q: 'When is GTA 6 coming out?',
      a: 'Rockstar Games has set Grand Theft Auto VI for Thursday, November 19, 2026 on PlayStation 5 and Xbox Series X|S.',
    },
  ],
  'ace-combat-8-release-date': [
    {
      q: 'When does Ace Combat 8 come out?',
      a: 'Ace Combat 8: Wings of Theve releases worldwide on October 2, 2026. Deluxe Edition owners got early access from September 29.',
    },
  ],
  'control-resonant-push-or-ground-slam': [
    {
      q: 'Should I pick Push or Ground Slam in Control Resonant?',
      a: 'Ground Slam for most players: it deals far more damage and is needed to break metal roof panels. You can swap later with a Reset Item at the Mural in the Gap.',
    },
  ],
  'aion-2-classes': [
    {
      q: 'How many classes are in Aion 2?',
      a: 'Eight at global launch: Templar, Gladiator, Assassin, Ranger, Sorcerer, Spiritmaster, Cleric and Chanter. A ninth, Brawler, is only in the Korea/Taiwan version for now.',
    },
    {
      q: 'What is the best class in Aion 2?',
      a: 'For solo play, Ranger or Gladiator are the easiest starts. Templar, Cleric and Chanter are always wanted in groups.',
    },
  ],
  'fnaf-x-fortnite': [
    {
      q: 'How much is the FNAF bundle in Fortnite?',
      a: 'The Five Nights at Freddy’s Bundle was 4,500 V-Bucks on October 3, 2026. Bought separately, Freddy, Chica and Bonnie are 1,500 V-Bucks each and Foxy is 1,600.',
    },
    {
      q: 'Where is Freddy Fazbear’s Pizza in Fortnite?',
      a: 'Northeast of Nightmare Neighborhood, at the crossroads with Freaky Fields. Freddy and Foxy spawn there every match.',
    },
  ],
  'aion-2': [
    {
      q: 'When does Aion 2 come out globally?',
      a: 'October 5, 2026 at 1:00 p.m. UTC on PC via Steam and PURPLE. Founder’s Pack owners started early access on September 30.',
    },
  ],
  'wardogs-update': [
    {
      q: 'When is WARDOGS Season 2?',
      a: 'October 15, 2026. It brings four new weapons, a Level 4 helmet, an anti-air tank and rain/fog — and a full wipe.',
    },
  ],
  'halo-combat-evolved-browser': [
    {
      q: 'Can you play Halo CE in a browser?',
      a: 'Yes, through Mitchell Hynes’ free, unofficial browser port of the Xbox version — campaign, split-screen co-op and multiplayer. It works best in Chrome on a PC.',
    },
  ],
  'gears-of-war-e-day-review': [
    {
      q: 'Is Gears of War: E-Day good?',
      a: 'Critics think so: 86 on Metacritic and 88 on OpenCritic, with praise for the story, new movement and visuals, and some criticism of the semi-open-world sections.',
    },
    {
      q: 'Is Gears of War: E-Day on Game Pass?',
      a: 'Yes. It is included with Game Pass Ultimate and PC Game Pass from launch on October 6, 2026.',
    },
  ],
  'ea-fc-27-lite': [
    {
      q: 'Is FC 27 Lite free?',
      a: 'Yes. EA SPORTS FC 27 Lite is free to download on PS5, PS4, Xbox Series X|S, Xbox One, the EA app, Steam and the Epic Games Store. It needs an internet connection.',
    },
  ],
  'burger-king-fc-27': [
    {
      q: 'How do I redeem a Burger King FC 27 code?',
      a: 'Enter the code from your receipt on EA’s code redemption page, signed in to the same EA account you play FC 27 on, then open Ultimate Team. Up to 12 codes per account.',
    },
  ],
  'is-agar-io-down': [
    {
      q: 'Is Agar.io down right now?',
      a: 'It was up with no reported outages when we checked on September 30, 2026. If it won’t load for you, try the quick fixes on this page first.',
    },
  ],
  'was-ist-ein-idle-game': [
    {
      q: 'Was ist ein Idle Game?',
      a: 'Ein Idle Game (auch "Incremental Game") macht Fortschritt, während du nichts tust — du kommst zurück, sammelst ein, verbesserst, und die Zahlen wachsen weiter.',
    },
    {
      q: 'What is an idle game?',
      a: 'An idle (or incremental) game keeps progressing while you are away — you come back, collect, upgrade, and the numbers keep growing.',
    },
  ],
  'survivor-island-idle-game': [
    {
      q: 'Is the Survivor Island Idle Game mod APK safe?',
      a: 'No. Modded APKs from third-party sites can carry malware and get your account banned. The game is free on Google Play and the App Store.',
    },
  ],
  'dragonkind-game': [
    {
      q: 'How do you play Dragonkind?',
      a: 'Create a free account at dragonkind.com, get sorted into a wing, section and squad, then press “Brave Threshing” and make choices until a dragon bonds you.',
    },
    {
      q: 'Why did I die in Dragonkind?',
      a: 'Threshing can kill you, just like in Fourth Wing. Many players die a few times before bonding; wait for the cooldown and try again.',
    },
    {
      q: 'What dragon colors can bond you in Dragonkind?',
      a: 'Red, green, orange, brown, blue or black. Your result card also shows the dragon’s name, tail type, age and lineage.',
    },
  ],
  'my-anime-mine-codes': [
    {
      q: 'What are the new My Anime Mine codes?',
      a: 'LifeIsRoblox (2 Enchanted Dice) is the newest; SOULFORGE, STORM, EnchantedStrength and MUTATIONLUCK also worked on October 3, 2026.',
    },
  ],
  'fishing-master-codes': [
    {
      q: 'How do you redeem codes in Fishing Master?',
      a: 'Open the Shop (or Settings) in Fishing Master, type the code exactly as shown — codes are case-sensitive — and press Redeem.',
    },
  ],
  'shigaku-codes': [
    {
      q: 'Why are my Shigaku codes not working?',
      a: 'You must join the Shigaku Roblox community group before codes redeem. Also check spelling and spaces, and copy-paste the code.',
    },
  ],
  'skibidi-toilet-war-codes': [
    {
      q: 'Where do you put codes in Skibidi Toilet War?',
      a: 'Press Codes on the right side of the screen, paste the code and click CLAIM.',
    },
  ],
  'star-wars-galactic-racer': [
    {
      q: 'Is there early access for Star Wars: Galactic Racer?',
      a: 'No. No edition, including the Deluxe Edition, gets early access. Everyone can play from October 6, 2026 at 09:00 UTC.',
    },
    {
      q: 'When does Star Wars: Galactic Racer come out?',
      a: 'October 6, 2026 on PC, PS5 and Xbox Series X|S.',
    },
  ],
  'gacha-revenue-september-2026': [
    {
      q: 'Which gacha game made the most money in September 2026?',
      a: 'Genshin Impact, with an estimated $50.2M on mobile, followed by Honkai: Star Rail ($35.7M) and Dragon Ball Z Dokkan Battle ($27.0M).',
    },
  ],
  'one-in-a-krillion': [
    {
      q: 'What is One in a Krillion in Krillion?',
      a: 'The rarest answer tier in the Krillion daily trivia game, worth 100 points — fewer than one in a thousand players find it.',
    },
    {
      q: 'Where can I play Krillion?',
      a: 'Free in the browser at krillion.io. A new Daily Dive of seven prompts opens every day at midnight New York time.',
    },
    {
      q: 'What is Krillion Unlimited?',
      a: 'The endless mode of Krillion: you keep getting new prompts instead of waiting for the next Daily Dive. Open it from “∞ Unlimited” in the krillion.io menu.',
    },
  ],
  'xerneas-pokemon-go': [
    {
      q: 'Can Xerneas be shiny in Pokémon GO?',
      a: 'Yes. Shiny Xerneas can appear in its 5-star raids, which run September 30 – October 6, 2026.',
    },
  ],
  'pokemon-center-delta-reign': [
    {
      q: 'When does Delta Reign come out?',
      a: 'The Delta Reign Pokémon TCG expansion releases on November 6, 2026. Pokémon Center preorders opened in late September 2026.',
    },
  ],
};
