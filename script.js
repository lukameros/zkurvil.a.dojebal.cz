import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase konfigurace
const SUPABASE_URL = 'https://bmmaijlbpwgzhrxzxphf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Loading screen logika
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

// Vytvoření hvězd
for(let i = 0; i < 30; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    document.body.appendChild(star);
}
let reelsV2 = [[], [], [], []]; // Pole pro 4 sloty

// Funkce pro nastavení sázky na nový automat
window.setBetV2 = function(amount) {
    currentBet = amount;
    
    const betDisplay = document.getElementById('currentBetV2');
    if (betDisplay) {
        betDisplay.textContent = currentBet;
    }
    
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === amount.toString()) {
            btn.classList.add('active');
        }
    });
}

// Funkce pro otočení nového automatu (4 sloty)
window.spinSlotV2 = function() {
    if (spinning) return;
    spinning = true;
    
    // Můžeme přidat kontrolu, jestli hráč má dostatek mincí
    if (currentUser.coins < currentBet) {
        showNotification('Nemáš dostatek mincí pro tuto hru!');
        spinning = false;
        return;
    }

    currentUser.coins -= currentBet;
    updateUI();

    // Animace pro 4 sloty
    const spinResults = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
        spinResults[i] = getReelSymbols();
    }
    
    setTimeout(() => {
        // Zobrazení výsledků
        document.getElementById('slotV2Result').textContent = `Výsledek: ${spinResults.join(' | ')}`;
        currentUser.coins += calculateWinnings(spinResults);
        updateUI();
        spinning = false;
    }, 2000); // Po 2 sekundách se ukáže výsledek
}

// Funkce pro získání symbolů na jednom válci
function getReelSymbols() {
    const symbols = [];
    for (let i = 0; i < 50; i++) {
        symbols.push(getWeightedSymbol());
    }
    return symbols;
}

// Funkce pro výpočet výhry
function calculateWinnings(results) {
    // Tady bychom mohli přidat logiku pro výhru na 4 válcích
    // Například zkontrolovat, jestli všechny válce mají stejné symboly a udělit výhru
    let winnings = 0;
    // Tady přidáme výpočet na základě výsledků
    return winnings;
}



// Globální proměnné
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

// Funkce pro změnu sázky
window.setBet = function(amount) {
    currentBet = amount;
    
    const betDisplay = document.getElementById('currentBet');
    if (betDisplay) {
        betDisplay.textContent = currentBet;
    }
    
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === amount.toString()) {
            btn.classList.add('active');
        }
    });
}

// SHOP ITEMS
const shopItems = [
    { id: 'default', name: '🎰 Výchozí', price: 0, icon: '🎰', colors: {
        primary: '#00ffff', 
        secondary: '#ff00ff',
        bg1: '#0a0015',
        bg2: '#1a0033',
        bgGlow1: 'rgba(255,0,255,0.4)',
        bgGlow2: 'rgba(0,255,255,0.4)'
    }},
    { id: 'neon', name: '💠 Neon', price: 500, icon: '💠', colors: { 
        primary: '#00ffff', 
        secondary: '#ff00ff',
        bg1: '#000033',
        bg2: '#330066',
        bgGlow1: 'rgba(0,255,255,0.5)',
        bgGlow2: 'rgba(255,0,255,0.5)'
    }},
    { id: 'gold', name: '🌟 Zlatý', price: 1000, icon: '🌟', colors: { 
        primary: '#ffd700', 
        secondary: '#ffaa00',
        bg1: '#1a1000',
        bg2: '#332200',
        bgGlow1: 'rgba(255,215,0,0.4)',
        bgGlow2: 'rgba(255,170,0,0.4)'
    }},
    { id: 'fire', name: '🔥 Ohnivý', price: 1500, icon: '🔥', colors: { 
        primary: '#ff4500', 
        secondary: '#ff8c00',
        bg1: '#1a0000',
        bg2: '#330000',
        bgGlow1: 'rgba(255,69,0,0.5)',
        bgGlow2: 'rgba(255,140,0,0.5)'
    }},
    { id: 'ocean', name: '🌊 Oceán', price: 2000, icon: '🌊', colors: { 
        primary: '#0080ff', 
        secondary: '#00ffff',
        bg1: '#00001a',
        bg2: '#001a33',
        bgGlow1: 'rgba(0,128,255,0.4)',
        bgGlow2: 'rgba(0,255,255,0.4)'
    }},
    { id: 'rainbow', name: '🌈 Duha', price: 3000, icon: '🌈', colors: { 
        primary: '#ff00ff', 
        secondary: '#00ff00',
        bg1: '#1a001a',
        bg2: '#330033',
        bgGlow1: 'rgba(255,0,255,0.5)',
        bgGlow2: 'rgba(0,255,0,0.5)'
    }},
    { id: 'legend', name: '🏆 Legendární', price: 15000, icon: '🏆', colors: { 
        primary: '#ffd700', 
        secondary: '#ff1493',
        bg1: '#1a0a00',
        bg2: '#331400',
        bgGlow1: 'rgba(255,215,0,0.6)',
        bgGlow2: 'rgba(255,20,147,0.5)'
    }}
];

// ACHIEVEMENTS
const achievements = [
    { 
        id: 'first_win', 
        name: 'První výhra! 🎉', 
        desc: 'Vyhrát na automatu poprvé',
        icon: '🎉', 
        reward: 50,
        condition: (stats) => stats.totalWins >= 1
    },
    { 
        id: 'slot_master', 
        name: 'Mistr automatů', 
        desc: 'Zatočit 100x na automatu',
        icon: '🎰', 
        reward: 200,
        condition: (stats) => stats.slotSpins >= 100
    }
];

// DAILY MISSIONS
const dailyMissions = [
    { 
        id: 'spin_10', 
        name: '🎰 Desetinásobný točitel', 
        desc: 'Zatočit 10x na automatu',
        icon: '🎰',
        reward: 50, 
        target: 10,
        type: 'slotSpins'
    }
];

// Symbol weights
const symbolWeights = {
    '🍒': 35,
    '🍋': 30,
    '🍊': 26,
    '🍇': 20,
    '🔔': 16,
    '⭐': 12,
    '💎': 8,
    '🎰': 3
};

const winMultipliers = {
    '🍒': 3,
    '🍋': 4,
    '🍊': 5,
    '🍇': 7,
    '🔔': 9,
    '⭐': 12,
    '💎': 18,
    '🎰': 25
};

let reels = [[], [], []];
let spinning = false;  // Inicializace proměnné

// Funkce pro otočení nového automatu (4 sloty)
window.spinSlotV2 = function() {
    if (spinning) return;
    spinning = true;
    
    // Zkontroluj, jestli hráč má dostatek mincí
    if (currentUser.coins < currentBet || currentBet <= 0 || isNaN(currentBet)) {
        showNotification('Nemáš dostatek mincí pro tuto hru nebo neplatná sázka!');
        spinning = false;
        return;
    }

    currentUser.coins -= currentBet;
    updateUI();

    // Animace pro 4 sloty
    const spinResults = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
        spinResults[i] = getReelSymbols();
    }
    
    setTimeout(() => {
        // Zobrazení výsledků
        document.getElementById('slotV2Result').textContent = `Výsledek: ${spinResults.map(r => r.join(' | ')).join(' | ')}`;
        currentUser.coins += calculateWinnings(spinResults);
        updateUI();
        spinning = false;
    }, 2000); // Po 2 sekundách se ukáže výsledek
}

// Funkce pro výpočet výhry
function calculateWinnings(results) {
    let winnings = 0;

    // Zkontroluj, jestli všechny válce mají stejné symboly
    const allSame = results.every(result => result[0] === result[1] && result[1] === result[2]);

    if (allSame) {
        winnings = currentBet * 10; // Za shodu všech symbolů násobíme sázku
    }

    return winnings;
}

// Funkce pro získání symbolů na jednom válci
function getReelSymbols() {
    const symbols = [];
    for (let i = 0; i < 3; i++) {  // Tři symboly pro jeden válec
        symbols.push(getWeightedSymbol());
    }
    return symbols;
}


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

window.closeUpdateModal = function() {
    document.getElementById('updateModal').style.display = 'none';
    localStorage.setItem('casino_version_seen', '2.0');
}

function checkFirstVisit() {
    const versionSeen = localStorage.getItem('casino_version_seen');
    if (versionSeen !== '2.0') {
        setTimeout(() => {
            const modal = document.getElementById('updateModal');
            if (modal) modal.style.display = 'flex';
        }, 1000);
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
        
        if (!currentUser.stats) currentUser.stats = {};
        currentUser.stats.coinsWon = 0;
        currentUser.stats.bigWins = 0;
        currentUser.stats.gamesPlayed = [];
        
        saveUser();
    }
}

function updateMissionProgress(type, amount = 1) {
    if (!currentUser.dailyMissions) initializeMissions();
    
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
                        showNotification(`✅ Úkol splněn: ${mission.name}`);
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
                        showNotification(`✅ Úkol splněn: ${mission.name}`);
                    }
                    
                    saveUser();
                }
            }
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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
}

async function saveUser() {
    if (!currentUser.id) return;
    
    try {
        const { data: existingUser } = await supabase
            .from('casino_users')
            .select('id')
            .eq('id', currentUser.id)
            .maybeSingle();
        
        if (existingUser) {
            const { error } = await supabase
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
            
            if (error) {
                console.error('Chyba při updatu:', error);
            }
        }
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

function createConfetti() {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * window.innerWidth + "px";
    c.style.top = "-10px";
    c.style.background = `hsl(${Math.random() * 360}, 80%, 60%)`;
    c.style.width = (5 + Math.random() * 10) + "px";
    c.style.height = c.style.width;
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

// Inicializace
window.addEventListener('load', async () => {
    console.log('🎰 Casino inicializace...');
    
    startLoading();
    initReels();
    checkFirstVisit();
    
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
                    currentUser.stats = existingUser.stats || currentUser.stats;
                    currentUser.unlockedAchievements = existingUser.unlocked_achievements || [];
                    currentUser.dailyMissions = existingUser.daily_missions || {};
                    currentUser.lastMissionReset = existingUser.last_mission_reset;
                    
                    initializeMissions();
                    updateUI();
                    
                    console.log('✅ Automaticky přihlášen:', currentUser);
                } else {
                    localStorage.removeItem('currentUser');
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.style.display = 'flex';
                }
            } catch (e) {
                console.error('❌ Chyba při načítání uživatele:', e);
                localStorage.removeItem('currentUser');
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.style.display = 'flex';
            }
        } else {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'flex';
        }
    }, 3500);
});


