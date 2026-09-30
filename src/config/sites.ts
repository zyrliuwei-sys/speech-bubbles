/**
 * Static catalog for the v1 game navigation directory.
 *
 * Each entry is an external site; cards link straight out. Move this into a
 * custom table + module once submissions go live.
 */

export type Localized = { en: string; zh: string };

export type CategorySlug =
  | 'web-games'
  | 'io'
  | 'puzzle'
  | 'stores'
  | 'cloud'
  | 'guides'
  | 'news'
  | 'mods'
  | 'deals'
  | 'tools';

export type SiteBadge = 'hot' | 'new' | 'free';

export interface Site {
  slug: string;
  name: string;
  url: string;
  category: CategorySlug;
  badge?: SiteBadge;
  tagline: Localized;
}

export interface Category {
  slug: CategorySlug;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { slug: 'web-games', emoji: '🕹️' },
  { slug: 'io', emoji: '🌐' },
  { slug: 'puzzle', emoji: '🧩' },
  { slug: 'stores', emoji: '🛒' },
  { slug: 'cloud', emoji: '☁️' },
  { slug: 'guides', emoji: '📖' },
  { slug: 'news', emoji: '📰' },
  { slug: 'mods', emoji: '🧰' },
  { slug: 'deals', emoji: '💸' },
  { slug: 'tools', emoji: '🛠️' },
];

type Row = [
  slug: string,
  name: string,
  url: string,
  category: CategorySlug,
  en: string,
  zh: string,
  badge?: SiteBadge,
];

const ROWS: Row[] = [
  // Web game portals
  [
    'poki',
    'Poki',
    'https://poki.com',
    'web-games',
    'Thousands of free browser games, no downloads',
    '上千款免费网页游戏，无需下载',
    'hot',
  ],
  [
    'crazygames',
    'CrazyGames',
    'https://www.crazygames.com',
    'web-games',
    'Free online games that run in your browser',
    '直接在浏览器里玩的免费在线游戏',
    'hot',
  ],
  [
    'itch-io',
    'itch.io',
    'https://itch.io',
    'web-games',
    'Indie games from independent creators',
    '独立开发者的独立游戏平台',
  ],
  [
    '4399',
    '4399',
    'https://www.4399.com',
    'web-games',
    'Classic Chinese mini-game portal',
    '经典国内小游戏网站',
  ],
  [
    '7k7k',
    '7k7k',
    'https://www.7k7k.com',
    'web-games',
    'Free Chinese web mini-games',
    '免费国内网页小游戏',
  ],
  [
    'armor-games',
    'Armor Games',
    'https://armorgames.com',
    'web-games',
    'Hand-picked free web games since 2004',
    '2004 年起精选的免费网页游戏',
  ],
  [
    'newgrounds',
    'Newgrounds',
    'https://www.newgrounds.com',
    'web-games',
    'Community games, animation and art',
    '社区自制游戏、动画与美术',
  ],
  [
    'kongregate',
    'Kongregate',
    'https://www.kongregate.com',
    'web-games',
    'Browser games with achievements',
    '带成就系统的网页游戏',
  ],

  // .io games
  [
    'slither-io',
    'Slither.io',
    'https://slither.io',
    'io',
    'Grow the longest snake in the arena',
    '在竞技场里长成最长的蛇',
    'free',
  ],
  [
    'agar-io',
    'Agar.io',
    'https://agar.io',
    'io',
    'Eat or be eaten — the original .io game',
    '吃或被吃——最早的 .io 游戏',
    'free',
  ],
  [
    'diep-io',
    'Diep.io',
    'https://diep.io',
    'io',
    'Upgrade your tank and rule the arena',
    '升级坦克，称霸竞技场',
    'free',
  ],
  [
    'krunker',
    'Krunker',
    'https://krunker.io',
    'io',
    'Fast pixel FPS in the browser',
    '浏览器里的高速像素 FPS',
    'hot',
  ],
  [
    'shell-shockers',
    'Shell Shockers',
    'https://shellshock.io',
    'io',
    'Egg-themed multiplayer shooter',
    '鸡蛋主题的多人射击',
    'free',
  ],
  [
    'paper-io',
    'Paper.io 2',
    'https://paper-io.com',
    'io',
    'Claim territory, don’t get cut',
    '圈地占领，小心被切断',
    'free',
  ],
  [
    'zombs-royale',
    'ZombsRoyale.io',
    'https://zombsroyale.io',
    'io',
    '2D battle royale for 100 players',
    '100 人 2D 大逃杀',
    'free',
  ],
  [
    'smash-karts',
    'Smash Karts',
    'https://smashkarts.io',
    'io',
    'Multiplayer kart battles with weapons',
    '带武器的多人卡丁车对战',
    'new',
  ],
  [
    'bloxd-io',
    'Bloxd.io',
    'https://bloxd.io',
    'io',
    'Blocky multiplayer minigames',
    '方块风多人小游戏合集',
    'new',
  ],

  // Puzzle & board
  [
    'play-2048',
    '2048',
    'https://play2048.co',
    'puzzle',
    'Slide tiles and merge to 2048',
    '滑动方块，合并出 2048',
    'free',
  ],
  [
    'wordle',
    'Wordle',
    'https://www.nytimes.com/games/wordle/index.html',
    'puzzle',
    'Guess the five-letter word in six tries',
    '六次机会猜出五个字母的单词',
    'hot',
  ],
  [
    'sudoku-com',
    'Sudoku.com',
    'https://sudoku.com',
    'puzzle',
    'Classic sudoku at every difficulty',
    '各种难度的经典数独',
    'free',
  ],
  [
    'lichess',
    'Lichess',
    'https://lichess.org',
    'puzzle',
    'Free, open-source chess with no ads',
    '免费、开源、无广告的国际象棋',
    'free',
  ],
  [
    'chess-com',
    'Chess.com',
    'https://www.chess.com',
    'puzzle',
    'Play chess online and learn',
    '在线下棋与学习',
  ],
  [
    'geoguessr',
    'GeoGuessr',
    'https://www.geoguessr.com',
    'puzzle',
    'Guess where you are from Street View',
    '根据街景猜出你在哪里',
  ],
  [
    'jigsaw-explorer',
    'Jigsaw Explorer',
    'https://www.jigsawexplorer.com',
    'puzzle',
    'Online jigsaw puzzles',
    '在线拼图',
  ],

  // Stores
  [
    'steam',
    'Steam',
    'https://store.steampowered.com',
    'stores',
    'The biggest PC game store',
    '最大的 PC 游戏商店',
    'hot',
  ],
  [
    'epic-games-store',
    'Epic Games Store',
    'https://store.epicgames.com',
    'stores',
    'PC store with weekly free games',
    '每周送免费游戏的 PC 商店',
    'free',
  ],
  [
    'gog',
    'GOG',
    'https://www.gog.com',
    'stores',
    'DRM-free games and classics',
    '无 DRM 的游戏与经典老游戏',
  ],
  [
    'playstation-store',
    'PlayStation Store',
    'https://store.playstation.com',
    'stores',
    'Games for PS5 and PS4',
    'PS5 与 PS4 游戏',
  ],
  [
    'nintendo-store',
    'Nintendo Store',
    'https://www.nintendo.com/store/',
    'stores',
    'Games for Nintendo Switch',
    'Nintendo Switch 游戏',
  ],
  [
    'xbox-store',
    'Xbox Store',
    'https://www.xbox.com/en-US/games/all-games',
    'stores',
    'Games for Xbox and PC',
    'Xbox 与 PC 游戏',
  ],
  [
    'humble-bundle',
    'Humble Bundle',
    'https://www.humblebundle.com',
    'stores',
    'Game bundles that support charity',
    '支持慈善的游戏包',
  ],

  // Cloud gaming
  [
    'geforce-now',
    'GeForce NOW',
    'https://www.nvidia.com/en-us/geforce-now/',
    'cloud',
    'Stream your PC games from the cloud',
    '从云端串流你的 PC 游戏',
  ],
  [
    'xbox-cloud',
    'Xbox Cloud Gaming',
    'https://www.xbox.com/play',
    'cloud',
    'Play Game Pass titles in the browser',
    '在浏览器里玩 Game Pass 游戏',
  ],
  [
    'boosteroid',
    'Boosteroid',
    'https://boosteroid.com',
    'cloud',
    'Cloud gaming on any device',
    '任何设备都能玩的云游戏',
  ],

  // Guides & wikis
  [
    'fandom',
    'Fandom',
    'https://www.fandom.com',
    'guides',
    'Community wikis for almost every game',
    '几乎覆盖所有游戏的社区 Wiki',
    'hot',
  ],
  [
    'gamefaqs',
    'GameFAQs',
    'https://gamefaqs.gamespot.com',
    'guides',
    'Walkthroughs, FAQs and cheats',
    '攻略、问答与秘籍',
  ],
  [
    'ign-wikis',
    'IGN Wikis',
    'https://www.ign.com/wikis',
    'guides',
    'Guides and walkthroughs from IGN',
    'IGN 的游戏攻略与流程',
  ],
  [
    'wowhead',
    'Wowhead',
    'https://www.wowhead.com',
    'guides',
    'World of Warcraft database and guides',
    '魔兽世界数据库与攻略',
  ],
  [
    'minecraft-wiki',
    'Minecraft Wiki',
    'https://minecraft.wiki',
    'guides',
    'The community Minecraft encyclopedia',
    '社区维护的 Minecraft 百科',
  ],
  [
    'nga',
    'NGA 玩家社区',
    'https://bbs.nga.cn',
    'guides',
    'Chinese gamer forums and guides',
    '国内玩家论坛与攻略',
  ],

  // News
  [
    'ign',
    'IGN',
    'https://www.ign.com',
    'news',
    'Game news, reviews and videos',
    '游戏新闻、评测与视频',
  ],
  [
    'gamespot',
    'GameSpot',
    'https://www.gamespot.com',
    'news',
    'Reviews, news and trailers',
    '评测、新闻与预告片',
  ],
  [
    'polygon',
    'Polygon',
    'https://www.polygon.com',
    'news',
    'Gaming and entertainment journalism',
    '游戏与娱乐报道',
  ],
  [
    'eurogamer',
    'Eurogamer',
    'https://www.eurogamer.net',
    'news',
    'European games news and reviews',
    '欧洲游戏新闻与评测',
  ],
  [
    'gamersky',
    '游民星空',
    'https://www.gamersky.com',
    'news',
    'Chinese game news and guides',
    '国内游戏资讯与攻略',
  ],
  [
    '3dmgame',
    '3DM',
    'https://www.3dmgame.com',
    'news',
    'Chinese PC game news',
    '国内单机游戏资讯',
  ],
  [
    'gcores',
    '机核',
    'https://www.gcores.com',
    'news',
    'Chinese game culture, podcasts and articles',
    '国内游戏文化、播客与文章',
  ],

  // Mods
  [
    'nexus-mods',
    'Nexus Mods',
    'https://www.nexusmods.com',
    'mods',
    'The largest PC game mod site',
    '最大的 PC 游戏 Mod 站',
    'hot',
  ],
  [
    'curseforge',
    'CurseForge',
    'https://www.curseforge.com',
    'mods',
    'Mods for Minecraft, WoW and more',
    'Minecraft、魔兽等游戏的 Mod',
  ],
  [
    'moddb',
    'Mod DB',
    'https://www.moddb.com',
    'mods',
    'Mods, maps and total conversions',
    'Mod、地图与大型改版',
  ],
  [
    'steam-workshop',
    'Steam Workshop',
    'https://steamcommunity.com/workshop/',
    'mods',
    'Community content for Steam games',
    'Steam 游戏的社区创意内容',
  ],

  // Deals
  [
    'isthereanydeal',
    'IsThereAnyDeal',
    'https://isthereanydeal.com',
    'deals',
    'Compare PC game prices across stores',
    '比较各商店的 PC 游戏价格',
  ],
  [
    'gg-deals',
    'GG.deals',
    'https://gg.deals',
    'deals',
    'Game deals and price history',
    '游戏折扣与历史价格',
  ],
  [
    'steamdb',
    'SteamDB',
    'https://steamdb.info',
    'deals',
    'Steam sales, prices and charts',
    'Steam 折扣、价格与数据图表',
    'hot',
  ],

  // Tools
  [
    'howlongtobeat',
    'HowLongToBeat',
    'https://howlongtobeat.com',
    'tools',
    'How long it takes to finish a game',
    '通关一款游戏需要多久',
  ],
  [
    'protondb',
    'ProtonDB',
    'https://www.protondb.com',
    'tools',
    'Linux & Steam Deck compatibility reports',
    'Linux 与 Steam Deck 兼容性报告',
  ],
  [
    'opencritic',
    'OpenCritic',
    'https://opencritic.com',
    'tools',
    'Aggregated game review scores',
    '游戏评测评分汇总',
  ],
  [
    'backloggd',
    'Backloggd',
    'https://www.backloggd.com',
    'tools',
    'Track and rate the games you play',
    '记录和评分你玩过的游戏',
  ],
];

export const SITES: Site[] = ROWS.map(
  ([slug, name, url, category, en, zh, badge]) => ({
    slug,
    name,
    url,
    category,
    badge,
    tagline: { en, zh },
  })
);

export function getSite(slug: string): Site | undefined {
  return SITES.find((s) => s.slug === slug);
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORIES.some((c) => c.slug === slug);
}

/** "https://www.poki.com/en" → "poki.com" */
export function siteDomain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}
