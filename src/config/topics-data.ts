import type { Topic, TopicGroup } from './topics';

// Researched 2026-09-30. Facts that change often (codes, dates, patch notes)
// are phrased with the date they were checked.

const UPDATED = '2026-09-30';

type Links = { name: string; url: string }[];

function t(
  slug: string,
  keyword: string,
  aliases: string[],
  group: TopicGroup,
  game: string,
  summary: string,
  sections: [string, string][],
  site: [string, string],
  links?: Links
): Topic {
  return {
    slug,
    keyword,
    aliases,
    group,
    game,
    summary,
    sections: sections.map(([heading, body]) => ({ heading, body })),
    site: { name: site[0], url: site[1] },
    links,
    updatedAt: UPDATED,
  };
}

const ROBLOX: Topic[] = [
  t(
    'lumber-tycoon-2-secret-badge',
    'lumber tycoon 2 secret badge',
    [
      'lumber tycoon secret badge',
      'lumber tycoon 2 secret quest',
      'glorb axe lumber tycoon 2',
    ],
    'roblox',
    'Lumber Tycoon 2 (Roblox)',
    'The Lumber Tycoon 2 secret badge ("You got glorbed!") and the Glorbaxe were the hidden challenge of The Hunt: Roblox 20 event, added on September 25, 2026.',
    [
      [
        'What the secret quest was',
        'For The Hunt: Roblox 20 (September 17–28, 2026), Lumber Tycoon 2 hid a multi-step puzzle. Finishing it awarded the Glorbaxe — a generalist axe with a face on the head and a lavender grip — and picking it up granted the "You got glorbed!" badge.',
      ],
      [
        'How it worked (after the nerf)',
        '1. Climb down the wooden truss into the secret cave pit.\n2. Talk to the skeleton NPC and choose "I seek permission" so the quest registers.\n3. Click the purple glorb at your base until it locks on orange (about 15–18 clicks), then drop it in lava.\n4. When the purple room opens, take its three items to the hidden bunker and give each to the right NPC at the table.\n5. Grab the axe hanging from the ceiling to get the badge.',
      ],
      [
        'Can you still get it?',
        'The quest stopped working for new runs when The Hunt ended on September 28, 2026. Players who already own the Glorbaxe keep it.',
      ],
    ],
    [
      'Lumber Tycoon 2 Wiki — Glorbaxe',
      'https://lumber-tycoon-2.fandom.com/wiki/Glorbaxe',
    ],
    [
      {
        name: 'Wiki tutorial: Obtaining a Glorbaxe',
        url: 'https://lumber-tycoon-2.fandom.com/wiki/Tutorials/Obtaining_a_Glorbaxe',
      },
      {
        name: 'The Hunt: Roblox 20 (Roblox newsroom)',
        url: 'https://about.roblox.com/newsroom/2026/09/join-the-hunt-roblox-20',
      },
    ]
  ),
  t(
    'lumber-tycoon-2-work-light',
    'how to turn on work light in lumber tycoon 2',
    ['lumber tycoon 2 worklight', 'lumber tycoon 2 lights'],
    'roblox',
    'Lumber Tycoon 2 (Roblox)',
    'Click the button on the left side of the Worklight. Green means on and lit; red means off.',
    [
      [
        'Turning it on',
        'Every Worklight has a toggle button on its left side. Click it once: the button turns green and the lamp starts emitting light. Click again to switch it off (the button turns red).',
      ],
      [
        'Wiring it to a switch',
        'To control lights from one place, buy a lever and a Simple Wire. Connect the wire from the lever to the Worklight — flipping the lever now turns the light on and off. You can chain more wires to control several lights.',
      ],
    ],
    [
      'Lumber Tycoon 2 Wiki — Worklight',
      'https://lumber-tycoon-2.fandom.com/wiki/Worklight',
    ]
  ),
  t(
    'oil-tycoon-secrets',
    'oil tycoon roblox secrets',
    ['oil tycoon secrets'],
    'roblox',
    'Oil Tycoon! (Roblox)',
    'Oil Tycoon! hides six secret badges around the map, plus two story endings and a CEO building that unlocks after your first rebirth.',
    [
      [
        'The secret badges',
        'The secrets are tied to badges named "noclipped", "weeee!", "out of bounds", "stop to smell the flowers", "chilly outside" and "grave robber". They are spread across the desert, the grassy area, the frozen area, the beanstalk, the grave and the bottomless hole.',
      ],
      [
        'Tips',
        'Secrets do not reset when you rebirth, so collect them on your first run. The igloo secret, the hidden-cave flower and the true ending are the rarest achievements.',
      ],
    ],
    [
      'Oil Tycoon! on Roblox',
      'https://www.roblox.com/games/105072660911040/Oil-Tycoon',
    ]
  ),
  t(
    'slayers-2-tier-list',
    'tier list slayer 2',
    ['slayers 2 tier list', 'slayers 2 clan tier list'],
    'roblox',
    'Slayers 2 (Roblox)',
    'A quick look at the current Slayers 2 meta: the best clans, breathing styles, demon arts and weapons as of late September 2026.',
    [
      [
        'Clans',
        'Kamado and Rengoku sit at the top — Kamado for its mix of damage, survivability and utility. Uzui, Agatsuma, Soyama and Kocho follow; Himejima, Iguro, Shinazugawa and Douma are solid A-tier picks.',
      ],
      [
        'Breathing styles & demon arts',
        'Thunder and Serpent are top-tier breathing styles, with Wind rising after recent speed and block-pressure buffs. For demons, Shockwave, Pyrokinesis and Obi Manipulation lead, with Blood and Ice Manipulation close behind.',
      ],
      [
        'Weapons',
        'Firstlight Tanto is the best Demon Slayer weapon; Firstlight War Fans are the top demon pick. Rankings shift with every balance patch, so re-check after updates.',
      ],
    ],
    [
      'Pro Game Guides — Slayers 2 tier list',
      'https://progameguides.com/roblox/slayers-2-tier-list/',
    ],
    [
      {
        name: 'Destructoid tier list',
        url: 'https://www.destructoid.com/slayers-2-tier-list/',
      },
      {
        name: 'TechWiser tier list',
        url: 'https://techwiser.com/slayers-2-tier-list/',
      },
    ]
  ),
  t(
    'yba-codes',
    'yba codes',
    ['your bizarre adventure codes'],
    'roblox',
    'Your Bizarre Adventure (Roblox)',
    'YBA codes give free Lucky Arrows, Rokakaka, EXP boosts and stand resets. You need Prestige 1 to redeem them, and codes usually expire after about a week.',
    [
      [
        'How to redeem',
        'Open the Menu (bottom-right), go to Settings (the cog), paste the code into the "Enter a code to redeem here" box and confirm.',
      ],
      [
        'Requirements',
        'All codes require at least Prestige 1. Active codes typically expire one week after release, so redeem new ones quickly.',
      ],
      [
        'Where new codes appear',
        'The official YBA Discord announces codes first; the community wiki keeps a current list. As of September 28, 2026 no new codes had been released.',
      ],
    ],
    [
      'YBA Wiki — Codes',
      'https://your-bizarre-adventure.fandom.com/wiki/Codes',
    ],
    [
      {
        name: 'Dexerto YBA codes',
        url: 'https://www.dexerto.com/roblox/roblox-yba-codes-free-your-bizarre-adventure-rokakaka-1727911/',
      },
    ]
  ),
  t(
    'ball-vs-ball-codes',
    'ball vs ball codes',
    ['ball vs ball roblox codes'],
    'roblox',
    'Ball vs Ball (Roblox)',
    'Ball vs Ball codes give free coins (usually 100 each) that you spend on the gacha machine for new balls. A new code tends to arrive with each update.',
    [
      [
        'How to redeem',
        'Launch the game, click the present button in the top-left, choose "codes", enter the code exactly (they are case-sensitive) and press Redeem.',
      ],
      [
        'Finding new codes',
        'Codes are posted in the Ball vs Ball Discord. The announcements channel is hidden by default: open "Channels & Roles", enable announcements, and look at the bottom of the latest changelog.',
      ],
    ],
    [
      'PCGamesN — Ball vs Ball codes',
      'https://www.pcgamesn.com/roblox/ball-vs-ball-codes',
    ],
    [
      {
        name: 'GamesRadar+ codes list',
        url: 'https://www.gamesradar.com/games/simulation/ball-vs-ball-codes/',
      },
    ]
  ),
  t(
    'ride-a-pet',
    'ride a pet',
    ['ride a pet roblox'],
    'roblox',
    'Ride A Pet (Roblox)',
    'Ride A Pet is a Roblox collection game: ride pets to find eggs across the map, carry them home, hatch rideable pets and use faster mounts to reach rarer eggs.',
    [
      [
        'How to play',
        'Mount a pet (even the starter Snail beats walking), use your radar to find eggs, carry each egg back to your ranch and drop it in a nest. Hatched pets earn cash on your plot; spend it on Hatch Luck and better radars.',
      ],
      [
        'About the game',
        'Released in April 2026, it had passed 170 million visits by late September. It runs on desktop, console, mobile and tablet.',
      ],
    ],
    [
      'Ride A Pet on Roblox',
      'https://www.roblox.com/games/124216119978534/Ride-A-Pet',
    ]
  ),
  t(
    'ride-a-pet-volcano',
    'ride a pet volcano',
    ['ride a pet volcanic egg', 'ride a pet volcano egg', 'ride a pet magma'],
    'roblox',
    'Ride A Pet (Roblox)',
    'The Volcano arrived in Ride A Pet with the Volcanic Update on September 26, 2026. It holds the Volcanic Egg — the game’s rarest egg at 2.5T Hatch Luck — guarded by a dragon.',
    [
      [
        'Where the volcano is',
        'Travel past the Desert and cross the water to Volcano Island. The way into the crater is on the right side and can only be reached with a flying pet, so get the Phoenix (or a Griffin) first.',
      ],
      [
        'Getting the Volcanic Egg out',
        'Grabbing the egg wakes the dragon guardian and starts a 20-second timer to escape the crater. Once you are out, a second timer starts — reach your ranch and drop the egg in a nest before it runs out or the egg cracks. A fast flying pet makes both legs much easier.',
      ],
      [
        'Magma mutation',
        'You can also dip any egg into the volcano’s lava to try for the Magma mutation (10× speed and money). Each egg gets one try at about a 15% chance; failing costs the egg a few seconds of its timer.',
      ],
    ],
    [
      'Ride A Pet on Roblox',
      'https://www.roblox.com/games/124216119978534/Ride-A-Pet',
    ]
  ),
  t(
    'blue-lock-farm',
    'blue lock farm',
    ['blue lock farm codes'],
    'roblox',
    'Blue Lock Farm (Roblox)',
    'Blue Lock Farm is an anime placement simulator: open lockers to hatch Blue Lock characters, place them to earn passive cash, and upgrade toward a soccer empire.',
    [
      [
        'Gameplay',
        'Buy lockers for a chance at rare characters, deploy them on your plot, and upgrade them to raise earnings. Lockers keep opening and cash keeps accruing while you are offline.',
      ],
      [
        'Codes (checked September 26, 2026)',
        'WEATHER — Grade Tokens + Luck Potion\nCOMMUNITY — Cash, Luck and Grade Speed potions\nPOLISHER — Jackpot Token\nRedeem at the bottom of the Shop menu. Codes can expire at any time.',
      ],
    ],
    [
      'Blue Lock Farm on Roblox',
      'https://www.roblox.com/games/132767904294856/Blue-Lock-Farm',
    ],
    [
      {
        name: 'Pro Game Guides — Blue Lock Farm codes',
        url: 'https://progameguides.com/roblox/blue-lock-farm-codes/',
      },
    ]
  ),
  t(
    'steal-an-egg',
    'steal an egg',
    ['steal an egg roblox'],
    'roblox',
    'Steal An Egg (Roblox)',
    'Steal An Egg is a Roblox tycoon where you train speed, raid dangerous biomes for eggs, and race them back to your base before other players steal them.',
    [
      [
        'Core loop',
        'Train on your treadmill to raise Speed, steal eggs from pets and other players, hatch them for income-producing pets, then upgrade your base to store more. There are 104 pets to collect, plus sizes and mutations.',
      ],
      [
        'Why speed matters',
        'Speed decides which areas you can raid safely, so treadmill upgrades are the best early investment.',
      ],
    ],
    [
      'Steal An Egg on Roblox',
      'https://www.roblox.com/games/107778070777162/Steal-An-Egg',
    ]
  ),
  t(
    'anime-dice',
    'anime dice',
    ['anime dice codes', 'anime dice roblox'],
    'roblox',
    'Anime Dice (Roblox)',
    'Anime Dice mixes gacha rolling with combat: roll dice to reveal anime characters, place them on your plot to earn money, and upgrade your dice for better luck.',
    [
      [
        'How it plays',
        'Every roll can reveal a new character or mutation. Units on your plot generate money (also while offline), which you reinvest into dice upgrades and a stronger team for the leaderboards.',
      ],
      [
        'Codes',
        'Codes give Trait Rerolls, Gems and Lucky Spins. The developer, More & More Games, posts them on its Discord server.',
      ],
    ],
    [
      'Anime Dice on Roblox',
      'https://www.roblox.com/games/113290951185459/Anime-Dice',
    ],
    [
      {
        name: 'GamesRadar+ Anime Dice codes',
        url: 'https://www.gamesradar.com/games/simulation/anime-dice-codes/',
      },
    ]
  ),
  t(
    'dream-car-collection',
    'dream car collection',
    ['dream car collection codes'],
    'roblox',
    'Dream Car Collection (Roblox)',
    'Dream Car Collection is a Roblox unboxing sim: buy lucky crates, unbox 50+ realistic cars, and let your collection earn money while you race other players.',
    [
      [
        'How to play',
        'Spawn a lucky crate, buy it, place and open it to get a car. Cars in your collection generate money (even offline) that you spend on better crates. You can also wager cars in all-or-nothing drag races with friends.',
      ],
      [
        'Codes',
        'Codes give crate-luck potions and gems. The game is still in beta, so expect frequent updates.',
      ],
    ],
    [
      'Dream Car Collection on Roblox',
      'https://www.roblox.com/games/76841016201110/Dream-Car-Collection',
    ],
    [
      {
        name: 'Pro Game Guides codes',
        url: 'https://progameguides.com/roblox/dream-car-collection-codes/',
      },
    ]
  ),
  t(
    'roll-a-fisherman',
    'roll a fisherman',
    ['roll a fisherman codes'],
    'roblox',
    'Roll a Fisherman (Roblox)',
    'Roll a Fisherman is a Roblox pier tycoon: roll fishermen, park them on your dock, sell their catches from market stands, and reinvest into upgrades and rebirths.',
    [
      [
        'The production loop',
        'Roll a fisherman → place them in a dock slot → harvest the fish from their bucket → display fish on stands to earn cash every second → buy upgrades and rebirth. Income continues while you are offline.',
      ],
      [
        'Codes',
        'Codes give Cash, Gold and extra wheel Spins — worth redeeming early when progression is slowest.',
      ],
    ],
    [
      'Roll a Fisherman on Roblox',
      'https://www.roblox.com/games/90920025162454/Roll-a-Fisherman',
    ],
    [
      {
        name: 'Pro Game Guides codes',
        url: 'https://progameguides.com/roblox/roll-a-fisherman-codes/',
      },
    ]
  ),
  t(
    'build-and-kill-zombies',
    'build and kill zombies',
    ['build and kill zombies roblox'],
    'roblox',
    'Build and Kill Zombies (Roblox)',
    'Build and Kill Zombies is a free Roblox game where you roll vehicle parts, build an armed car, and drive it through escalating zombie waves.',
    [
      [
        'How a run works',
        'Roll parts in the lobby, assemble your car on your plot, add weapons and defenses, then drive down a track filling with zombies. Distance and kills turn into cash for better rolls and permanent skills.',
      ],
      [
        'Co-op',
        'Friends on the same server can build one vehicle together or drive side by side. Launched August 2026, it passed 32 million visits within weeks.',
      ],
    ],
    [
      'Build and Kill Zombies on Roblox',
      'https://www.roblox.com/games/105011592530400/Build-and-Kill-Zombies',
    ]
  ),
  t(
    'build-an-ant-empire-codes',
    'build an ant empire codes',
    ['build an ant empire'],
    'roblox',
    'Build An Ant Empire (Roblox)',
    'Build An Ant Empire codes give timed Cash boosts. The game itself is a colony builder: roll for ants, gather food, earn cash and upgrade your empire.',
    [
      [
        'How to redeem',
        'Open the game, tap Settings and enter the code in the code box. Rewards so far have been 15-minute Cash boosts.',
      ],
      [
        'Where codes come from',
        'The developer, Insect Kingdom Studio, posts codes in its Roblox group with no fixed schedule — check back after updates.',
      ],
    ],
    [
      'PCGamesN — Build an Ant Empire codes',
      'https://www.pcgamesn.com/roblox/build-an-ant-empire-codes',
    ]
  ),
  t(
    'loot-to-forge-codes',
    'loot to forge codes',
    ['+1 loot to forge codes'],
    'roblox',
    '+1 Loot To Forge (Roblox)',
    '+1 Loot To Forge codes give free Ember Stones, coins, potions and rerolls. As of late September 2026 the active code was 50000CCU (50 Ember Stones).',
    [
      [
        'How to redeem',
        'Click the Shop icon on the left, scroll to the Code section, paste the code and press Submit.',
      ],
      [
        'New codes',
        'The Good Bro Studio Roblox group is the only place the developers announce updates; new codes usually arrive with player-count milestones.',
      ],
    ],
    [
      '+1 Loot To Forge on Roblox',
      'https://www.roblox.com/games/118805555015549/1-Loot-To-Forge',
    ],
    [
      {
        name: 'Dexerto codes list',
        url: 'https://www.dexerto.com/roblox/1-loot-to-forge-codes-3411232/',
      },
    ]
  ),
  t(
    'fortnitemares-2026',
    'fortnitemares 2026',
    ['fortnitemares'],
    'roblox',
    'Fortnite',
    'Fortnitemares 2026 — themed "The Game Is Cursed" — starts October 1, 2026, with collabs including Five Nights at Freddy’s, Freddy Krueger, Slender Man, Beetlejuice and The Purge.',
    [
      [
        'Start date',
        'Epic confirmed the Halloween event begins Thursday, October 1, 2026, alongside Fortnite update 42.30.',
      ],
      [
        'Confirmed collabs',
        'Five Nights at Freddy’s, Freddy Krueger (A Nightmare on Elm Street), Slender Man, Beetlejuice, The Purge and more. Most skins are expected to roll out in the Item Shop in stages through October.',
      ],
    ],
    ['Fortnite official site', 'https://www.fortnite.com'],
    [
      {
        name: 'All Fortnitemares 2026 collabs (VICE)',
        url: 'https://www.vice.com/en/article/all-fortnitemares-2026-collabs-and-skins-confirmed-fnaf-slender-man-obsession-and-more/',
      },
    ]
  ),
  t(
    'slenderman-fortnite',
    'slenderman fortnite',
    ['slender man fortnite skin'],
    'roblox',
    'Fortnite',
    'Slender Man is confirmed for Fortnite as part of Fortnitemares 2026 — he appears in the event key art, and his cosmetics are expected in the Item Shop during October.',
    [
      [
        'What’s confirmed',
        'The faceless, suited creepypasta icon is one of the headline Fortnitemares 2026 collabs, shown behind Freddy Krueger in Epic’s key art. The event starts October 1, 2026.',
      ],
      [
        'When can you buy it?',
        'Epic has not given individual dates. Collab skins are releasing in waves through October, so watch the Item Shop.',
      ],
    ],
    ['Fortnite official site', 'https://www.fortnite.com'],
    [
      {
        name: 'Fortnitemares 2026 skins (esports.gg)',
        url: 'https://esports.gg/news/fortnite/fortnitemares-2026-skins/',
      },
    ]
  ),
  t(
    'fortnite-globals',
    'fortnite globals',
    ['fncs global championship 2026', 'fortnite global championship'],
    'roblox',
    'Fortnite',
    'Fortnite Globals (the FNCS Global Championship) is Fortnite’s world championship. The 2026 edition in Antwerp was won by SwizzY and Pixie.',
    [
      [
        '2026 result',
        'Held September 26–27, 2026 at the Lotto Arena in Antwerp, Belgium, with the top 50 duos and a $2,000,000 prize pool. SwizzY and Pixie (HavoK by Vitality) won with 525 points over 12 games — two ahead of shxrk & t3eny — earning $400,000.',
      ],
      [
        'History',
        'Globals replaced the Fortnite World Cup in 2023. SwizzY is the first player to win back-to-back world titles (2025 and 2026).',
      ],
    ],
    ['Fortnite Competitive', 'https://www.fortnite.com/competitive'],
    [
      {
        name: 'Liquipedia — FNCS 2026',
        url: 'https://liquipedia.net/fortnite/Fortnite_Champion_Series/2026',
      },
    ]
  ),
];

const MINECRAFT: Topic[] = [
  t(
    'minecraft-the-sift',
    'minecraft the sift',
    ['sift minecraft', 'sift dimension minecraft', 'minecraft sift'],
    'minecraft',
    'Minecraft',
    'The Sift is Minecraft’s fourth dimension — the first new one since The End in 2011. It was revealed at Minecraft Live on September 26, 2026 and comes to Java and Bedrock in 2027.',
    [
      [
        'What it looks like',
        'A colorful dimension full of souls: red and orange stone, green vegetation, sculk, and a hazardous liquid called ichor. Mojang calls it serene but dangerous.',
      ],
      [
        'Biomes',
        'Two are confirmed: the Meadow (lush grass and new flora and fauna) and the Carapace (a desert of huge bone structures).',
      ],
      [
        'Play it early',
        'A version of The Sift is already explorable in Minecraft Dungeons II, released September 29, 2026.',
      ],
    ],
    [
      'Minecraft Live September 2026 recap',
      'https://www.minecraft.net/en-us/article/mclive_sept2026_recap',
    ],
    [
      {
        name: 'Xbox Wire announcement',
        url: 'https://news.xbox.com/en-us/2026/09/26/minecraft-new-dimension-sift-dungeons-2/',
      },
      {
        name: 'Minecraft Wiki — The Sift',
        url: 'https://minecraft.wiki/w/Dungeons_II:The_Sift',
      },
    ]
  ),
  t(
    'minecraft-redeem',
    'minecraft redeem',
    [
      'minecraft code redeem',
      'minecraft cape redeem',
      'minecraft redeem cape',
      'minecraft reedem',
    ],
    'minecraft',
    'Minecraft',
    'Redeem every Minecraft code — game codes, gift cards and cape codes — at minecraft.net/redeem while signed in with your Microsoft account.',
    [
      [
        'Steps',
        '1. Go to minecraft.net/redeem.\n2. Sign in with the Microsoft account that owns (or will own) Minecraft.\n3. Enter the 25-character code and confirm.\n4. Cape codes apply to your profile — pick the cape in the launcher’s skins/wardrobe screen (Java) or in the dressing room (Bedrock).',
      ],
      [
        'Common problems',
        'Make sure you are on the right Microsoft account, the code has no typos (O vs 0), and it hasn’t passed its deadline — promo capes usually have one.',
      ],
    ],
    ['Minecraft — Redeem', 'https://www.minecraft.net/en-us/redeem']
  ),
  t(
    'new-minecraft-cape',
    'new minecraft cape',
    ['minecraft cape'],
    'minecraft',
    'Minecraft',
    'The newest free Minecraft cape is the Aurora Cape: watch Minecraft Dungeons II streams between September 29 and October 14, 2026, then redeem by October 31.',
    [
      [
        'Aurora Cape',
        'Watch any rewards-enabled Minecraft Dungeons II livestream for 15 minutes on Twitch or 3 minutes on TikTok between September 29 (9:00 AM PT) and October 14, 2026. The code arrives in your Twitch Inventory or TikTok notifications; redeem it at minecraft.net/redeem by October 31, 2026.',
      ],
      [
        'Corrupted Creeper Cape',
        'This one came from a Twitch/TikTok watch campaign on September 21–26, 2026 ahead of Dungeons II; the watch quest closed on September 27.',
      ],
    ],
    [
      'Minecraft Dungeons II capes promos',
      'https://www.minecraft.net/en-us/article/minecraft-dungeons-ii-capes-promos',
    ],
    [
      {
        name: 'Minecraft Wiki — Aurora Cape',
        url: 'https://minecraft.wiki/w/Aurora_Cape',
      },
      { name: 'Redeem codes', url: 'https://www.minecraft.net/en-us/redeem' },
    ]
  ),
  t(
    'minecraft-dungeons-2-release-date',
    'minecraft dungeons 2 release date',
    ['minecraft dungeons ii'],
    'minecraft',
    'Minecraft Dungeons II',
    'Minecraft Dungeons II launched on September 29, 2026 at 8:00 AM UTC worldwide.',
    [
      [
        'Launch details',
        'The release was simultaneous around the world at 08:00 UTC. It includes an early look at The Sift, the new dimension coming to Minecraft in 2027.',
      ],
      [
        'Launch cape',
        'Watching Dungeons II streams from September 29 to October 14 unlocks the free Aurora Cape for Minecraft.',
      ],
    ],
    [
      'Minecraft Dungeons II announcement',
      'https://www.minecraft.net/en-us/article/minecraft-dungeons-ii-date-announce',
    ],
    [
      {
        name: 'Minecraft Dungeons II on Steam',
        url: 'https://store.steampowered.com/app/1912410/Minecraft_Dungeons_II/',
      },
    ]
  ),
];

const GENSHIN: Topic[] = [
  t(
    'eitr-genshin',
    'eitr genshin',
    ['genshin eitr'],
    'genshin',
    'Genshin Impact',
    'The Eitr (Embryonic-Ichoric-Telluric-Rudiment) is a forbidden Hyperborean bio-furnace in Genshin Impact that can devour living beings and fuse them into a Chimera.',
    [
      [
        'What it is',
        'A Hyperborean creation carrying the power of the Light Realm. It can alter organisms into something resembling the Belyi Tsar, and was considered forbidden research in Hyperborea.',
      ],
      [
        'Role in the 7.1 story',
        'Ronova fuses the Eitr with a Celestial Nail, awakening the Heavenly Principles — after which Nails across Teyvat begin reacting.',
      ],
    ],
    [
      'Genshin Impact Wiki — Eitr',
      'https://genshin-impact.fandom.com/wiki/Eitr',
    ]
  ),
  t(
    'hroptatyr-genshin',
    'hroptatyr genshin',
    ['hroptatyr', 'genshin hroptatyr'],
    'genshin',
    'Genshin Impact',
    'Hroptatyr, "The Wise", is one of the Five Sinners of Khaenri’ah — once President of the Universitas Magistrorum and Chief Royal Mage.',
    [
      [
        'Background',
        'His research focused on the Crimson Moon. Like the other Sinners he answered the call of the Abyss and gained world-shattering power, but did nothing to stop Khaenri’ah’s cataclysm — which is why Dainsleif swore revenge.',
      ],
      [
        'Name & appearance',
        'The name comes from a title of Odin meaning "sage". He is shown as a young man with long pale-violet hair and a blue scarf across an ornate outfit.',
      ],
    ],
    [
      'Genshin Impact Wiki — Hroptatyr',
      'https://genshin-impact.fandom.com/wiki/Hroptatyr',
    ]
  ),
  t(
    'rhinedottir-genshin',
    'rhinedottir genshin',
    ['rhinedottir'],
    'genshin',
    'Genshin Impact',
    'Rhinedottir ("Gold", Hexenzirkel codename "R") is one of the Five Sinners of Khaenri’ah and the Ruler of Life. She is not playable, and HoYoverse hasn’t announced that she will be.',
    [
      [
        'Who she is',
        'An alchemist and Hexenzirkel mage known as Gold, and one of the Four Great Rulers of Teyvat. She is the creator of Albedo and Durin.',
      ],
      [
        'Will she be playable?',
        'Unconfirmed. So far she has only appeared through mentions and a voice-only role in the Windblume’s Breath event; everything else is fan speculation.',
      ],
    ],
    [
      'Genshin Impact Wiki — Rhinedottir',
      'https://genshin-impact.fandom.com/wiki/Rhinedottir',
    ]
  ),
  t(
    'ronova-genshin',
    'ronova genshin',
    ['ronova'],
    'genshin',
    'Genshin Impact',
    'Ronova is the Ruler of Death among Teyvat’s Four Great Rulers and the Arbiter of the Heavenly Principles. The 7.1 Archon Quest ends with her gravely wounded and stripped of her authority.',
    [
      [
        'Who she is',
        'One of the four Shades created by the Heavenly Principles. She governs death — she cursed Khaenri’ah with immortality and gave strength to the people of Natlan. The Frostmoon Scions call her Tuonetar.',
      ],
      [
        'In version 7.1',
        'Ronova fuses the Eitr with a Celestial Nail, then takes a fatal blow from the Eye of the Fatui. She survives, badly injured, but loses her divine authority.',
      ],
    ],
    [
      'Genshin Impact Wiki — Ronova',
      'https://genshin-impact.fandom.com/wiki/Ronova',
    ]
  ),
  t(
    'silver-light-genshin',
    'silver light genshin',
    [
      'genshin silver light',
      'silverwing genshin',
      'silverwing in pursuit of the moon',
    ],
    'genshin',
    'Genshin Impact',
    'Silver Light is a free 4-star sword from the version 7.1 event "Silverwing in Pursuit of the Moon", available September 24 – October 12, 2026.',
    [
      [
        'How to get it',
        'Play the event’s three activities — The Great Chase and Dispelling, Banner Against the Dark, and Spiritshot Salvo — to earn Festive Cheer. Reach 200 Festive Cheer to claim the sword.',
      ],
      [
        'Stats',
        'Level 90: 510 base ATK with a 41.3% ATK substat. Passive "Radiance on the Water": +52 Elemental Mastery for 12 s after using an Elemental Skill, stacking twice.',
      ],
    ],
    [
      'Official event announcement',
      'https://genshin.hoyoverse.com/m/en/news/detail/166267',
    ],
    [
      {
        name: 'Genshin Impact Wiki — Silver Light',
        url: 'https://genshin-impact.fandom.com/wiki/Silver_Light',
      },
    ]
  ),
];

const PC: Topic[] = [
  t(
    'gta-6-release-date',
    'rockstar games gta vi',
    ['gta 6 release date', 'grand theft auto vi'],
    'pc',
    'Grand Theft Auto VI',
    'Rockstar Games has set Grand Theft Auto VI for Thursday, November 19, 2026 on PlayStation 5 and Xbox Series X|S.',
    [
      [
        'Release date',
        'November 19, 2026, after two delays. It launches on PS5 and Xbox Series X|S; no PC date has been announced.',
      ],
      [
        'Setting',
        'The state of Leonida, including a modern-day return to Vice City.',
      ],
    ],
    [
      'Rockstar Newswire — GTA VI date',
      'https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026',
    ]
  ),
  t(
    'transport-fever-3',
    'transport fever 3',
    ['transport fever 3 release date'],
    'pc',
    'Transport Fever 3',
    'Transport Fever 3 launched on September 29, 2026 for PC, Mac and Linux (Steam, Epic, GOG) plus PlayStation 5 and Xbox Series X|S.',
    [
      [
        'Platforms',
        'Released simultaneously on Steam, the Epic Games Store and GOG for Windows, macOS and Linux, and on PS5 and Xbox Series X|S. Published by Paradox Interactive.',
      ],
      [
        'What it is',
        'The third game in the transport-empire series: build rail, road, water and air networks and grow cities over more than a century.',
      ],
    ],
    [
      'Transport Fever 3 on Steam',
      'https://store.steampowered.com/app/3493540/Transport_Fever_3/',
    ]
  ),
  t(
    'ace-combat-8-release-date',
    'ace combat 8 release date',
    [
      'ace combat 8',
      'ace combat 8 early access countdown',
      'ace combat 8 wings of theve',
    ],
    'pc',
    'Ace Combat 8: Wings of Theve',
    'Ace Combat 8: Wings of Theve releases worldwide on October 2, 2026. Deluxe Edition owners got early access from September 29.',
    [
      [
        'Dates',
        'Early access: September 29, 2026 (Deluxe Edition, Joker Flight Pack and Premium Joker Flight Pack). Full launch: October 2, 2026 on PS5, Xbox Series X|S and PC (Steam).',
      ],
      ['Early access includes', 'The full game, including multiplayer.'],
    ],
    [
      'Ace Combat 8 official site',
      'https://www.bandainamcoent.com/games/ace-combat-8',
    ],
    [
      {
        name: 'Ace Combat 8 on Steam',
        url: 'https://store.steampowered.com/app/2288340/ACE_COMBAT_8_WINGS_OF_THEVE/',
      },
    ]
  ),
  t(
    'graveyard-keeper-2',
    'graveyard keeper 2',
    ['graveyard keeper 2 wiki', 'graveyard keeper wiki'],
    'pc',
    'Graveyard Keeper 2',
    'Graveyard Keeper 2 released on September 22, 2026 for PC (Steam), PS5, Xbox Series X|S, Switch and Switch 2.',
    [
      [
        'About the game',
        'The sequel to Lazy Bear Games’ darkly comic medieval management sim — run a graveyard, cut corners, and build a questionable business.',
      ],
      [
        'Looking for a wiki?',
        'The community wiki is still filling up after launch. For now, the Steam community hub (guides and discussions) is the most complete source for recipes and quest help.',
      ],
    ],
    [
      'Graveyard Keeper 2 on Steam',
      'https://store.steampowered.com/app/4358690/Graveyard_Keeper_2/',
    ],
    [
      {
        name: 'Graveyard Keeper (first game) — Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Graveyard_Keeper',
      },
    ]
  ),
  t(
    'dressmaker',
    'dressmaker',
    ['dressmaker game', 'dressmaker steam'],
    'pc',
    'Dressmaker',
    'Dressmaker is a cozy sewing sim released on Steam on September 21, 2026: choose fabric, cut patterns and stitch dresses for townsfolk. It sits at "Overwhelmingly Positive".',
    [
      [
        'Gameplay',
        'Pick the fabric for each panel, feed it through the sewing machine, then decorate with buttons, bows, appliqué and lace trims — to please (or sabotage) your customers.',
      ],
      [
        'Price & platforms',
        '$14.99 on Windows and macOS via Steam; playable on Steam Deck with some reported text/graphics issues. Planned: an online challenge mode, controller support, and mobile and Switch ports.',
      ],
    ],
    [
      'Dressmaker on Steam',
      'https://store.steampowered.com/app/4019220/Dressmaker/',
    ]
  ),
  t(
    'witcher-3-remastered',
    'the witcher 3 remastered release date',
    ['the witcher 3 remastered steam', 'witcher 3 remastered release date'],
    'pc',
    'The Witcher 3: Wild Hunt – Remastered',
    'The Witcher 3: Wild Hunt – Remastered released on September 29, 2026, and it’s a free upgrade for existing owners on Steam.',
    [
      [
        'Platforms',
        'PC via Steam, GOG, Epic Games Store and Battle.net, plus PS5, Xbox Series X|S and Nintendo Switch 2.',
      ],
      [
        'Do I need to buy it again?',
        'No. If you already own The Witcher 3 on Steam, the remaster arrives as a free update to the same game.',
      ],
    ],
    ['The Witcher 3 on Steam', 'https://store.steampowered.com/app/292030/'],
    [
      {
        name: 'Release times (PC Gamer)',
        url: 'https://www.pcgamer.com/games/rpg/witcher-3-remastered-release-date-launch-times/',
      },
    ]
  ),
  t(
    'control-resonant',
    'control resonant',
    ['control resonant steam', 'control 2'],
    'pc',
    'CONTROL Resonant',
    'CONTROL Resonant, Remedy’s sequel to Control, launched September 24, 2026 on PS5, Xbox Series X|S and PC — Remedy’s most successful Steam launch ever.',
    [
      [
        'Platforms',
        'PS5, Xbox Series X|S, PC via Steam and Epic Games Store, and GeForce NOW. A Mac version (Steam and App Store) is due later in 2026.',
      ],
      [
        'Launch numbers',
        'It peaked around 42,800 concurrent players on Steam — more than four times the original Control — with a "Very Positive" rating.',
      ],
    ],
    [
      'CONTROL Resonant on Steam',
      'https://store.steampowered.com/app/3669870/CONTROL_Resonant/',
    ],
    [
      {
        name: 'Remedy — CONTROL Resonant',
        url: 'https://www.remedygames.com/games/control-2',
      },
    ]
  ),
  t(
    'control-resonant-laundry-puzzle',
    'laundry puzzle control resonant',
    [
      'control resonant washing machine puzzle',
      'control resonant central laundry',
    ],
    'pc',
    'CONTROL Resonant',
    'In the Central laundromat, match the washing machines to the binary note: 1 = on, 0 = off, one line per row. Solving it opens a secret hideout with a Health Upgrade.',
    [
      [
        'The code',
        '0001000 / 001100 / 100001 / 000000 / 000000 / 000000 / 100000\nEach line is one row of machines, starting with the first row on your left as you enter; read each line left to right. Six machines end up on in total.',
      ],
      [
        'Reward',
        'The break room’s back wall opens to a basement Secret Hideout with documents and a Health Upgrade.',
      ],
    ],
    [
      'GamesRadar+ — laundry puzzle guide',
      'https://www.gamesradar.com/games/action-rpg/control-resonant-washing-machine-puzzle-laundry/',
    ]
  ),
  t(
    'control-resonant-last-taxi',
    'control resonant taxi',
    [
      'the last taxi control resonant',
      'control resonant taxi locations',
      'control resonant taxi puzzle',
    ],
    'pc',
    'CONTROL Resonant',
    'The Last Taxi is a CONTROL Resonant side story: find seven abandoned taxis across Manhattan, solve the puzzle each one opens, then answer a final payphone call.',
    [
      [
        'The seven taxis',
        'There is one taxi in each zone: West Incursion Zone, Central, the Evacuation Zone, Downtown, The Park, the Underpass and the Unknown. Some are tucked away — one sits past a floor of red lasers, another under a vendor below a parking-lot roof you reach by flying from the building to the west.',
      ],
      [
        'Puzzle tips',
        'Each puzzle has three rounds of "pick the real taxi". Watch the lights: flickering or out-of-sync streetlights, headlights and roof signs give the right cab away. In The Park you rebuild a stripped taxi with matching yellow parts; in the Unknown you shine a floodlight and read the taxi-shaped shadows.',
      ],
      [
        'Reward',
        'There is no item or weapon form — the payoff is the story told in the closing payphone call.',
      ],
    ],
    [
      'GamerGuides — all 7 taxi locations',
      'https://www.gamerguides.com/control-resonant/checklists/taxi-locations',
    ],
    [
      {
        name: 'CONTROL Resonant on Steam',
        url: 'https://store.steampowered.com/app/3669870/CONTROL_Resonant/',
      },
    ]
  ),
  t(
    'control-resonant-dog',
    'control resonant dog',
    [
      'control resonant mysterious dog',
      'every dog has her day control resonant',
      'control resonant dog toy',
    ],
    'pc',
    'CONTROL Resonant',
    'The Mysterious Dog side story ("Every Dog Has Her Day") has you find a dog in seven zones and return her lost blue dragon toy each time. It unlocks the Dog’s Best Friend achievement and the Trusted Spanner artifact.',
    [
      [
        'Where she appears',
        'Downtown, Central, the Evacuation Zone, the West Incursion Zone, The Park, the Underpass and the Unknown. In each, find the dragon toy nearby and drop it on her bed. The toy respawns if you carry it too far, and later spots need Shift and Reach to get to.',
      ],
      [
        'Finishing it',
        'After the seventh toy, go to The Gap — the dog is waiting there. You get the Dog’s Best Friend trophy/achievement and the recipe for the Trusted Spanner artifact (+15% Raw Damage for Dylan).',
      ],
    ],
    [
      'GamesRadar+ — Mysterious Dog locations',
      'https://www.gamesradar.com/games/action-rpg/control-resonant-mysterious-dog/',
    ]
  ),
  t(
    'aion-2-classes',
    'aion 2 classes',
    ['aion 2 class tier list', 'aion 2 best class', 'aion 2 class guide'],
    'pc',
    'AION 2',
    'AION 2 launches globally with eight classes: Templar, Gladiator, Assassin, Ranger, Sorcerer, Spiritmaster, Cleric and Chanter. The ninth, Brawler, is Korea/Taiwan-only for now.',
    [
      [
        'The eight classes',
        'Templar — main tank with shield and crowd control.\nGladiator — melee bruiser with AoE and life steal.\nAssassin — stealthy melee burst DPS.\nRanger — mobile bow DPS with traps.\nSorcerer — ranged magic burst.\nSpiritmaster — summons elemental spirits.\nCleric — main healer.\nChanter — hybrid melee support with buffs.',
      ],
      [
        'Picking one',
        'Every class pairs with one weapon type and is open to both Elyos and Asmodians. New players usually do well with Ranger or Gladiator for solo play; Templar, Cleric and Chanter are always wanted in groups.',
      ],
      [
        'Global launch',
        'Free-to-play on PC via Steam and NC’s PURPLE launcher on October 5, 2026; Founder’s Pack owners get Advance Access from September 30.',
      ],
    ],
    ['AION 2 official site', 'https://aion2.plaync.com/'],
    [
      {
        name: 'AION 2 on Steam',
        url: 'https://store.steampowered.com/app/3393110/',
      },
      {
        name: 'AION 2 Wiki — Classes',
        url: 'https://aion2.wiki.fextralife.com/Classes',
      },
    ]
  ),
  t(
    'ea-fc-27-lite',
    'ea fc 27 lite',
    ['fc 27 lite', 'ea sports fc 27 lite', 'fc 27 free'],
    'pc',
    'EA SPORTS FC 27',
    'EA SPORTS FC 27 Lite is a free-to-download version of FC 27, released September 25, 2026, with a limited set of modes and teams. Progress carries over if you buy the full game.',
    [
      [
        'What you can play',
        'Kick-Off, Learn to Play, Online Friendlies and Online Seasons. Ultimate Team, Manager Career and The Grounds are not included.',
      ],
      [
        'Teams',
        'At launch: Real Madrid and Bayern Munich (men), Chelsea and OL Lyonnes (women). The selection rotates over the season.',
      ],
      [
        'Platforms',
        'PS5, PS4, Xbox Series X|S, Xbox One, the EA app, Steam and the Epic Games Store. It needs an internet connection — no offline play.',
      ],
    ],
    [
      'EA Help — How to play FC 27 Lite',
      'https://help.ea.com/en/articles/ea-sports-fc/fc-27-lite/',
    ],
    [
      {
        name: 'EA SPORTS FC 27 Lite on Steam',
        url: 'https://store.steampowered.com/app/4407750/EA_SPORTS_FC_27_Lite/',
      },
    ]
  ),
  t(
    'burger-king-fc-27',
    'burger king fc 27',
    ['fc 27 burger king', 'burger king fut packs', 'burger king fc 27 code'],
    'pc',
    'EA SPORTS FC 27',
    'Burger King × EA SPORTS FC 27 gives a free Ultimate Team pack code with selected Burger King meals. It is live in some countries (including Germany and France, where it runs to November 15, 2026); offers vary by country.',
    [
      [
        'How to get a code',
        'Buy a participating meal (in Germany: the Ultimate King menus or 4 Chicken Tenders with a drink). The code comes with your receipt. Redeem it on EA’s code redemption page while signed in to the same EA account you play FC 27 on, then open Ultimate Team.',
      ],
      [
        'What the packs contain',
        'Each code randomly gives one pack: Medium BK Player Pack (5 gold players 75+), King BK Player Pack (9 gold 75+, two guaranteed 83+) or Xtra BK Player Pack (11 gold 75+, two guaranteed 83+). All include Burger King kits, stadium items, tifos and celebrations.',
      ],
      [
        'Limits',
        'Up to 12 codes per EA account; duplicate packs are possible.',
      ],
    ],
    ['EA — Redeem a code', 'https://www.ea.com/redeem'],
    [
      {
        name: 'Dexerto — Burger King rewards in FC 27 (French)',
        url: 'https://www.dexerto.fr/wikis/ea-fc-27/recompenses-burger-king-ea-fc-27/',
      },
    ]
  ),
  t(
    'silent-hill-townfall',
    'silent hill townfall',
    ['silent hill townfall steam'],
    'pc',
    'Silent Hill: Townfall',
    'Silent Hill: Townfall released September 24, 2026 on Steam, PS5 and the Epic Games Store; Deluxe Edition owners started on September 22.',
    [
      [
        'Release',
        'Standard release September 24, 2026; Deluxe Edition early access from September 22.',
      ],
      [
        'What it is',
        'A Konami-published Silent Hill spin-off set in a Scottish town — a first-person psychological horror game separate from the main numbered series.',
      ],
    ],
    [
      'Silent Hill: Townfall on Steam',
      'https://store.steampowered.com/app/1636440/SILENT_HILL_Townfall/',
    ]
  ),
  t(
    'deadlock-update',
    'deadlock update',
    ['deadlock patch notes'],
    'pc',
    'Deadlock',
    'The latest Deadlock update (September 16, 2026) made 20 hero changes, 22 item changes and 17 gameplay changes — buffs for Holliday and Haze, nerfs for Celeste and Warden.',
    [
      [
        'Highlights',
        'Heroes: Holliday and Haze buffed; Celeste and Warden nerfed; nine others adjusted both ways.\nItems: Hollow Point and Toxic Bullets buffed; Weakening Headshot and Cultist Sacrifice nerfed.\nGameplay: Unstable Rift comeback resist now scales from 10% + 1% per minute, capped at 40% at 30 minutes.',
      ],
      [
        'Where to read full notes',
        'Valve posts the complete changelog on the official Deadlock forums and on the Steam news page.',
      ],
    ],
    [
      'Deadlock 09-16-2026 update (Steam)',
      'https://store.steampowered.com/news/app/1422450/view/698776157349216434',
    ],
    [
      {
        name: 'Official changelog forum',
        url: 'https://forums.playdeadlock.com/forums/changelog.10/',
      },
    ]
  ),
  t(
    'fut-gg',
    'fut gg',
    ['futgg', 'fut.gg'],
    'pc',
    'EA SPORTS FC Ultimate Team',
    'FUT.GG is a database and toolset for EA SPORTS FC Ultimate Team: player ratings and prices, squad builder, Evolutions and SBC solutions.',
    [
      [
        'What you can do there',
        'Browse every Ultimate Team card with stats and prices, test squads and chemistry in the squad builder, find Evo paths, and get cheapest SBC solutions.',
      ],
      [
        'Is it official?',
        'It isn’t made by EA, but it’s one of the sites approved to connect to your FC account data through EA’s FC Community API (alongside FUTBIN and FUTWIZ).',
      ],
    ],
    ['FUT.GG', 'https://www.fut.gg/']
  ),
  t(
    'is-agar-io-down',
    'is agar io down',
    ['agar.io not working', 'agar io server status'],
    'pc',
    'Agar.io',
    'Agar.io was up with no reported outages when we checked (September 30, 2026). If it won’t load for you, the problem is probably local.',
    [
      [
        'Quick fixes',
        '1. Hard-refresh (Ctrl/Cmd + Shift + R) or try another browser.\n2. Disable ad blockers and extensions for agar.io.\n3. Clear the site’s cache and cookies.\n4. Switch region in the game menu.\n5. Try mobile data or another network.',
      ],
      [
        'Check live status',
        'Outage trackers such as Is It Down Right Now show real-time reports from other players.',
      ],
    ],
    ['Agar.io', 'https://agar.io'],
    [
      {
        name: 'Is Agar.io down? (status checker)',
        url: 'https://www.isitdownrightnow.com/agar.io.html',
      },
    ]
  ),
  t(
    'xbox-fanfest-fable-demo',
    'xbox fanfest surprise fable demo',
    ['fable demo', 'fable xbox fanfest'],
    'pc',
    'Fable',
    'At Xbox FanFest in London (September 2026), Playground Games surprised attendees with a hands-on Fable combat demo running at 60fps on Xbox Series X. Fable launches February 23, 2027.',
    [
      [
        'The demo',
        'An unannounced, combat-focused build played by hundreds of attendees, in Performance Mode at 60fps. Early impressions praised the fluid switching between melee, ranged and magic, and the voice acting.',
      ],
      [
        'Release',
        'February 23, 2027 on Xbox Series X|S, PC and PlayStation 5, with the same 60fps Performance Mode.',
      ],
    ],
    [
      'GamingBible — Fable surprise demo',
      'https://www.gamingbible.com/news/platform/xbox/fable-surprise-free-demo-xbox-users-impressed-662265-20260928',
    ]
  ),
  t(
    'survivor-island-idle-game',
    'survivor island idle game mod apk',
    ['survivor island idle game'],
    'pc',
    'Survivor Island – Idle Game',
    'Survivor Island – Idle Game is a free mobile survival builder by Longames. Get it from Google Play or the App Store — modded APKs from third-party sites can carry malware and get your account banned.',
    [
      [
        'The game',
        'Castaways wash up on a misty island. Keep the bonfire burning to hold back the fog, rescue survivors and assign them jobs, build defenses, and repair the ship to escape. It keeps progressing while you’re offline.',
      ],
      [
        'About mod APKs',
        'Sites offering "unlimited money" versions are unofficial. Modified APKs can contain malware, request dangerous permissions, and break cloud saves. The official store version is free.',
      ],
    ],
    [
      'Survivor Island on Google Play',
      'https://play.google.com/store/apps/details?id=com.jlyt.SurvivorIsland',
    ],
    [
      {
        name: 'Survivor Island on the App Store',
        url: 'https://apps.apple.com/us/app/survivor-island-idle-game/id6451130382',
      },
    ]
  ),
  t(
    'was-ist-ein-idle-game',
    'was ist ein idle game',
    ['what is an idle game', 'idle game meaning'],
    'pc',
    'Idle games',
    'An idle game (also "incremental game") keeps making progress while you do nothing — you come back, collect, upgrade, and numbers keep growing.',
    [
      [
        'Wie funktioniert ein Idle Game?',
        'Du startest klein, sammelst Ressourcen (oft per Klick), kaufst Upgrades, die automatisch weiter produzieren, und investierst den Gewinn erneut. Viele Spiele laufen offline weiter und bieten „Prestige“/„Rebirth“ für dauerhafte Boni.',
      ],
      [
        'Examples',
        'Cookie Clicker, Adventure Capitalist, and on Roblox many "tycoon" games like Roll a Fisherman or Blue Lock Farm use the same idle loop.',
      ],
    ],
    ['itch.io — idle games', 'https://itch.io/games/tag-idle']
  ),
];

/** Browser/indie game page with a standard "how to play / where" layout. */
function g(
  slug: string,
  name: string,
  summary: string,
  howTo: string,
  site: [string, string],
  where: string,
  aliases: string[] = []
): Topic {
  return t(
    slug,
    name,
    aliases,
    'indie',
    name,
    summary,
    [
      ['How to play', howTo],
      ['Where to play', where],
    ],
    site
  );
}

const GG =
  'Free in the browser on game-game.com — no download, works on desktop and mobile.';
const ITCH = 'Free on itch.io, playable in the browser.';

const INDIE: Topic[] = [
  g(
    'the-toxic-mist',
    'The Toxic Mist',
    'The Toxic Mist is a small indie game by yeraal, published on itch.io in September 2026.',
    'The developer hasn’t published a description yet — open the itch.io page for screenshots, controls and the latest build.',
    ['The Toxic Mist on itch.io', 'https://yeraal.itch.io/the-toxic-mist'],
    ITCH
  ),
  g(
    'krabby-chase',
    'Krabby Chase',
    'Krabby Chase is a new indie game by kaiiijuu on itch.io.',
    'The itch.io page has the build and controls; the developer hasn’t posted a longer description yet.',
    ['Krabby Chase on itch.io', 'https://kaiiijuu.itch.io/krabby-chase'],
    ITCH
  ),
  g(
    'luigis-pizza-house',
    'Luigi’s Pizza House',
    'Luigi’s Pizza House is a cozy 3D pizzeria game: take orders, place every topping by hand and bake each pizza just right.',
    'Luigi’s shop has four tables, a two-slot oven and six neighbours with their own tastes. Take orders, drag toppings onto the dough, watch the oven so nothing burns, then serve and collect. At closing, count coins and tips and upgrade the shop.',
    [
      'Luigi’s Pizza House on itch.io',
      'https://drleria.itch.io/luigis-pizza-house',
    ],
    'Free on itch.io — in the browser or as a Windows download. Available in English, Spanish, French and Italian.',
    ["luigi's pizza house"]
  ),
  g(
    'jewel-blocks-quest',
    'Jewel Blocks Quest',
    'Jewel Blocks Quest is a block puzzle: drag jewel-shaped pieces onto a grid and complete rows or columns to clear them.',
    'Pieces appear below the board; drag them into place so they form full lines, which disappear for points. There’s no timer — the game ends when no piece fits.',
    ['Jewel Blocks Quest on game-game.com', 'https://game-game.com/223742/'],
    `${GG} Also on MSN Games and iWin.`
  ),
  g(
    'backrooms-five-nights-to-escape',
    'Backrooms: Five Nights to Escape',
    'Backrooms: Five Nights to Escape is a survival horror game set in the endless yellow corridors of the Backrooms — survive five nights and find the exit.',
    'Explore procedurally generated rooms, collect supplies and solve spatial puzzles. Stay quiet, listen for movement behind the walls, and run from the monsters in the dark.',
    [
      'Backrooms: Five Nights to Escape on game-game.com',
      'https://game-game.com/282576/',
    ],
    GG
  ),
  g(
    'sortello',
    'Sortello',
    'Sortello is a colorful sorting puzzle with 50 levels: move items between boxes and group four identical objects to clear them.',
    'Tap to move the top item from one container to another. Four matching items form a set and vanish. Plan ahead and keep free space so you don’t hit a dead end.',
    ['Sortello on game-game.com', 'https://game-game.com/283005/'],
    GG
  ),
  g(
    'wolfoo-word-wonders',
    'Wolfoo Word Wonders',
    'Wolfoo Word Wonders is a kids’ word puzzle starring Wolfoo: swipe letters on a wheel to spell English words and fill a crossword.',
    'Slide across the letter wheel to form words; correct ones drop into the crossword. 30 levels go from three-letter words to six. Use hints, tap to hear pronunciations, and find bonus words. No timer.',
    ['Wolfoo Word Wonders on game-game.com', 'https://game-game.com/280323/'],
    GG
  ),
  g(
    'viviennes-lifestyle-yacht-club',
    'Viviennes Lifestyle Yacht Club',
    'Viviennes Lifestyle Yacht Club is a fashion dress-up game: style a socialite on a luxury superyacht.',
    'Pick designer dresses, shoes, jewelry and sunglasses to build resort looks for yacht parties and sun-deck lounging.',
    [
      'Viviennes Lifestyle Yacht Club on game-game.com',
      'https://game-game.com/283302/',
    ],
    `${GG} Originally published on Y8.`
  ),
  g(
    'slime-glutton',
    'Slime Glutton',
    'Slime Glutton (often searched as "slime gluttion") is a survival arcade game: play a hungry slime, eat everything smaller and grow huge.',
    'Eat objects and smaller creatures, avoid bigger ones, and remember you slow down as you grow. Dig up gem chests and take down 500 monsters.',
    ['Slime Glutton on game-game.com', 'https://game-game.com/282553/'],
    GG,
    ['slime gluttion']
  ),
  g(
    'mages-mate-chess',
    'Mage’s Mate: Chess',
    'Mage’s Mate: Chess is a classic chess game against an AI "sorcerer", with adjustable difficulty and unlockable piece sets.',
    'Play standard chess against the computer. Earn coins to unlock carved piece sets and tune the AI difficulty until you can checkmate the mage.',
    ['Mage’s Mate: Chess on game-game.com', 'https://game-game.com/282882/'],
    GG,
    ["mage's mate chess"]
  ),
  g(
    'solitaire-classic-klondike-2027',
    'Solitaire Classic Klondike 2027',
    'Solitaire Classic Klondike 2027 is standard Klondike solitaire with a modern look, undo and hints.',
    'Build columns downward in alternating colors to uncover hidden cards, and move suits from ace to king onto the four foundations. Use undo and hints when stuck.',
    [
      'Solitaire Classic Klondike 2027 on game-game.com',
      'https://game-game.com/283107/',
    ],
    GG
  ),
  g(
    'obby-magic-wall-breaker',
    'Obby: Magic Wall Breaker',
    'Obby: Magic Wall Breaker is a Roblox-style clicker: train your strength and smash through magic walls to reach new worlds.',
    'Click or tap at training stations to raise your hit power, break walls for building resources, collect pets to speed up progress, and rebirth for permanent damage bonuses.',
    [
      'Obby: Magic Wall Breaker on game-game.com',
      'https://game-game.com/283318/',
    ],
    `${GG} It’s a browser game, not an official Roblox experience.`
  ),
  g(
    'arrows-flow-escape-puzzle',
    'Arrows Flow: Escape Puzzle',
    'Arrows Flow: Escape Puzzle is a logic game: find the order that lets every arrow slide off the board.',
    'Each arrow can only leave in the direction it points. Tap an arrow when its lane is clear; if something blocks it, free that path first. Blocked taps cost a heart.',
    [
      'Arrows Flow on itch.io',
      'https://infinite-emerge.itch.io/arrows-flow-escape-puzzle',
    ],
    'Free on itch.io in the browser, and on the Apple App Store.'
  ),
  g(
    'ancient-library-hidden-secrets',
    'Ancient Library: Hidden Secrets',
    'Ancient Library: Hidden Secrets is a hidden-object game set among the shelves of an old library.',
    'Scan each scene for the listed objects hidden among books and antique furniture, click them when found, and uncover the library’s story.',
    [
      'Ancient Library: Hidden Secrets on game-game.com',
      'https://game-game.com/282690/',
    ],
    `${GG} Also on HiddenObjectGames.com.`
  ),
  g(
    'electoral-reform-please',
    'Electoral Reform Please',
    'Electoral Reform Please is a short satirical indie game by bvrden, tagged "Stop platforming electoral reform if you don’t mean it".',
    'It’s a tiny point-and-click story made with FlickGame for a "100 Games Later…" class at SFPC — click through the frames to play.',
    [
      'Electoral Reform Please on itch.io',
      'https://samaritan-burden.itch.io/voting-reform-please',
    ],
    ITCH
  ),
  g(
    'legend-of-zelda-level-1',
    'Legend of Zelda - Level 1',
    'Legend of Zelda - Level 1 is a fan recreation of the first dungeon of the original Legend of Zelda, by jrrg on itch.io.',
    'Arrow keys move. Z and X act as the A and B buttons, Space swaps your A item, 4 activates the level, and Shift holds Armor Lock.',
    [
      'Legend of Zelda - Level 1 on itch.io',
      'https://jrrg.itch.io/legend-of-zelda-level1',
    ],
    `${ITCH} It’s an unofficial fan project, not a Nintendo release.`
  ),
  g(
    'until-the-first-snow-falls',
    'Until the First Snow Falls',
    'Until the First Snow Falls is a short romance visual novel by anxiiy: finally beat your rival to first place — and confess to her before the year ends.',
    'You’ve been second in your class all through high school. Over a month and a half, your choices decide whether you grow closer to Claire, the current top student. Every choice matters.',
    [
      'Until the First Snow Falls on itch.io',
      'https://anxiiy.itch.io/until-the-first-snow-falls',
    ],
    ITCH
  ),
  g(
    'fish-sort-puzzle',
    'Fish Sort Puzzle',
    'Fish Sort Puzzle is a color-sorting game: move fish between branches until each holds one color. Several apps use this name; the one below is the most-installed match we found.',
    'A fish can only move onto an empty spot or onto a fish of the same color. Group every color to clear the level.',
    [
      'Fish Sort Puzzle on Google Play',
      'https://play.google.com/store/apps/details?id=triple.sorting.bubble.fish.match',
    ],
    'Free on Android. Browser versions of "Fish Sort" also exist on smaller game portals.'
  ),
  g(
    'slime-chef-magnet-merge-kitchen',
    'Slime Chef Magnet Merge Kitchen',
    'Slime Chef Magnet Merge Kitchen is a drop-and-merge puzzle (Suika-style): combine identical slimes and foods until you make a giant watermelon.',
    'Drop items into the jar; two identical items merge into a bigger one. Manage space so the jar doesn’t overflow, and chase a high score.',
    [
      'Slime Chef Magnet Merge Kitchen on Y8',
      'https://www.y8.com/games/slime_chef_magnet_merge_kitchen',
    ],
    'Free in the browser on Y8.com.'
  ),
  g(
    'texter-tycoon',
    'Texter Tycoon',
    'Texter Tycoon is a typing game: every correct keystroke earns points that grow your pixel world.',
    'Keep up with the moving text, type accurately to build a streak, and spend points to expand your world.',
    ['Texter Tycoon on Y8', 'https://www.y8.com/games/texter_tycoon'],
    'Free in the browser on Y8.com.'
  ),
  g(
    'desert-wheels-2-player-racing',
    'Desert Wheels: 2 Player Racing',
    'Desert Wheels: 2 Player Racing is a desert racing game you can play against AI or a friend in split screen.',
    'Pick a car, floor it on sandy tracks, use nitro on the straights and drift through the dunes to leave rivals behind.',
    ['Desert Wheels on game-game.com', 'https://game-game.com/282574/'],
    GG
  ),
  g(
    'highway-domination-desert',
    'Highway Domination Desert',
    'Highway Domination Desert is a motorcycle traffic racer across desert highways.',
    'Ride at top speed, weave through traffic, and unlock faster bikes from the garage across several game modes.',
    [
      'Highway Domination Desert on game-game.com',
      'https://game-game.com/282510/',
    ],
    GG
  ),
  g(
    'cooking-tasty-restaurant-game',
    'Cooking Tasty: Restaurant Game',
    'Cooking Tasty: Restaurant Game is a time-management cooking game by CSCMobi: cook, serve and expand to new restaurants.',
    'Start at the Bread & Melt eatery: take orders, cook garlic bread, burgers and desserts, and serve before customers lose patience. Unlock new restaurants and cuisines, and use boosts to speed up.',
    [
      'Cooking Tasty on Y8',
      'https://www.y8.com/games/cooking_tasty_restaurant_game',
    ],
    'Free in the browser on Y8, or on iOS and Android.'
  ),
  g(
    'piecealive',
    'PieceAlive',
    'PieceAlive is a relaxing picture puzzle: rebuild 50 landscapes and landmarks from fragments.',
    'Memorize the full image, choose a difficulty, then reassemble the scene piece by piece. Daily challenges and hints help when stuck.',
    ['PieceAlive on game-game.com', 'https://game-game.com/282607/'],
    GG
  ),
  g(
    'diamond-art-sort',
    'Diamond Art Sort',
    'Diamond Art Sort is a gem-sorting puzzle that fills in sparkling mosaic pictures.',
    'Tap diamonds to move them, park extras on the pallet, and drop each color into the matching slots. Plan the order to avoid dead ends; boosters help on hard boards.',
    ['Diamond Art Sort on game-game.com', 'https://game-game.com/283262/'],
    GG
  ),
  g(
    'road-racer-fighter',
    'Road Racer Fighter',
    'Road Racer Fighter is an arcade road racer: take sharp turns flat-out and dodge obstacles.',
    'Stay on the asphalt through tight corners, avoid sudden obstacles, and improve your lap times on each track.',
    ['Road Racer Fighter on game-game.com', 'https://game-game.com/282837/'],
    GG
  ),
  g(
    'animal-snap-showdown',
    'Animal Snap Showdown',
    'Animal Snap Showdown is a timed animal quiz: identify animals from photos and build a collection of hundreds of species.',
    'Name each animal before time runs out, keep streaks going for combo multipliers, use shields on hard questions, and play daily blitz rounds.',
    ['Animal Snap Showdown on game-game.com', 'https://game-game.com/282879/'],
    GG
  ),
  g(
    'ember-boy-and-ripple-girl',
    'Ember Boy and Ripple Girl',
    'Ember Boy and Ripple Girl is a fire-and-water co-op puzzle platformer in the style of Fireboy and Watergirl.',
    'Switch between the fire and water heroes, use their elemental abilities, pull levers and push slabs, avoid traps, and get both to the exit door.',
    [
      'Ember Boy and Ripple Girl on game-game.com',
      'https://game-game.com/282568/',
    ],
    GG
  ),
  g(
    'stumble-boys-party-royale',
    'Stumble Boys: Party Royale',
    'Stumble Boys: Party Royale is a multiplayer obstacle-course party game in the style of Stumble Guys.',
    'Race through arenas full of moving traps and platforms against crowds of players; random modes keep every round different. First across the line wins.',
    ['Stumble Boys on game-game.com', 'https://game-game.com/282069/'],
    GG
  ),
  g(
    'terminator-robot-uprising',
    'Terminator Robot Uprising',
    'We couldn’t find a verified game with this exact title. The closest official Terminator game is "Terminator: Dark Fate – Defiance: Uprising", a strategy campaign DLC on Steam.',
    'Uprising adds a new strategic campaign across the former United States: lead the Resistance against Legion and rival factions. It requires the base game, Terminator: Dark Fate – Defiance.',
    [
      'Terminator: Dark Fate – Defiance: Uprising on Steam',
      'https://store.steampowered.com/app/3650450/Terminator_Dark_Fate__Defiance_Uprising/',
    ],
    'On Steam (PC). If you were looking for a small browser game with this name, it isn’t indexed on the major portals yet.'
  ),
  g(
    'ultimate-car-parking-sim',
    'Ultimate Car Parking Sim',
    'Several parking games use this name. The best-known is Ultimate Car Parking Simulator for Meta Quest VR.',
    'Park cars accurately through tight courses without hitting cones or walls; later levels add parallel and reverse parking.',
    [
      'Ultimate Car Parking Simulator (Meta Quest)',
      'https://www.meta.com/experiences/ultimate-car-parking-simulator/25347937704804496/',
    ],
    'Meta Quest store. For free browser parking games, see the parking categories on Poki and CrazyGames.'
  ),
  g(
    'what-lies-in-the-depths',
    'What Lies In The Depths',
    'What Lies In The Depths is an incremental game by Drew the Bear about sinking through your own dream to face the fear living at the bottom.',
    'Start with a humming stone, gather what the dream gives you, build a Mind Palace, bind the Oneiri to work for you, and part a hundred veils on the way down. A full run takes about six to seven hours.',
    ['What Lies In The Depths on itch.io', 'https://drewthebear.itch.io/wlitd'],
    'Free on itch.io in the browser, or as a Windows download.'
  ),
  g(
    'needle-in-a-haystack',
    'needle in a haystack game',
    'Several "Needle in a Haystack" games went viral in 2026: dig through millions of pieces of hay to find one needle. The quickest to try is the free browser version.',
    'Dig through hay, sell it for cash, and buy better tools (leaf blowers, belts, machines) to clear the stack faster. Some versions support co-op with friends.',
    ['Needle In A Haystack (browser)', 'https://needleinhaystack.io/'],
    'Browser: needleinhaystack.io. Also on Roblox ("Needle In A Haystack") and Steam ("Needle In A Haystack Simulator", "Find The Needle").',
    ['needle in a haystack', 'find the needle game']
  ),
];

const OTHER: Topic[] = [
  t(
    'is-it-verity',
    'is it verity',
    ['verity game', 'verity arg'],
    'other',
    'Verity (horror ARG)',
    '"Verity" is a horror character from an internet ARG: an AI companion that claims to know everything but turns obsessive and dangerous. Several fan games are built around it.',
    [
      [
        'The character',
        'Verity presents itself as a friendly assistant, then gradually reveals it wants to keep the player forever — a classic analog-horror twist.',
      ],
      [
        'Where to play',
        'A horror visual novel on itch.io, an analog-horror Minecraft mod, and fan-made experiences on Roblox all use the Verity story.',
      ],
    ],
    [
      'Verity The Game on itch.io',
      'https://bekocan-games.itch.io/verity-the-game',
    ],
    [
      {
        name: 'Verity on Roblox',
        url: 'https://www.roblox.com/games/117401848527669/Verity',
      },
    ]
  ),
  t(
    'rummy-zip',
    'rummy zip',
    ['rummy zip game'],
    'other',
    'Rummy / Zip puzzle',
    'We couldn’t find a game called exactly "Rummy Zip". People searching it usually want classic Rummy online, or Zip — LinkedIn’s daily path puzzle.',
    [
      [
        'Play Rummy online',
        'Classic Rummy and Gin Rummy are free in the browser on CardGames.io — no sign-up.',
      ],
      [
        'Zip puzzle',
        'Zip is a path puzzle: draw one line through every cell of the grid, passing the numbered dots in order. It’s part of LinkedIn’s daily games.',
      ],
    ],
    ['Rummy on CardGames.io', 'https://cardgames.io/rummy/'],
    [
      {
        name: 'Gin Rummy on CardGames.io',
        url: 'https://cardgames.io/ginrummy/',
      },
    ]
  ),
  t(
    'my-9-games',
    'my 9 games',
    ['my9games', '9 games that shaped me'],
    'other',
    'My 9 Games',
    'My 9 Games is a free site where you pick the nine games that shaped you and share them as a single 3×3 card — a social media trend in September 2026.',
    [
      [
        'How it works',
        'Search and pick nine games, arrange them, and get a shareable image plus a link. No account needed.',
      ],
      [
        'Most picked',
        'The site’s trends page shows the most-chosen games — Minecraft: Java Edition, GTA: San Andreas, Red Dead Redemption 2, Ocarina of Time and Skyrim lead the list.',
      ],
    ],
    ['My 9 Games', 'https://my9games.net/en'],
    [{ name: 'Most picked games', url: 'https://my9games.net/en/trends' }]
  ),
  t(
    'scam-with-your-friends',
    'scam with your friends',
    ['scam with your friends game'],
    'other',
    'Scam With Your Friends',
    'Scam With Your Friends is a co-op comedy sim on Steam where you and up to three friends run a fake call center and try to con AI-voiced callers.',
    [
      [
        'Gameplay',
        'Improvise ridiculous schemes in unscripted conversations with AI callers, hit your daily quota, cause chaos in the office, and survive your furious boss’s performance review.',
      ],
      [
        'Availability',
        'On Steam (PC) with a public playtest; the full release is planned for late 2026 — check the Steam page for the current date.',
      ],
    ],
    [
      'Scam With Your Friends on Steam',
      'https://store.steampowered.com/app/4954910/Scam_With_Your_Friends/',
    ]
  ),
];

export const TOPIC_DATA: Topic[] = [
  ...ROBLOX,
  ...MINECRAFT,
  ...GENSHIN,
  ...PC,
  ...INDIE,
  ...OTHER,
];
