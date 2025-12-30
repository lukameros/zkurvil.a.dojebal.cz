import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://bmmaijlbpwgzhrxzxphf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    }, loadingTime);
}

for(let i = 0; i < 30; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    document.body.appendChild(star);
}

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
        bigWins: 0,
        gamesPlayed: []
    },
    unlockedAchievements: [],
    dailyMissions: {},
    lastMissionReset: null
};

let currentGame = 'slot';
let currentBet = 10;

window.setBet = function(amount) {
    currentBet = amount;
    const betDisplay = document.getElementById('currentBet');
    if (betDisplay) betDisplay.textContent = currentBet;
    
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === amount.toString()) {
            btn.classList.add('active');
        }
    });
}

const shopItems = [
    { id: 'default', name: '🎰 Výchozí', price: 0, icon: '🎰', colors: {
        primary: '#00ffff', secondary: '#ff00ff', bg1: '#0a0015', bg2: '#1a0033',
        bgGlow1: 'rgba(255,0,255,0.4)', bgGlow2: 'rgba(0,255,255,0.4)'
    }},
    { id: 'gold', name: '🌟 Zlatý', price: 1000, icon: '🌟', colors: {
        primary: '#ffd700', secondary: '#ffaa00', bg1: '#1a1000', bg2: '#332200',
        bgGlow1: 'rgba(255,215,0,0.4)', bgGlow2: 'rgba(255,170,0,0.4)'
    }}
];

const achievements = [
    { id: 'first_win', name: 'První výhra! 🎉', desc: 'Vyhrát na automatu poprvé', icon: '🎉', reward: 50,
      condition: (stats) => stats.totalWins >= 1 }
];

const dailyMissions = [
    { id: 'spin_10', name: '🎰 Desetinásobný točitel', desc: 'Zatočit 10x na automatu', icon: '🎰',
      reward: 50, target: 10, type: 'slotSpins' }
];

const symbolWeights = {'🍒': 35, '🍋': 30, '🍊': 26, '🍇': 20, '🔔': 16, '⭐': 12, '💎': 8, '🎰': 3};
const winMultipliers = {'🍒': 3, '🍋': 4, '🍊': 5, '🍇': 7, '🔔': 9, '⭐': 12, '💎': 18, '🎰': 25};

let reels = [[], [], []];
let spinning = false;

function initReels() {
    for (let i = 0; i < 3; i++) {
        const reel = document.getElementById(`reel${i + 1}`);
        if (!reel) continue;
        reel.innerHTML = '';
        reels[i] = [];

        for (let j = 0; j < 50; j++) {
            const symbol = getWeightedSymbol();
            reels[i].push(symbol);
            const div = document.createElement('div');
            div.className = 'symbol';
            div.textContent = symbol;
            reel.appendChild(div);
        }

        reels[i].forEach(symbol => {
            const clone = document.createElement('div');
            clone.className = 'symbol';
            clone.textContent = symbol;
            reel.appendChild(clone);
        });
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

window.closeUpdateModal = function() {
    const modal = document.getElementById('updateModal');
    if (modal) modal.style.display = 'none';
    localStorage.setItem('casino_version_seen', '2.0');
}

function checkFirstVisit() {
    if (localStorage.getItem('casino_version_seen') !== '2.0') {
        setTimeout(() => {
            const modal = document.getElementById('updateModal');
            if (modal) modal.style.display = 'flex';
        }, 1000);
    }
}

window.spinSlot = async function() {
    if (spinning || currentUser.coins < currentBet) {
        alert('Nemáte dostatek mincí!');
        return;
    }
    
    spinning = true;
    document.getElementById('spinSlotBtn').disabled = true;
    document.getElementById('slotResult').textContent = '';
    
    currentUser.coins -= currentBet;
    currentUser.stats.slotSpins++;
    currentUser.stats.totalBet += currentBet;
    
    if (currentBet >= 100) currentUser.stats.highBets++;
    
    await saveUser();
    updateUI();
    
    const results = [];
    const isJackpot = Math.random() < 0.025;
    
    if (isJackpot) {
        const jackpotSymbol = Math.random() < 0.5 ? '💎' : '🎰';
        results.push(jackpotSymbol, jackpotSymbol, jackpotSymbol);
    } else {
        for (let i = 0; i < 3; i++) results.push(getWeightedSymbol());
    }
    
    document.querySelectorAll('.reel').forEach(reel => reel.classList.add('spinning'));
    
    setTimeout(() => evaluateSlotWin(results), 5200);
};

async function evaluateSlotWin(results) {
    let winAmount = 0;
    let message = '';

    const counts = {};
    results.forEach(sym => counts[sym] = (counts[sym] || 0) + 1);

    let winSymbol = null;
    let maxCount = 0;
    for (const sym in counts) {
        if (counts[sym] > maxCount) {
            maxCount = counts[sym];
            winSymbol = sym;
        }
    }

    if (maxCount === 3) {
        const multiplier = winMultipliers[winSymbol];
        winAmount = currentBet * multiplier;
        currentUser.stats.totalWins++;
        currentUser.stats.currentStreak++;
        
        if (winSymbol === '🎰') {
            message = `🎰 MEGA JACKPOT! 🎰 +${winAmount} 🪙`;
            currentUser.stats.jackpots++;
        } else if (winSymbol === '💎') {
            message = `💎 DIAMANTOVÁ VÝHRA! 💎 +${winAmount} 🪙`;
            currentUser.stats.diamondWins++;
        } else {
            message = `🎉 3x ${winSymbol} → +${winAmount} 🪙`;
        }
    } else if (maxCount === 2) {
        const multiplier = Math.max(1, Math.floor(winMultipliers[winSymbol] / 3));
        winAmount = currentBet * multiplier;
        currentUser.stats.totalWins++;
        message = `✨ ${winSymbol}${winSymbol} HIT! +${winAmount} 🪙`;
    } else {
        message = '😢 Zkuste to znovu!';
        currentUser.stats.currentStreak = 0;
    }

    document.getElementById('slotResult').textContent = message;

    if (winAmount > 0) {
        currentUser.coins += winAmount;
        await saveUser();
        updateUI();
        document.getElementById('winAmount').textContent = `+${winAmount} 🪙`;
        document.getElementById('winModal').style.display = 'flex';
    } else {
        await saveUser();
    }

    spinning = false;
    document.getElementById('spinSlotBtn').disabled = false;
}

window.switchGame = function(game) {
    currentGame = game;
    document.querySelectorAll('.game-container').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.game-btn').forEach(b => b.classList.remove('active'));
    
    const gameMap = {
        slot: ['slotGame', 'slotBtn'],
        wheel: ['wheelGame', 'wheelBtn'],
        missions: ['missionsGame', 'missionsBtn'],
        achievements: ['achievementsGame', 'achievementsBtn'],
        leaderboard: ['leaderboardGame', 'leaderboardBtn'],
        shop: ['shopGame', null]
    };
    
    if (gameMap[game]) {
        const [container, btn] = gameMap[game];
        const el = document.getElementById(container);
        if (el) el.classList.add('active');
        if (btn) {
            const btnEl = document.getElementById(btn);
            if (btnEl) btnEl.classList.add('active');
        }
    }
};

window.login = async function() {
    const nickname = document.getElementById('nicknameInput').value.trim();
    if (!nickname || nickname.length < 2) {
        alert('❌ Zadejte přezdívku (min. 2 znaky)');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.textContent = '⏳ Přihlašuji...';
    loginBtn.disabled = true;
    
    try {
        const { data: existingUser } = await supabase
            .from('casino_users')
            .select('*')
            .eq('nickname', nickname)
            .maybeSingle();
        
        if (existingUser) {
            Object.assign(currentUser, existingUser);
        } else {
            currentUser.nickname = nickname;
            currentUser.coins = 100;
            
            const { data: newUser } = await supabase
                .from('casino_users')
                .insert([{ nickname, coins: 100 }])
                .select()
                .single();
            
            currentUser.id = newUser.id;
        }
        
        localStorage.setItem('currentUser', JSON.stringify({id: currentUser.id, username: currentUser.nickname}));
        document.getElementById('loginModal').style.display = 'none';
        updateUI();
    } catch (error) {
        console.error('❌ Chyba při přihlášení:', error);
        alert('❌ Nepodařilo se přihlásit.');
        loginBtn.disabled = false;
    }
};

async function saveUser() {
    if (!currentUser.id) return;
    try {
        await supabase.from('casino_users').update({
            coins: currentUser.coins,
            stats: currentUser.stats
        }).eq('id', currentUser.id);
    } catch (e) {
        console.error('Chyba při ukládání:', e);
    }
}

function updateUI() {
    const userNameEl = document.getElementById('userName');
    const coinAmountEl = document.getElementById('coinAmount');
    if (userNameEl) userNameEl.textContent = currentUser.nickname;
    if (coinAmountEl) coinAmountEl.textContent = currentUser.coins;
}

window.closeWinModal = function() {
    const modal = document.getElementById('winModal');
    if (modal) modal.style.display = 'none';
};

window.addEventListener('load', async () => {
    console.log('🎰 Casino inicializace...');
    startLoading();
    initReels();
    checkFirstVisit();
    
    setTimeout(() => {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'flex';
    }, 3500);
});
