import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ============================================
// SUPABASE KONFIGURACE
// ============================================
const SUPABASE_URL = 'https://bmmaijlbpwgzhrxzxphf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// GLOBÁLNÍ PROMĚNNÉ
// ============================================
let hasSeenUpdateModal = false;
let currentGame = 'slot';
let currentBet = 10;
let spinning = false;
let wheelSpinning = false;
let autoRotating = true;
let rotation = 0;
let reels = [[], [], []];

let currentUser = {
    id: null,
    nickname: '',
    coins: 0,
    lastDailyBonus: null,
    ownedThemes: ['default'],
    activeTheme: 'default',
    stats: {
        totalWins: 0,
        slotSpins: 0,
        wheelSpins: 0,
        jackpots: 0,
        winStreak: 0,
        currentStreak: 0,
        totalBet: 0,
        maxCoins: 0,
        themesOwned: 1,
        diamondWins: 0,
        loginStreak: 1,
        lastLogin: null,
        highBets: 0,
        achievementsUnlocked: 0,
        coinsWon: 0,
        gamesPlayed: [],
        cherryWins: 0,
        bellWins: 0,
        starWins: 0,
        dailyBonusClaims: 0,
        missionsCompleted: 0,
        bigWins: 0,
        totalSpins: 0,
        dailyWins: 0,
        noLossStreak: 0,
        fastSpins: 0,
        maxBets: 0
    },
    unlockedAchievements: [],
    dailyMissions: {},
    lastMissionReset: null
};

// ============================================
// SHOP ITEMS
// ============================================
const shopItems = [
    { id: 'default', name: '🎰 Výchozí', price: 0, icon: '🎰', colors: { 
        primary: '#00ffff', secondary: '#ff00ff', bg1: '#0a0015', bg2: '#1a0033',
        bgGlow1: 'rgba(255,0,255,0.4)', bgGlow2: 'rgba(0,255,255,0.4)'
    }},
    { id: 'neon', name: '💠 Neon', price: 500, icon: '💠', colors: { 
        primary: '#00ffff', secondary: '#ff00ff', bg1: '#000033', bg2: '#330066',
        bgGlow1: 'rgba(0,255,255,0.5)', bgGlow2: 'rgba(255,0,255,0.5)'
    }},
    { id: 'gold', name: '🌟 Zlatý', price: 1000, icon: '🌟', colors: { 
        primary: '#ffd700', secondary: '#ffaa00', bg1: '#1a1000', bg2: '#332200',
        bgGlow1: 'rgba(255,215,0,0.4)', bgGlow2: 'rgba(255,170,0,0.4)'
    }},
    { id: 'fire', name: '🔥 Ohnivý', price: 1500, icon: '🔥', colors: { 
        primary: '#ff4500', secondary: '#ff8c00', bg1: '#1a0000', bg2: '#330000',
        bgGlow1: 'rgba(255,69,0,0.5)', bgGlow2: 'rgba(255,140,0,0.5)'
    }},
    { id: 'ocean', name: '🌊 Oceán', price: 2000, icon: '🌊', colors: { 
        primary: '#0080ff', secondary: '#00ffff', bg1: '#00001a', bg2: '#001a33',
        bgGlow1: 'rgba(0,128,255,0.4)', bgGlow2: 'rgba(0,255,255,0.4)'
    }},
    { id: 'rainbow', name: '🌈 Duha', price: 3000, icon: '🌈', colors: { 
        primary: '#ff00ff', secondary: '#00ff00', bg1: '#1a001a', bg2: '#330033',
        bgGlow1: 'rgba(255,0,255,0.5)', bgGlow2: 'rgba(0,255,0,0.5)'
    }},
    { id: 'emerald', name: '💚 Smaragd', price: 3500, icon: '💚', colors: { 
        primary: '#00ff88', secondary: '#00cc66', bg1: '#001a0a', bg2: '#003320',
        bgGlow1: 'rgba(0,255,136,0.4)', bgGlow2: 'rgba(0,204,102,0.4)'
    }},
    { id: 'royal', name: '👑 Královský', price: 4000, icon: '👑', colors: { 
        primary: '#9400d3', secondary: '#ffd700', bg1: '#0a001a', bg2: '#200033',
        bgGlow1: 'rgba(148,0,211,0.5)', bgGlow2: 'rgba(255,215,0,0.4)'
    }},
    { id: 'toxic', name: '☢️ Toxický', price: 4500, icon: '☢️', colors: { 
        primary: '#39ff14', secondary: '#ccff00', bg1: '#0a1a00', bg2: '#1a3300',
        bgGlow1: 'rgba(57,255,20,0.5)', bgGlow2: 'rgba(204,255,0,0.4)'
    }},
    { id: 'sunset', name: '🌅 Západ slunce', price: 5000, icon: '🌅', colors: { 
        primary: '#ff6b35', secondary: '#ff8c42', bg1: '#1a0a00', bg2: '#331400',
        bgGlow1: 'rgba(255,107,53,0.4)', bgGlow2: 'rgba(255,140,66,0.4)'
    }},
    { id: 'ice', name: '❄️ Ledový', price: 5500, icon: '❄️', colors: { 
        primary: '#00d9ff', secondary: '#a3e4f7', bg1: '#000a1a', bg2: '#001433',
        bgGlow1: 'rgba(0,217,255,0.4)', bgGlow2: 'rgba(163,228,247,0.3)'
    }},
    { id: 'vampire', name: '🧛 Upíří', price: 6000, icon: '🧛', colors: { 
        primary: '#8b0000', secondary: '#dc143c', bg1: '#0a0000', bg2: '#1a0000',
        bgGlow1: 'rgba(139,0,0,0.5)', bgGlow2: 'rgba(220,20,60,0.4)'
    }},
    { id: 'matrix', name: '💻 Matrix', price: 6500, icon: '💻', colors: { 
        primary: '#00ff00', secondary: '#008800', bg1: '#000a00', bg2: '#001400',
        bgGlow1: 'rgba(0,255,0,0.4)', bgGlow2: 'rgba(0,136,0,0.3)'
    }},
    { id: 'galaxy', name: '🌌 Galaxie', price: 7000, icon: '🌌', colors: { 
        primary: '#4b0082', secondary: '#9370db', bg1: '#050008', bg2: '#0a0010',
        bgGlow1: 'rgba(75,0,130,0.5)', bgGlow2: 'rgba(147,112,219,0.4)'
    }},
    { id: 'cherry', name: '🍒 Třešeň', price: 7500, icon: '🍒', colors: { 
        primary: '#ff1493', secondary: '#ff69b4', bg1: '#1a0010', bg2: '#330020',
        bgGlow1: 'rgba(255,20,147,0.4)', bgGlow2: 'rgba(255,105,180,0.3)'
    }},
    { id: 'cyber', name: '🤖 Cyber', price: 8000, icon: '🤖', colors: { 
        primary: '#00ffff', secondary: '#ff00ff', bg1: '#000000', bg2: '#0a0a0a',
        bgGlow1: 'rgba(0,255,255,0.6)', bgGlow2: 'rgba(255,0,255,0.6)'
    }},
    { id: 'diamond', name: '💎 Diamant', price: 9000, icon: '💎', colors: { 
        primary: '#b9f2ff', secondary: '#ffffff', bg1: '#0a0a1a', bg2: '#14143a',
        bgGlow1: 'rgba(185,242,255,0.4)', bgGlow2: 'rgba(255,255,255,0.3)'
    }},
    { id: 'lava', name: '🌋 Láva', price: 10000, icon: '🌋', colors: { 
        primary: '#ff4500', secondary: '#ff0000', bg1: '#1a0000', bg2: '#330000',
        bgGlow1: 'rgba(255,69,0,0.6)', bgGlow2: 'rgba(255,0,0,0.5)'
    }},
    { id: 'mint', name: '🍃 Mátový', price: 11000, icon: '🍃', colors: { 
        primary: '#98ff98', secondary: '#3cb371', bg1: '#001a0a', bg2: '#003314',
        bgGlow1: 'rgba(152,255,152,0.4)', bgGlow2: 'rgba(60,179,113,0.3)'
    }},
    { id: 'lightning', name: '⚡ Blesk', price: 12000, icon: '⚡', colors: { 
        primary: '#ffff00', secondary: '#ffa500', bg1: '#1a1a00', bg2: '#333300',
        bgGlow1: 'rgba(255,255,0,0.5)', bgGlow2: 'rgba(255,165,0,0.4)'
    }},
    { id: 'legend', name: '🏆 Legendární', price: 15000, icon: '🏆', colors: { 
        primary: '#ffd700', secondary: '#ff1493', bg1: '#1a0a00', bg2: '#331400',
        bgGlow1: 'rgba(255,215,0,0.6)', bgGlow2: 'rgba(255,20,147,0.5)'
    }}
];

// ============================================
// ACHIEVEMENTS
// ============================================
const achievements = [
    { id: 'first_win', name: 'První výhra! 🎉', desc: 'Vyhrát na automatu poprvé', icon: '🎉', reward: 50,
        condition: (stats) => stats.totalWins >= 1 },
    { id: 'slot_master', name: 'Mistr automatů', desc: 'Zatočit 100x na automatu', icon: '🎰', reward: 200,
        condition: (stats) => stats.slotSpins >= 100 },
    { id: 'jackpot_king', name: 'Jackpot král 👑', desc: 'Vyhrát jackpot (50x)', icon: '👑', reward: 500,
        condition: (stats) => stats.jackpots >= 1 },
    { id: 'wheel_spinner', name: 'Točitel kola', desc: 'Zatočit 50x na kole štěstí', icon: '🎡', reward: 150,
        condition: (stats) => stats.wheelSpins >= 50 },
    { id: 'lucky_streak', name: 'Šťastná série 🍀', desc: '5 výher za sebou', icon: '🍀', reward: 300,
        condition: (stats) => stats.winStreak >= 5 },
    { id: 'big_spender', name: 'Velký sázející', desc: 'Vsadit celkem 5000 mincí', icon: '💸', reward: 250,
        condition: (stats) => stats.totalBet >= 5000 },
    { id: 'millionaire', name: 'Milionář 💰', desc: 'Mít 10000 mincí najednou', icon: '💰', reward: 1000,
        condition: (stats) => stats.maxCoins >= 10000 },
    { id: 'collector', name: 'Sběratel vzhledů 🎨', desc: 'Vlastnit 5 vzhledů', icon: '🎨', reward: 400,
        condition: (stats) => stats.themesOwned >= 5 },
    { id: 'diamond_hunter', name: 'Lovec diamantů', desc: 'Vyhrát 3x s 💎💎💎', icon: '💎', reward: 600,
        condition: (stats) => stats.diamondWins >= 3 },
    { id: 'dedicated', name: 'Oddaný hráč 🔥', desc: 'Přihlásit se 7 dní v řadě', icon: '🔥', reward: 500,
        condition: (stats) => stats.loginStreak >= 7 },
    { id: 'high_roller', name: 'High Roller', desc: 'Vsadit 100 mincí najednou 10x', icon: '🎲', reward: 350,
        condition: (stats) => stats.highBets >= 10 },
    { id: 'spin_addict', name: 'Závislák na točení 🌀', desc: 'Zatočit celkem 500x', icon: '🌀', reward: 400,
        condition: (stats) => (stats.slotSpins + stats.wheelSpins) >= 500 },
    { id: 'cherry_lover', name: 'Milovník třešní 🍒', desc: 'Vyhrát 10x s třešněmi', icon: '🍒', reward: 300,
        condition: (stats) => stats.cherryWins >= 10 },
    { id: 'bell_ringer', name: 'Zvoník 🔔', desc: 'Vyhrát 5x se zvonky', icon: '🔔', reward: 350,
        condition: (stats) => stats.bellWins >= 5 },
    { id: 'star_catcher', name: 'Lovec hvězd ⭐', desc: 'Vyhrát 8x s hvězdami', icon: '⭐', reward: 450,
        condition: (stats) => stats.starWins >= 8 },
    { id: 'risk_taker', name: 'Riskující 🎯', desc: 'Vsadit maximální sázku 50x', icon: '🎯', reward: 500,
        condition: (stats) => stats.maxBets >= 50 },
    { id: 'quick_winner', name: 'Rychlá výhra ⚡', desc: 'Vyhrát do 5 zatočení', icon: '⚡', reward: 200,
        condition: (stats) => stats.quickWins >= 1 },
    { id: 'theme_collector', name: 'Sběratel témat 🎨', desc: 'Vlastnit 10 vzhledů', icon: '🎨', reward: 800,
        condition: (stats) => stats.themesOwned >= 10 },
    { id: 'daily_player', name: 'Denní hráč 📅', desc: 'Vyzvednout denní bonus 30x', icon: '📅', reward: 600,
        condition: (stats) => stats.dailyBonusClaims >= 30 },
    { id: 'mission_master', name: 'Mistr úkolů ✅', desc: 'Splnit 50 denních úkolů', icon: '✅', reward: 700,
        condition: (stats) => stats.missionsCompleted >= 50 },
    { id: 'legend', name: 'Legenda 🏆', desc: 'Dosáhnout všech ostatních úspěchů', icon: '🏆', reward: 2000,
        condition: (stats) => stats.achievementsUnlocked >= 20 },  // <-- Čárka přidána
    { id: 'lucky_winner', name: 'Šťastný vítěz 🍀', desc: 'Vyhrát poprvé s 3 stejné symboly', icon: '🍀', reward: 100,
        condition: (stats) => stats.sameSymbolsWins >= 1 },
    { id: 'big_earning', name: 'Velký výdělek 💸', desc: 'Vyhrát celkem 5000 mincí', icon: '💸', reward: 400,
        condition: (stats) => stats.coinsWon >= 5000 },
    { id: 'gambler', name: 'Hráč hazardu 🎲', desc: 'Vsadit celkem 10000 mincí', icon: '🎲', reward: 500,
        condition: (stats) => stats.totalBet >= 10000 },
    { id: 'speed_spin', name: 'Rychlý točitel ⚡', desc: 'Zatočit 100x za den', icon: '⚡', reward: 350,
        condition: (stats) => stats.totalSpinsToday >= 100 },
    { id: 'jackpot_win_2', name: 'Mega jackpot 🎰', desc: 'Vyhrát 2x jackpot', icon: '🎰', reward: 1000,
        condition: (stats) => stats.jackpotWins >= 2 },
    { id: 'long_streak', name: 'Dlouhá série 🔥', desc: '5 výher za sebou bez prohry', icon: '🔥', reward: 400,
        condition: (stats) => stats.winStreak >= 5 && stats.noLossStreak >= 5 },
    { id: 'bet_10000', name: 'High Roller 10K 💰', desc: 'Vsadit celkem 10000 mincí najednou', icon: '💰', reward: 600,
        condition: (stats) => stats.maxBets >= 10000 },
    { id: 'multi_game_player', name: 'Mnohostranný hráč 🎮', desc: 'Zahrát 3 různé hry', icon: '🎮', reward: 250,
        condition: (stats) => stats.gamesPlayed >= 3 },
    { id: 'diamond_luxury', name: 'Diamantový luxus 💎', desc: 'Vyhrát 5x s diamanty 💎💎💎', icon: '💎', reward: 800,
        condition: (stats) => stats.diamondWins >= 5 },
    { id: 'ultimate_bet', name: 'Ultimate sázka 🎯', desc: 'Vsadit maximální sázku 100x', icon: '🎯', reward: 700,
        condition: (stats) => stats.maxBets >= 100 },
    { id: 'fast_spin_5', name: 'Super rychlé točení ⚡', desc: 'Zatočit 5x za 1 minutu', icon: '⚡', reward: 300,
        condition: (stats) => stats.fastSpins >= 5 },
    { id: 'collector_gold', name: 'Zlatý sběratel 🪙', desc: 'Mít alespoň 5000 mincí', icon: '🪙', reward: 450,
        condition: (stats) => stats.totalCoins >= 5000 },
    { id: 'spinner_pro', name: 'Profík na točení 🎰', desc: 'Zatočit 200x na automatu', icon: '🎰', reward: 600,
        condition: (stats) => stats.slotSpins >= 200 },
    { id: 'poker_face', name: 'Poker Face 🃏', desc: 'Vyhrát bez prohry 20x', icon: '🃏', reward: 700,
        condition: (stats) => stats.noLossStreak >= 20 },
    { id: 'big_bet_500', name: 'Velká sázka 500 🤑', desc: 'Vsadit 500 mincí najednou 5x', icon: '🤑', reward: 500,
        condition: (stats) => stats.highBets >= 5 },
    { id: 'lucky_day', name: 'Šťastný den 🌞', desc: 'Vyhrát 10x během dne', icon: '🌞', reward: 450,
        condition: (stats) => stats.dailyWins >= 10 },
    { id: 'extreme_bet', name: 'Extrémní sázející 🎯', desc: 'Vsadit maximální sázku 200x', icon: '🎯', reward: 1000,
        condition: (stats) => stats.maxBets >= 200 },
    { id: 'slot_master_2', name: 'Mistr automatů II 🎰', desc: 'Zatočit 500x na automatu', icon: '🎰', reward: 1000,
        condition: (stats) => stats.slotSpins >= 500 },
    { id: 'ultimate_collector', name: 'Nejlepší sběratel 🎨', desc: 'Vlastnit všechny vzhledy', icon: '🎨', reward: 1500,
        condition: (stats) => stats.themesOwned >= 20 }
];

// ============================================
// DAILY MISSIONS
// ============================================
const dailyMissions = [
    { id: 'spin_10', name: '🎰 Desetinásobný točitel', desc: 'Zatočit 10x na automatu', icon: '🎰',
        reward: 50, target: 10, type: 'slotSpins' },
    { id: 'wheel_5', name: '🎡 Kolo štěstí', desc: 'Zatočit 5x na kole štěstí', icon: '🎡',
        reward: 40, target: 5, type: 'wheelSpins' },
    { id: 'win_500', name: '💰 Denní zisk', desc: 'Vyhrát celkem 500 mincí', icon: '💰',
        reward: 100, target: 500, type: 'coinsWon' },
    { id: 'big_win', name: '⭐ Velká výhra', desc: 'Vyhrát 10x sázku najednou', icon: '⭐',
        reward: 75, target: 1, type: 'bigWins' },
    { id: 'play_both', name: '🎮 Všestranný hráč', desc: 'Zahrát si automat i kolo', icon: '🎮',
        reward: 60, target: 2, type: 'gamesPlayed' },
    { id: 'spin_25', name: '🔄 Točící se válce', desc: 'Zatočit celkem 25x', icon: '🔄',
        reward: 80, target: 25, type: 'totalSpins' },
    { id: 'win_3', name: '🎉 Třikrát šťastný', desc: 'Vyhrát 3x za sebou', icon: '🎉',
        reward: 90, target: 3, type: 'winStreak' },
    { id: 'bet_500', name: '💸 Odvážný sázející', desc: 'Vsadit celkem 500 mincí', icon: '💸',
        reward: 70, target: 500, type: 'totalBet' },
    { id: 'jackpot_hunt', name: '🎰 Hon na jackpot', desc: 'Zatočit s maximální sázkou 5x', icon: '🎰',
        reward: 100, target: 5, type: 'maxBets' },
    { id: 'lucky_7', name: '🍀 Šťastná sedmička', desc: 'Vyhrát právě 7x dnes', icon: '🍀',
        reward: 120, target: 7, type: 'dailyWins' },
    { id: 'no_loss_10', name: '🛡️ Neporažitelný', desc: '10 zatočení bez prohry', icon: '🛡️',
        reward: 150, target: 10, type: 'noLossStreak' },
    { id: 'diamond_day', name: '💎 Diamantový den', desc: 'Vyhrát jednou s 💎💎💎', icon: '💎',
        reward: 200, target: 1, type: 'diamondWins' },
    { id: 'early_bird', name: '🐦 Ranní ptáče', desc: 'Vyzvednout denní bonus', icon: '🐦',
        reward: 50, target: 1, type: 'dailyBonus' },
    { id: 'coin_collector', name: '🪙 Sběratel mincí', desc: 'Mít alespoň 1000 mincí', icon: '🪙',
        reward: 100, target: 1000, type: 'totalCoins' },
    { id: 'speed_spinner', name: '⚡ Rychlý točitel', desc: 'Zatočit 15x za 5 minut', icon: '⚡',
        reward: 130, target: 15, type: 'fastSpins' },  // <-- OPRAVENÁ ČÁRKA
    { id: 'win_1000', name: '💰 Král mincí', desc: 'Vyhrát celkem 1000 mincí', icon: '💰',
        reward: 150, target: 1000, type: 'coinsWon' },
    { id: 'play_3_games', name: '🎮 Hraní 3 her', desc: 'Zahrát 3 různé hry', icon: '🎮',
        reward: 50, target: 3, type: 'gamesPlayed' },
    { id: 'double_win', name: '🌟 Dvojitá výhra', desc: 'Vyhrát 2x za sebou', icon: '🌟',
        reward: 80, target: 2, type: 'winStreak' },
    { id: 'spin_50', name: '🔄 Mega točitel', desc: 'Zatočit celkem 50x', icon: '🔄',
        reward: 150, target: 50, type: 'totalSpins' },
    { id: 'bet_1000', name: '💸 Velký sázkař', desc: 'Vsadit celkem 1000 mincí', icon: '💸',
        reward: 120, target: 1000, type: 'totalBet' },
    { id: 'jackpot_spin', name: '🎰 Sázka na jackpot', desc: 'Zatočit s max. sázkou', icon: '🎰',
        reward: 200, target: 1, type: 'maxBets' },
    { id: 'win_2x_in_row', name: '🍀 Šťastná dvojka', desc: 'Vyhrát 2x po sobě', icon: '🍀',
        reward: 70, target: 2, type: 'dailyWins' },
    { id: 'no_loss_5', name: '🛡️ Bez prohry', desc: '5 zatočení bez prohry', icon: '🛡️',
        reward: 90, target: 5, type: 'noLossStreak' },
    { id: 'lucky_10', name: '🍀 Šťastných 10', desc: 'Vyhrát právě 10x dnes', icon: '🍀',
        reward: 100, target: 10, type: 'dailyWins' },
    { id: 'bet_2000', name: '💸 Mega sázející', desc: 'Vsadit celkem 2000 mincí', icon: '💸',
        reward: 150, target: 2000, type: 'totalBet' },
    { id: 'spin_100', name: '🔄 Super točitel', desc: 'Zatočit celkem 100x', icon: '🔄',
        reward: 250, target: 100, type: 'totalSpins' },
    { id: 'spin_200', name: '🔄 Kralující točitel', desc: 'Zatočit celkem 200x', icon: '🔄',
        reward: 300, target: 200, type: 'totalSpins' },
    { id: 'fast_bet', name: '⚡ Rychlá sázka', desc: 'Vsadit 100 mincí za 1 minutu', icon: '⚡',
        reward: 150, target: 100, type: 'fastBets' },
    { id: 'play_4_games', name: '🎮 Herní maraton', desc: 'Zahrát 4 různé hry', icon: '🎮',
        reward: 120, target: 4, type: 'gamesPlayed' },
    { id: 'jackpot_win', name: '🎰 Jackpotová výhra', desc: 'Vyhrát jackpot', icon: '🎰',
        reward: 500, target: 1, type: 'jackpotWins' }
];

// ============================================
// SLOT MACHINE KONFIGURACE
// ============================================
const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '🎰'];
const symbolWeights = {
    '🍒': 25, '🍋': 20, '🍊': 18, '🍇': 15,
    '🔔': 10, '⭐': 7, '💎': 4, '🎰': 1
};
const winMultipliers = {
    '🍒': 5, '🍋': 4, '🍊': 6, '🍇': 8,
    '🔔': 10, '⭐': 15, '💎': 20, '🎰': 50
};

// ============================================
// WHEEL OF FORTUNE KONFIGURACE
// ============================================
const wheelPrizes = [
    { coins: 0, color: '#666666', weight: 50 },
    { coins: 5, color: '#ff0080', weight: 20 },
    { coins: 15, color: '#00ff80', weight: 15 },
    { coins: 25, color: '#0080ff', weight: 10 },
    { coins: 50, color: '#ff8000', weight: 4 },
    { coins: 100, color: '#ffff00', weight: 1 }
];

// ============================================
// UPDATE MODAL
// ============================================
function showUpdateModal() {
    if (!hasSeenUpdateModal) {
        setTimeout(() => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'updateModalContainer';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="modal-content">
                    <h2>🎉 NOVÁ AKTUALIZACE! 🎉</h2>
                    <div style="color: #fff; font-size: 18px; text-align: left; margin: 20px 0;">
                        <p style="margin: 10px 0;">✨ <strong>Nové funkce:</strong></p>
                        <ul style="margin-left: 20px; line-height: 1.8;">
                            <li>🎰 Výhry i se 2 stejnými symboly!</li>
                            <li>🏆 20+ nových úspěchů</li>
                            <li>📋 15 denních úkolů</li>
                            <li>🎨 Vylepšené téma mění celou hru</li>
                            <li>💰 Denní bonus 300 mincí každých 12h</li>
                        </ul>
                        <p style="margin: 15px 0; font-size: 16px; color: #00ffaa; text-align: center; padding: 10px; background: rgba(0,255,170,0.1); border-radius: 10px;">
                            🎮 Hra je 100% ZDARMA, bez mikrotransakcí<br>
                            👶 Vhodné pro hráče od 10 let
                        </p>
                    </div>
                    <button class="modal-close" onclick="closeUpdateModal()">SUPER! ZAČNĚME HRÁT! 🎰</button>
                </div>
            `;
            document.body.appendChild(modal);
        }, 3500);
    }
}

window.closeUpdateModal = function() {
    hasSeenUpdateModal = true;
    const modal = document.getElementById('updateModalContainer');
    if (modal) modal.remove();
};

// ============================================
// LOADING SCREEN
// ============================================
function startLoading() {
    const loadingTime = 3000 + Math.random() * 3000;
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    
    const loadingMessages = [
        'Připravuji herní automaty...',
        'Generuji výherní symboly...',
        'Načítám kolo štěstí...',
        'Kontroluji žetony...',
        'Inicializuji jackpot...',
        'Připravuji casino stoly...',
        'Téměř hotovo...'
    ];
    
    let progress = 0;
    const interval = 50;
    const steps = loadingTime / interval;
    const progressStep = 100 / steps;
    
    const loadingInterval = setInterval(() => {
        progress += progressStep;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
        }
        
        loadingBar.style.width = progress + '%';
        
        if (Math.random() < 0.1) {
            loadingText.textContent = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
        }
    }, interval);
    
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        loadingBar.style.width = '0%';
        loadingText.textContent = 'Připravuji herní automaty...';
    }, loadingTime);
}

// ============================================
// HVĚZDY NA POZADÍ
// ============================================
function createStars() {
    for(let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        document.body.appendChild(star);
    }
}

// ============================================
// SLOT MACHINE - INICIALIZACE REELS
// ============================================
function initReels() {
    for (let i = 0; i < 3; i++) {
        const reel = document.getElementById(`reel${i + 1}`);
        if (!reel) continue;
        
        reel.innerHTML = '';
        reels[i] = [];
        
        for (let j = 0; j < 100; j++) {
            const symbol = getWeightedSymbol();
            reels[i].push(symbol);
            
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'symbol';
            symbolDiv.textContent = symbol;
            reel.appendChild(symbolDiv);
        }
    }
}

function getWeightedSymbol() {
    const totalWeight = Object.values(symbolWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [symbol, weight] of Object.entries(symbolWeights)) {
        random -= weight;
        if (random <= 0) return symbol;
    }
    return '🍒';
}

window.spinSlot = async function() {
    if (spinning) return;
    if (currentUser.coins < currentBet) {
        alert('Nemáte dostatek mincí!');
        return;
    }
    
    spinning = true;
    document.getElementById('spinSlotBtn').disabled = true;
    document.getElementById('slotResult').textContent = '';
    
    currentUser.coins -= currentBet;
    currentUser.stats.slotSpins++;
    currentUser.stats.totalBet += currentBet;
    currentUser.stats.totalSpins++;
    
    if (currentBet >= 100) {
        currentUser.stats.highBets++;
        currentUser.stats.maxBets++;
    }
    
    updateMissionProgress('slotSpins', 1);
    updateMissionProgress('totalSpins', 1);
    updateMissionProgress('gamesPlayed', 'slot');
    updateMissionProgress('totalBet', currentBet);
    
    if (currentBet >= 100) {
        updateMissionProgress('maxBets', 1);
    }
    
    await saveUser();
    updateUI();
    
    const results = [];
    const isJackpot = Math.random() < 0.005;
    
    if (isJackpot) {
        const jackpotSymbol = Math.random() < 0.5 ? '💎' : '🎰';
        results.push(jackpotSymbol, jackpotSymbol, jackpotSymbol);
    } else {
        for (let i = 0; i < 3; i++) {
            results.push(getWeightedSymbol());
        }
    }
    
    const spinDurations = [2500, 3200, 3900];
    
    for (let i = 0; i < 3; i++) {
        const reel = document.getElementById(`reel${i + 1}`);
        const reelElement = reel.parentElement;
        
        // KLÍČOVÁ OPRAVA: Získej skutečnou výšku symbolu z DOM
        const firstSymbol = reel.querySelector('.symbol');
        const symbolHeight = firstSymbol ? firstSymbol.offsetHeight : 100;
        
        // Najdi cílový symbol v bezpečné vzdálenosti
        let targetIndex = -1;
        for (let j = 30; j < reels[i].length - 30; j++) {
            if (reels[i][j] === results[i]) {
                targetIndex = j;
                break;
            }
        }
        
        if (targetIndex === -1) {
            targetIndex = 50;
        }
        
        // Výpočet pozice s použitím skutečné výšky symbolu
        // Symbol má být přesně uprostřed (na 2. pozici ze 3 viditelných)
        const targetPosition = -(targetIndex * symbolHeight) + symbolHeight;
        
        // Reset pozice
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0px)';
        
        setTimeout(() => {
            reelElement.classList.add('spinning');
            
            // Rychlé točení
            let currentPos = 0;
            const spinInterval = setInterval(() => {
                currentPos -= 30;
                if (currentPos <= -(reels[i].length * symbolHeight)) {
                    currentPos = 0;
                }
                reel.style.transform = `translateY(${currentPos}px)`;
            }, 16);
            
            // Zastav s plynulým přechodem
            setTimeout(() => {
                clearInterval(spinInterval);
                reelElement.classList.remove('spinning');
                reelElement.classList.add('stopping');
                
                // Nastav přesnou cílovou pozici
                reel.style.transition = 'transform 800ms cubic-bezier(0.17, 0.67, 0.35, 0.96)';
                reel.style.transform = `translateY(${targetPosition}px)`;
                
                setTimeout(() => {
                    reelElement.classList.remove('stopping');
                }, 800);
            }, spinDurations[i]);
        }, 10);
    }
    
    setTimeout(() => {
        evaluateSlotWin(results);
    }, 5200);
};
// ============================================
// SLOT MACHINE - VYHODNOCENÍ VÝHRY
// ============================================
async function evaluateSlotWin(results) {
    let winAmount = 0;
    let message = '';
    let isWin = false;
    
    // KONTROLA 3 STEJNÝCH
    if (results[0] === results[1] && results[1] === results[2]) {
        const multiplier = winMultipliers[results[0]];
        winAmount = currentBet * multiplier;
        isWin = true;
        
        currentUser.stats.totalWins++;
        currentUser.stats.currentStreak++;
        currentUser.stats.dailyWins++;
        currentUser.stats.coinsWon += winAmount;
        
        if (currentUser.stats.currentStreak > currentUser.stats.winStreak) {
            currentUser.stats.winStreak = currentUser.stats.currentStreak;
        }
        
        if (results[0] === '🎰') {
            message = `🎰 MEGA JACKPOT! 🎰 +${winAmount} 🪙`;
            currentUser.stats.jackpots++;
        } else if (results[0] === '💎') {
            message = `💎 DIAMANTOVÁ VÝHRA! 💎 +${winAmount} 🪙`;
            currentUser.stats.diamondWins++;
            updateMissionProgress('diamondWins', 1);
        } else if (results[0] === '🍒') {
            message = `🍒 TŘEŠŇOVÁ VÝHRA! 🍒 +${winAmount} 🪙`;
            currentUser.stats.cherryWins++;
        } else if (results[0] === '🔔') {
            message = `🔔 ZVONKOVÁ VÝHRA! 🔔 +${winAmount} 🪙`;
            currentUser.stats.bellWins++;
        } else if (results[0] === '⭐') {
            message = `⭐ HVĚZDNÁ VÝHRA! ⭐ +${winAmount} 🪙`;
            currentUser.stats.starWins++;
        } else {
            message = `🎉 VÝHRA! 🎉 +${winAmount} 🪙`;
        }
        
        if (multiplier >= 10) {
            updateMissionProgress('bigWins', 1);
        }
        
        updateMissionProgress('coinsWon', winAmount);
        updateMissionProgress('dailyWins', 1);
        updateMissionProgress('winStreak', currentUser.stats.currentStreak);
    }
    // KONTROLA 2 STEJNÝCH
    else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        let symbol;
        if (results[0] === results[1]) symbol = results[0];
        else if (results[1] === results[2]) symbol = results[1];
        else symbol = results[0];
        
        const smallMultiplier = Math.floor(winMultipliers[symbol] * 0.3);
        winAmount = Math.max(currentBet * smallMultiplier, Math.floor(currentBet * 0.5));
        isWin = true;
        
        currentUser.stats.totalWins++;
        currentUser.stats.dailyWins++;
        currentUser.stats.coinsWon += winAmount;
        
        message = `💫 Malá výhra! 💫 +${winAmount} 🪙`;
        updateMissionProgress('coinsWon', winAmount);
        updateMissionProgress('dailyWins', 1);
    }
    else {
        message = '😢 Zkuste to znovu!';
        currentUser.stats.currentStreak = 0;
    }
    
    document.getElementById('slotResult').textContent = message;
    
    if (isWin) {
        currentUser.coins += winAmount;
        
        if (currentUser.coins > currentUser.stats.maxCoins) {
            currentUser.stats.maxCoins = currentUser.coins;
        }
        
        checkAchievements();
        await saveUser();
        updateUI();
        
        document.getElementById('winAmount').textContent = `+${winAmount} 🪙`;
        document.getElementById('winModal').style.display = 'flex';
        
        const confettiCount = winAmount >= currentBet * 10 ? 100 : 30;
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => createConfetti(), i * (winAmount >= currentBet * 10 ? 10 : 15));
        }
    } else {
        await saveUser();
    }
    
    spinning = false;
    document.getElementById('spinSlotBtn').disabled = false;
}

// ============================================
// SLOT MACHINE - NASTAVENÍ SÁZKY
// ============================================
window.setBet = function(amount) {
    currentBet = amount;
    document.getElementById('currentBet').textContent = amount;
    
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
};

// ============================================
// WHEEL OF FORTUNE - KRESLENÍ
// ============================================
function drawWheel() {
    const canvas = document.getElementById("wheel");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const center = 200;
    
    ctx.clearRect(0, 0, 400, 400);
    const slice = 2 * Math.PI / wheelPrizes.length;
    
    wheelPrizes.forEach((prize, i) => {
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, center - 5, rotation + i * slice, rotation + (i + 1) * slice);
        ctx.fillStyle = prize.color;
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(rotation + i * slice + slice / 2);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.textAlign = "right";
        ctx.font = "bold 18px Bangers";
        const text = prize.coins === 0 ? '0 🪙' : `${prize.coins} 🪙`;
        ctx.strokeText(text, center - 25, 6);
        ctx.fillText(text, center - 25, 6);
        ctx.restore();
    });
}

function autoRotate() {
    if (autoRotating && !wheelSpinning) rotation += 0.001;
    drawWheel();
    requestAnimationFrame(autoRotate);
}

// ============================================
// WHEEL OF FORTUNE - SPIN
// ============================================
window.spinWheel = async function() {
    const wheelCost = 10;
    
    if (wheelSpinning) return;
    if (currentUser.coins < wheelCost) {
        alert('Nemáte dostatek mincí! Kolo stojí 10 🪙');
        return;
    }
    
    wheelSpinning = true;
    autoRotating = false;
    document.getElementById('spinWheelBtn').disabled = true;
    
    currentUser.coins -= wheelCost;
    currentUser.stats.wheelSpins++;
    currentUser.stats.totalSpins++;
    currentUser.stats.totalBet += wheelCost;
    
    updateMissionProgress('wheelSpins', 1);
    updateMissionProgress('totalSpins', 1);
    updateMissionProgress('gamesPlayed', 'wheel');
    updateMissionProgress('totalBet', wheelCost);
    
    await saveUser();
    updateUI();
    
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize = null;
    
    for (let prize of wheelPrizes) {
        cumulative += prize.weight;
        if (random < cumulative) {
            selectedPrize = prize;
            break;
        }
    }
    
    if (!selectedPrize) selectedPrize = wheelPrizes[0];
    
    const prizeIndex = wheelPrizes.indexOf(selectedPrize);
    const slice = 2 * Math.PI / wheelPrizes.length;
    const targetRotation = 2 * Math.PI * 8 + (3 / 2 * Math.PI - prizeIndex * slice - slice / 2);
    
    const startRotation = rotation;
    const duration = 7000;
    let startTime = null;
    
    function anim(timestamp) {
        if (!startTime) startTime = timestamp;
        let elapsed = timestamp - startTime;
        let t = Math.min(elapsed / duration, 1);
        rotation = startRotation + (targetRotation - startRotation) * easeOutCubic(t);
        drawWheel();
        if (t < 1) {
            requestAnimationFrame(anim);
        } else {
            setTimeout(() => finishWheelSpin(selectedPrize.coins), 500);
        }
    }
    requestAnimationFrame(anim);
};

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ============================================
// WHEEL OF FORTUNE - VYHODNOCENÍ
// ============================================
async function finishWheelSpin(coinWin) {
    wheelSpinning = false;
    document.getElementById('spinWheelBtn').disabled = false;
    autoRotating = true;
    
    currentUser.coins += coinWin;
    
    if (coinWin > 0) {
        currentUser.stats.totalWins++;
        currentUser.stats.dailyWins++;
        currentUser.stats.coinsWon += coinWin;
        
        updateMissionProgress('coinsWon', coinWin);
        updateMissionProgress('dailyWins', 1);
    }
    
    if (currentUser.coins > currentUser.stats.maxCoins) {
        currentUser.stats.maxCoins = currentUser.coins;
    }
    
    checkAchievements();
    await saveUser();
    updateUI();
    
    document.getElementById('winAmount').textContent = `+${coinWin} 🪙`;
    document.getElementById('winModal').style.display = 'flex';
    
    if (coinWin > 0) {
        for (let i = 0; i < 80; i++) {
            setTimeout(() => createConfetti(), i * 15);
        }
    }
}

// ============================================
// SHOP - NAČTENÍ
// ============================================
function loadShop() {
    const grid = document.getElementById('shopGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    shopItems.forEach(item => {
        const owned = currentUser.ownedThemes.includes(item.id);
        const isActive = currentUser.activeTheme === item.id;
        
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item' + (owned ? ' owned' : '');
        
        shopItem.innerHTML = `
            <div class="shop-icon">${item.icon}</div>
            <div class="shop-name">${item.name}</div>
            <div class="shop-price">${owned ? (isActive ? 'AKTIVNÍ' : '') : item.price + ' 🪙'}</div>
            <button class="shop-buy-btn" onclick="${owned ? `activateTheme('${item.id}')` : `buyTheme('${item.id}')`}" ${isActive ? 'disabled' : ''}>
                ${isActive ? '✅ POUŽÍVÁTE' : (owned ? '🎨 POUŽÍT' : '💰 KOUPIT')}
            </button>
        `;
        
        grid.appendChild(shopItem);
    });
}

// ============================================
// SHOP - NÁKUP TÉMATU
// ============================================
window.buyTheme = async function(themeId) {
    const item = shopItems.find(i => i.id === themeId);
    if (!item) return;
    
    if (currentUser.ownedThemes.includes(themeId)) {
        alert('Tento vzhled již vlastníte!');
        return;
    }
    
    if (currentUser.coins < item.price) {
        alert(`Nemáte dostatek mincí! Potřebujete ${item.price} 🪙`);
        return;
    }
    
    currentUser.coins -= item.price;
    currentUser.ownedThemes.push(themeId);
    currentUser.stats.themesOwned = currentUser.ownedThemes.length;
    
    checkAchievements();
    await saveUser();
    updateUI();
    loadShop();
    
    document.getElementById('winAmount').textContent = `Koupeno: ${item.name}!`;
    document.getElementById('winModal').style.display = 'flex';
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 20);
    }
};

// ============================================
// SHOP - AKTIVACE TÉMATU
// ============================================
window.activateTheme = async function(themeId) {
    const item = shopItems.find(i => i.id === themeId);
    if (!item || !currentUser.ownedThemes.includes(themeId)) return;
    
    currentUser.activeTheme = themeId;
    applyTheme(item.colors);
    
    await saveUser();
    updateUI();
    loadShop();
    
    document.getElementById('winAmount').textContent = `Vzhled ${item.name} aktivován!`;
    document.getElementById('winModal').style.display = 'flex';
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => createConfetti(), i * 20);
    }
};

// ============================================
// APLIKACE TÉMATU
// ============================================
function applyTheme(colors) {
    document.body.style.background = `linear-gradient(135deg, ${colors.bg1} 0%, ${colors.bg2} 50%, ${colors.bg1} 100%)`;
    
    const style = document.createElement('style');
    style.id = 'theme-style';
    style.textContent = `
        body::before {
            background: 
                radial-gradient(circle at 20% 50%, ${colors.bgGlow1} 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, ${colors.bgGlow2} 0%, transparent 50%) !important;
        }
        
        #loadingScreen {
            background: linear-gradient(135deg, ${colors.bg1} 0%, ${colors.bg2} 50%, ${colors.bg1} 100%) !important;
        }
        
        .loading-content h2 {
            color: ${colors.primary} !important;
            text-shadow: 0 0 30px ${colors.primary}, 0 0 60px ${colors.secondary} !important;
        }
        
        .loading-bar {
            background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.primary}) !important;
            box-shadow: 0 0 30px ${colors.primary}dd !important;
        }
        
        #topBar {
            background: linear-gradient(135deg, ${colors.bg1}f8 0%, ${colors.bg2}f8 100%) !important;
            border-bottom-color: ${colors.primary} !important;
            box-shadow: 0 5px 30px ${colors.primary}99 !important;
        }
        
        #userName {
            color: ${colors.primary} !important;
            text-shadow: 0 0 15px ${colors.primary}, 0 0 30px ${colors.secondary} !important;
        }
        
        #coinDisplay, #dailyBonus, #shopBtn {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 25px ${colors.primary}dd !important;
        }
        
        .game-btn {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            border-color: ${colors.primary} !important;
        }
        
        .game-btn.active {
            box-shadow: 0 0 30px ${colors.primary} !important;
        }
        
        #slotMachine {
            background: linear-gradient(135deg, ${colors.bg2}dd 0%, ${colors.bg1}dd 50%, ${colors.bg2}dd 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 50px ${colors.primary}dd !important;
        }
        
        .reel {
            background: linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg1} 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 20px ${colors.primary}88 !important;
        }
        
        .bet-btn.active {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            box-shadow: 0 0 20px ${colors.primary}cc !important;
        }
        
        #spinSlotBtn, #spinWheelBtn {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 30px ${colors.primary}99 !important;
        }
        
        canvas {
            border-color: ${colors.secondary} !important;
            box-shadow: 0 0 50px ${colors.primary}dd !important;
        }
        
        .modal-content {
            background: linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg1} 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 100px ${colors.primary}dd !important;
        }
        
        .modal h2 {
            color: ${colors.primary} !important;
            text-shadow: 0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary} !important;
        }
        
        .shop-item {
            background: linear-gradient(135deg, ${colors.bg2}e6 0%, ${colors.bg1}e6 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 30px ${colors.primary}88 !important;
        }
        
        .achievement-item, .mission-item {
            background: ${colors.primary}1a !important;
            border-color: ${colors.primary}4d !important;
        }
        
        .progress-bar {
            background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}) !important;
            box-shadow: 0 0 10px ${colors.primary}cc !important;
        }
        
        .star {
            background: ${colors.primary} !important;
            box-shadow: 0 0 5px ${colors.primary} !important;
        }
    `;
    
    const oldStyle = document.getElementById('theme-style');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
}

// ============================================
// PŘEPÍNÁNÍ HER
// ============================================
window.switchGame = function(game) {
    currentGame = game;
    
    document.querySelectorAll('.game-container').forEach(container => {
        container.classList.remove('active');
    });
    
    document.querySelectorAll('.game-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const gameMap = {
        'slot': 'slotGame',
        'wheel': 'wheelGame',
        'missions': 'missionsGame',
        'achievements': 'achievementsGame',
        'leaderboard': 'leaderboardGame',
        'shop': 'shopGame'
    };
    
    const gameElement = document.getElementById(gameMap[game]);
    const btnElement = document.getElementById(`${game}Btn`);
    
    if (gameElement) gameElement.classList.add('active');
    if (btnElement) btnElement.classList.add('active');
    
    if (game === 'missions') loadMissions();
    if (game === 'achievements') loadAchievements();
    if (game === 'leaderboard') loadLeaderboard();
    if (game === 'shop') loadShop();
};

// ============================================
// PŘIHLÁŠENÍ
// ============================================
window.login = async function() {
    const nickname = document.getElementById('nicknameInput').value.trim();
    if (!nickname || nickname.length < 2) {
        alert('❌ Zadejte přezdívku (min. 2 znaky)');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = '⏳ Přihlašuji...';
    loginBtn.disabled = true;
    
    try {
        const { data: existingUser } = await supabase
            .from('casino_users')
            .select('*')
            .eq('nickname', nickname)
            .maybeSingle();
        
        if (existingUser) {
            currentUser.id = existingUser.id;
            currentUser.nickname = existingUser.nickname;
            currentUser.coins = existingUser.coins;
            currentUser.lastDailyBonus = existingUser.last_daily_bonus;
            currentUser.ownedThemes = existingUser.owned_themes || ['default'];
            currentUser.activeTheme = existingUser.active_theme || 'default';
            currentUser.stats = { ...currentUser.stats, ...(existingUser.stats || {}) };
            currentUser.unlockedAchievements = existingUser.unlocked_achievements || [];
            currentUser.dailyMissions = existingUser.daily_missions || {};
            currentUser.lastMissionReset = existingUser.last_mission_reset;
        } else {
            currentUser.nickname = nickname;
            currentUser.coins = 100;
            currentUser.lastDailyBonus = new Date().toISOString();
            
            const { data: newUser } = await supabase
                .from('casino_users')
                .insert([{
                    nickname: currentUser.nickname,
                    coins: currentUser.coins,
                    last_daily_bonus: currentUser.lastDailyBonus,
                    owned_themes: currentUser.ownedThemes,
                    active_theme: currentUser.activeTheme,
                    stats: currentUser.stats,
                    unlocked_achievements: currentUser.unlockedAchievements,
                    daily_missions: currentUser.dailyMissions,
                    last_mission_reset: currentUser.lastMissionReset
                }])
                .select()
                .single();
            
            currentUser.id = newUser.id;
        }
        
        updateLoginStreak();
        initializeMissions();
        
        const activeItem = shopItems.find(i => i.id === currentUser.activeTheme);
        if (activeItem) applyTheme(activeItem.colors);
        
        localStorage.setItem('currentUser', JSON.stringify({ id: currentUser.id }));
        
        document.getElementById('loginModal').style.display = 'none';
        updateUI();
        checkDailyBonus();
        
    } catch (error) {
        console.error('❌ Chyba při přihlášení:', error);
        alert('❌ Nepodařilo se přihlásit. Zkuste to znovu.');
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
    }
};

// ============================================
// AKTUALIZACE UI
// ============================================
function updateUI() {
    const userNameEl = document.getElementById('userName');
    const coinAmountEl = document.getElementById('coinAmount');
    
    if (userNameEl) userNameEl.textContent = currentUser.nickname;
    if (coinAmountEl) coinAmountEl.textContent = currentUser.coins;
}

// ============================================
// DENNÍ BONUS
// ============================================
window.claimDailyBonus = async function() {
    const now = Date.now();
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    
    if (currentUser.lastDailyBonus) {
        const lastClaim = new Date(currentUser.lastDailyBonus).getTime();
        const timeSince = now - lastClaim;
        
        if (timeSince < TWELVE_HOURS) {
            const timeLeft = TWELVE_HOURS - timeSince;
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            
            alert(`⏰ Denní bonus lze vyzvednout až za ${hoursLeft}h ${minutesLeft}m!`);
            return;
        }
    }
    
    const bonus = 300;
    currentUser.coins += bonus;
    currentUser.lastDailyBonus = new Date().toISOString();
    currentUser.stats.dailyBonusClaims++;
    
    updateMissionProgress('dailyBonus', 1);
    
    await saveUser();
    updateUI();
    checkDailyBonus();
    
    document.getElementById('winAmount').textContent = `+${bonus} 🪙 DENNÍ BONUS!`;
    document.getElementById('winModal').style.display = 'flex';
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 20);
    }
};

function checkDailyBonus() {
    const btn = document.getElementById('dailyBonus');
    if (!btn) return;
    
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    
    if (currentUser.lastDailyBonus) {
        const lastClaim = new Date(currentUser.lastDailyBonus).getTime();
        const timeSince = Date.now() - lastClaim;
        
        if (timeSince < TWELVE_HOURS) {
            const timeLeft = TWELVE_HOURS - timeSince;
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            
            btn.disabled = true;
            btn.textContent = `⏰ ${hoursLeft}h ${minutesLeft}m`;
            setTimeout(checkDailyBonus, 60000);
        } else {
            btn.disabled = false;
            btn.textContent = '🎁 DENNÍ BONUS (300🪙)';
        }
    } else {
        btn.disabled = false;
        btn.textContent = '🎁 DENNÍ BONUS (300🪙)';
    }
}

// ============================================
// ULOŽENÍ UŽIVATELE
// ============================================
async function saveUser() {
    if (!currentUser.id) return;
    
    if (currentUser.dailyMissions && currentUser.dailyMissions.coin_collector) {
        const mission = currentUser.dailyMissions.coin_collector;
        if (!mission.completed && currentUser.coins >= 1000) {
            mission.progress = currentUser.coins;
            mission.completed = true;
        }
    }
    
    try {
        await supabase
            .from('casino_users')
            .update({
                nickname: currentUser.nickname,
                coins: currentUser.coins,
                last_daily_bonus: currentUser.lastDailyBonus,
                owned_themes: currentUser.ownedThemes,
                active_theme: currentUser.activeTheme,
                stats: currentUser.stats,
                unlocked_achievements: currentUser.unlockedAchievements,
                daily_missions: currentUser.dailyMissions,
                last_mission_reset: currentUser.lastMissionReset
            })
            .eq('id', currentUser.id);
    } catch (e) {
        console.error('Chyba při ukládání:', e);
    }
}

// ============================================
// LEADERBOARD
// ============================================
async function loadLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list) return;
    
    list.innerHTML = '<div style="text-align: center; color: #fff; font-size: 20px;">Načítám žebříček...</div>';
    
    const { data } = await supabase
        .from('casino_users')
        .select('*')
        .order('coins', { ascending: false })
        .limit(50);
    
    list.innerHTML = '';
    
    if (!data || data.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #fff; font-size: 20px;">Žádní hráči v žebříčku</div>';
        return;
    }
    
    data.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        if (index < 3) item.classList.add('top3');
        
        let medal = '';
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';
        
        item.innerHTML = `
            <span class="leaderboard-rank">${medal} ${index + 1}.</span>
            <span class="leaderboard-name">${user.nickname}</span>
            <span class="leaderboard-coins">${user.coins} 🪙</span>
        `;
        list.appendChild(item);
    });
}

// ============================================
// ACHIEVEMENTS
// ============================================
function checkAchievements() {
    if (!currentUser.stats) return;
    
    currentUser.stats.themesOwned = currentUser.ownedThemes.length;
    
    if (currentUser.coins > (currentUser.stats.maxCoins || 0)) {
        currentUser.stats.maxCoins = currentUser.coins;
    }
    
    achievements.forEach(achievement => {
        if (!currentUser.unlockedAchievements.includes(achievement.id)) {
            if (achievement.condition(currentUser.stats)) {
                unlockAchievement(achievement.id);
            }
        }
    });
}

async function unlockAchievement(achievementId) {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;
    
    currentUser.unlockedAchievements.push(achievementId);
    currentUser.coins += achievement.reward;
    currentUser.stats.achievementsUnlocked = currentUser.unlockedAchievements.length;
    
    await saveUser();
    updateUI();
    
    showNotification(`🏆 Úspěch odemčen: ${achievement.name} (+${achievement.reward} 🪙)`);
    
    for (let i = 0; i < 80; i++) {
        setTimeout(() => createConfetti(), i * 15);
    }
    
    if (currentGame === 'achievements') loadAchievements();
}

function loadAchievements() {
    const list = document.getElementById('achievementsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    achievements.forEach(achievement => {
        const isUnlocked = currentUser.unlockedAchievements.includes(achievement.id);
        
        const item = document.createElement('div');
        item.className = 'achievement-item' + (isUnlocked ? ' completed' : ' locked');
        
        item.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
            <div class="achievement-reward">${isUnlocked ? '✅' : `+${achievement.reward} 🪙`}</div>
            ${isUnlocked ? '<div class="completed-badge">SPLNĚNO</div>' : ''}
        `;
        
        list.appendChild(item);
    });
}

// ============================================
// MISSIONS
// ============================================
function initializeMissions() {
    const today = new Date().toISOString().split('T')[0];
    
    if (currentUser.lastMissionReset !== today) {
        currentUser.lastMissionReset = today;
        currentUser.dailyMissions = {};
        
        dailyMissions.forEach(mission => {
            currentUser.dailyMissions[mission.id] = {
                progress: 0,
                completed: false,
                claimed: false
            };
        });
        
        currentUser.stats.coinsWon = 0;
        currentUser.stats.bigWins = 0;
        currentUser.stats.gamesPlayed = [];
        currentUser.stats.dailyWins = 0;
        currentUser.stats.totalSpins = 0;
        
        saveUser();
    }
}

function updateMissionProgress(type, amount = 1) {
    if (!currentUser.dailyMissions) initializeMissions();
    if (!currentUser.stats.gamesPlayed) currentUser.stats.gamesPlayed = [];
    
    if (type === 'gamesPlayed') {
        if (!currentUser.stats.gamesPlayed.includes(amount)) {
            currentUser.stats.gamesPlayed.push(amount);
        }
        
        dailyMissions.forEach(mission => {
            if (mission.type === 'gamesPlayed') {
                const missionData = currentUser.dailyMissions[mission.id];
                if (missionData && !missionData.completed) {
                    missionData.progress = currentUser.stats.gamesPlayed.length;
                    
                    if (missionData.progress >= mission.target) {
                        missionData.progress = mission.target;
                        missionData.completed = true;
                    }
                }
            }
        });
    } else if (type === 'totalCoins') {
        // Speciální handling pro coin_collector mission
        dailyMissions.forEach(mission => {
            if (mission.type === 'totalCoins') {
                const missionData = currentUser.dailyMissions[mission.id];
                if (missionData && !missionData.completed) {
                    if (currentUser.coins >= mission.target) {
                        missionData.progress = mission.target;
                        missionData.completed = true;
                    }
                }
            }
        });
    } else {
        dailyMissions.forEach(mission => {
            if (mission.type === type) {
                const missionData = currentUser.dailyMissions[mission.id];
                if (missionData && !missionData.completed) {
                    missionData.progress += amount;
                    
                    if (missionData.progress >= mission.target) {
                        missionData.progress = mission.target;
                        missionData.completed = true;
                    }
                }
            }
        });
    }
    
    saveUser();
    if (currentGame === 'missions') loadMissions();
}

function loadMissions() {
    const list = document.getElementById('missionsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (!currentUser.dailyMissions) initializeMissions();
    
    dailyMissions.forEach(mission => {
        const missionData = currentUser.dailyMissions[mission.id];
        if (!missionData) return;
        
        const progress = Math.min(missionData.progress, mission.target);
        const percentage = (progress / mission.target) * 100;
        
        const item = document.createElement('div');
        item.className = 'mission-item' + (missionData.completed ? ' completed' : '');
        
        item.innerHTML = `
            <div class="mission-icon">${mission.icon}</div>
            <div class="mission-info">
                <div class="mission-name">${mission.name}</div>
                <div class="mission-desc">${mission.desc}</div>
                <div class="mission-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>
                    <div class="progress-text">${progress} / ${mission.target}</div>
                </div>
            </div>
            <div class="mission-reward">
                ${missionData.claimed ? '✅' : (missionData.completed ? '' : `+${mission.reward} 🪙`)}
            </div>
            ${missionData.completed && !missionData.claimed ? 
                `<button class="claim-btn" onclick="claimMission('${mission.id}')">VYZVEDNOUT!</button>` : 
                (missionData.claimed ? '<div class="completed-badge">VYZVEDNUT</div>' : '')}
        `;
        
        list.appendChild(item);
    });
}

window.claimMission = async function(missionId) {
    const mission = dailyMissions.find(m => m.id === missionId);
    const missionData = currentUser.dailyMissions[missionId];
    
    if (!mission || !missionData || !missionData.completed || missionData.claimed) return;
    
    missionData.claimed = true;
    currentUser.coins += mission.reward;
    currentUser.stats.missionsCompleted++;
    
    await saveUser();
    updateUI();
    loadMissions();
    
    document.getElementById('winAmount').textContent = `+${mission.reward} 🪙`;
    document.getElementById('winModal').style.display = 'flex';
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 20);
    }
};

// ============================================
// UTILITY FUNKCE
// ============================================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #00ffff, #ff00ff);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.5s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateLoginStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = currentUser.stats.lastLogin;
    
    if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentUser.stats.loginStreak++;
        } else if (diffDays > 1) {
            currentUser.stats.loginStreak = 1;
        }
    } else {
        currentUser.stats.loginStreak = 1;
    }
    
    currentUser.stats.lastLogin = today;
}

function createConfetti() {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.cssText = `
        position: fixed;
        width: ${5 + Math.random() * 10}px;
        height: ${5 + Math.random() * 10}px;
        background: hsl(${Math.random() * 360}, 80%, 60%);
        left: ${Math.random() * window.innerWidth}px;
        top: -10px;
        z-index: 9999;
        pointer-events: none;
    `;
    document.body.appendChild(c);
    
    const speedY = 3 + Math.random() * 5;
    const driftX = (Math.random() - 0.5) * 4;
    let y = -10;
    
    function fall() {
        y += speedY;
        c.style.top = y + "px";
        c.style.left = parseFloat(c.style.left) + driftX + "px";
        if (y < window.innerHeight) requestAnimationFrame(fall);
        else c.remove();
    }
    fall();
}

window.closeWinModal = function() {
    const modal = document.getElementById('winModal');
    if (modal) modal.style.display = 'none';
};

// ============================================
// EVENT LISTENERS
// ============================================
const nicknameInput = document.getElementById('nicknameInput');
if (nicknameInput) {
    nicknameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });
}

// ============================================
// INICIALIZACE
// ============================================
window.addEventListener('load', async () => {
    console.log('🎰 Casino inicializace...');
    
    createStars();
    showUpdateModal();
    startLoading();
    initReels();
    autoRotate();
    
    setTimeout(async () => {
        const savedUser = localStorage.getItem('currentUser');
        
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                
                const { data: existingUser } = await supabase
                    .from('casino_users')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();
                
                if (existingUser) {
                    currentUser.id = existingUser.id;
                    currentUser.nickname = existingUser.nickname;
                    currentUser.coins = existingUser.coins;
                    currentUser.lastDailyBonus = existingUser.last_daily_bonus;
                    currentUser.ownedThemes = existingUser.owned_themes || ['default'];
                    currentUser.activeTheme = existingUser.active_theme || 'default';
                    currentUser.stats = { ...currentUser.stats, ...(existingUser.stats || {}) };
                    currentUser.unlockedAchievements = existingUser.unlocked_achievements || [];
                    currentUser.dailyMissions = existingUser.daily_missions || {};
                    currentUser.lastMissionReset = existingUser.last_mission_reset;
                    
                    updateLoginStreak();
                    initializeMissions();
                    
                    const activeItem = shopItems.find(i => i.id === currentUser.activeTheme);
                    if (activeItem) applyTheme(activeItem.colors);
                    
                    updateUI();
                    checkDailyBonus();
                } else {
                    localStorage.removeItem('currentUser');
                    document.getElementById('loginModal').style.display = 'flex';
                }
            } catch (e) {
                console.error('❌ Chyba při načítání uživatele:', e);
                localStorage.removeItem('currentUser');
                document.getElementById('loginModal').style.display = 'flex';
            }
        } else {
            document.getElementById('loginModal').style.display = 'flex';
        }
    }, 3500);
});















