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
// === PŘIDEJ TYTO FUNKCE NA KONEC script.js ===

// Přepínání mezi hrami
window.switchGame = function(game) {
    currentGame = game;
    
    // Skryj všechny hry
    document.querySelectorAll('.game-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Odstraň aktivní třídu ze všech tlačítek
    document.querySelectorAll('.game-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Zobraz vybranou hru
    const games = {
        'slot': 'slotGame',
        'wheel': 'wheelGame',
        'leaderboard': 'leaderboardGame',
        'shop': 'shopGame',
        'missions': 'missionsGame',
        'achievements': 'achievementsGame'
    };
    
    const gameId = games[game];
    const gameElement = document.getElementById(gameId);
    if (gameElement) {
        gameElement.classList.add('active');
    }
    
    // Aktivuj správné tlačítko
    const btnId = game + 'Btn';
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.classList.add('active');
    }
    
    // Speciální akce pro konkrétní hry
    if (game === 'leaderboard') {
        loadLeaderboard();
    } else if (game === 'shop') {
        loadShop();
    } else if (game === 'missions') {
        loadMissions();
    } else if (game === 'achievements') {
        loadAchievements();
    } else if (game === 'wheel') {
        initWheel();
    }
}

// Funkce pro přihlášení
window.login = async function() {
    const nicknameInput = document.getElementById('nicknameInput');
    const nickname = nicknameInput.value.trim();
    
    if (nickname.length < 3) {
        alert('Přezdívka musí mít alespoň 3 znaky!');
        return;
    }
    
    try {
        // Vytvoř nového uživatele v databázi
        const { data, error } = await supabase
            .from('casino_users')
            .insert([{
                nickname: nickname,
                coins: 1000,
                owned_themes: ['default'],
                active_theme: 'default',
                stats: currentUser.stats,
                unlocked_achievements: [],
                daily_missions: {},
                last_mission_reset: new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        currentUser.id = data.id;
        currentUser.nickname = data.nickname;
        currentUser.coins = data.coins;
        currentUser.ownedThemes = data.owned_themes;
        currentUser.activeTheme = data.active_theme;
        currentUser.stats = data.stats;
        currentUser.unlockedAchievements = data.unlocked_achievements || [];
        currentUser.dailyMissions = data.daily_missions || {};
        currentUser.lastMissionReset = data.last_mission_reset;
        
        localStorage.setItem('currentUser', JSON.stringify({ id: currentUser.id }));
        
        initializeMissions();
        updateUI();
        
        document.getElementById('loginModal').style.display = 'none';
        
        console.log('✅ Úspěšně přihlášen:', currentUser);
    } catch (e) {
        console.error('❌ Chyba při přihlášení:', e);
        alert('Chyba při přihlášení. Zkuste to znovu.');
    }
}

// Funkce pro zatočení na automatu
window.spinSlot = async function() {
    if (spinning) return;
    if (currentUser.coins < currentBet) {
        alert('Nemáš dostatek mincí!');
        return;
    }
    
    spinning = true;
    const spinBtn = document.getElementById('spinSlotBtn');
    const resultDiv = document.getElementById('slotResult');
    
    spinBtn.disabled = true;
    resultDiv.textContent = '';
    
    // Odečti sázku
    currentUser.coins -= currentBet;
    currentUser.stats.totalBet += currentBet;
    currentUser.stats.slotSpins++;
    updateUI();
    
    // Animace zatáčení
    const reelElements = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    
    reelElements.forEach(reel => {
        reel.parentElement.classList.add('spinning');
    });
    
    // Náhodné symboly pro výsledek
    const results = [
        getWeightedSymbol(),
        getWeightedSymbol(),
        getWeightedSymbol()
    ];
    
    // Zastav válce postupně
    const delays = [1500, 2000, 2500];
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const reel = reelElements[i];
            const targetSymbol = results[i];
            const symbolIndex = reels[i].indexOf(targetSymbol);
            
            reel.parentElement.classList.remove('spinning');
            reel.parentElement.classList.add('stopping');
            
            // Nastav pozici válce
            reel.style.transform = `translateY(-${symbolIndex * 100}px)`;
            
            setTimeout(() => {
                reel.parentElement.classList.remove('stopping');
            }, 300);
        }, delays[i]);
    }
    
    // Vyhodnocení výsledku
    setTimeout(async () => {
        if (results[0] === results[1] && results[1] === results[2]) {
            // VÝHRA!
            const symbol = results[0];
            const multiplier = winMultipliers[symbol];
            const winAmount = currentBet * multiplier;
            
            currentUser.coins += winAmount;
            currentUser.stats.totalWins++;
            currentUser.stats.coinsWon += winAmount;
            
            if (symbol === '💎') {
                currentUser.stats.diamondWins++;
            }
            if (symbol === '🎰') {
                currentUser.stats.jackpots++;
            }
            if (winAmount >= 500) {
                currentUser.stats.bigWins++;
            }
            
            resultDiv.textContent = `🎉 VÝHRA! +${winAmount} 🪙`;
            resultDiv.style.color = '#00ff00';
            
            // Zvýrazni výherní symboly
            document.querySelectorAll('.symbol').forEach(sym => {
                if (sym.textContent === symbol) {
                    sym.classList.add('win');
                }
            });
            
            // Konfety
            for (let i = 0; i < 50; i++) {
                setTimeout(() => createConfetti(), i * 30);
            }
            
            // Modal pro velké výhry
            if (winAmount >= 100) {
                document.getElementById('winAmount').textContent = `+${winAmount} 🪙`;
                document.getElementById('winModal').style.display = 'flex';
            }
            
            updateMissionProgress('slotSpins', 1);
            updateMissionProgress('gamesPlayed', 'slot');
            checkAchievements();
        } else {
            resultDiv.textContent = 'Bohužel, zkus to znovu!';
            resultDiv.style.color = '#ff0080';
            updateMissionProgress('slotSpins', 1);
        }
        
        await saveUser();
        updateUI();
        
        spinning = false;
        spinBtn.disabled = false;
        
        // Odstraň výherní třídu po chvíli
        setTimeout(() => {
            document.querySelectorAll('.symbol.win').forEach(sym => {
                sym.classList.remove('win');
            });
        }, 2000);
    }, 3000);
}

// Denní bonus
window.claimDailyBonus = async function() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (currentUser.lastDailyBonus === today) {
        alert('Dnešní bonus už jsi vyzvedl!');
        return;
    }
    
    const bonusAmount = 500;
    currentUser.coins += bonusAmount;
    currentUser.lastDailyBonus = today;
    
    await saveUser();
    updateUI();
    
    alert(`🎁 Denní bonus vyzvednut! +${bonusAmount} 🪙`);
    
    const btn = document.getElementById('dailyBonus');
    btn.disabled = true;
    btn.textContent = '✅ VYZVEDNUTΟ';
}

// Načtení žebříčku
async function loadLeaderboard() {
    try {
        const { data, error } = await supabase
            .from('casino_users')
            .select('nickname, coins')
            .order('coins', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        const list = document.getElementById('leaderboardList');
        list.innerHTML = '';
        
        data.forEach((user, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item' + (index < 3 ? ' top3' : '');
            
            const medals = ['🥇', '🥈', '🥉'];
            const rankText = index < 3 ? medals[index] : `#${index + 1}`;
            
            item.innerHTML = `
                <div class="leaderboard-rank">${rankText}</div>
                <div class="leaderboard-name">${user.nickname}</div>
                <div class="leaderboard-coins">${user.coins} 🪙</div>
            `;
            
            list.appendChild(item);
        });
    } catch (e) {
        console.error('Chyba při načítání žebříčku:', e);
    }
}

// Načtení obchodu
function loadShop() {
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';
    
    shopItems.forEach(item => {
        const owned = currentUser.ownedThemes.includes(item.id);
        const canAfford = currentUser.coins >= item.price;
        
        const div = document.createElement('div');
        div.className = 'shop-item' + (owned ? ' owned' : '');
        
        div.innerHTML = `
            <div class="shop-icon">${item.icon}</div>
            <div class="shop-name">${item.name}</div>
            <div class="shop-price">${item.price} 🪙</div>
            <button class="shop-buy-btn" 
                    ${owned ? 'disabled' : ''} 
                    ${!canAfford && !owned ? 'disabled' : ''}
                    onclick="buyTheme('${item.id}')">
                ${owned ? '✅ VLASTNÍŠ' : (canAfford ? 'KOUPIT' : '🔒 ZAMČENO')}
            </button>
        `;
        
        grid.appendChild(div);
    });
}

// Nákup motivu
window.buyTheme = async function(themeId) {
    const theme = shopItems.find(t => t.id === themeId);
    if (!theme) return;
    
    if (currentUser.coins < theme.price) {
        alert('Nemáš dostatek mincí!');
        return;
    }
    
    currentUser.coins -= theme.price;
    currentUser.ownedThemes.push(themeId);
    currentUser.activeTheme = themeId;
    
    await saveUser();
    updateUI();
    loadShop();
    
    alert(`✅ Zakoupeno: ${theme.name}`);
}

// Načtení úkolů
function loadMissions() {
    const list = document.getElementById('missionsList');
    list.innerHTML = '';
    
    dailyMissions.forEach(mission => {
        const missionData = currentUser.dailyMissions[mission.id] || { progress: 0, completed: false, claimed: false };
        
        const div = document.createElement('div');
        div.className = 'mission-item' + (missionData.completed ? ' completed' : '');
        
        const progressPercent = Math.min((missionData.progress / mission.target) * 100, 100);
        
        div.innerHTML = `
            <div class="mission-icon">${mission.icon}</div>
            <div class="mission-info">
                <div class="mission-name">${mission.name}</div>
                <div class="mission-desc">${mission.desc}</div>
                <div class="mission-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${missionData.progress} / ${mission.target}</div>
                </div>
            </div>
            <div class="mission-reward">
                ${missionData.completed && !missionData.claimed ? 
                    `<button class="claim-btn" onclick="claimMission('${mission.id}')">VYZVEDNOUT</button>` : 
                    `+${mission.reward} 🪙`}
            </div>
            ${missionData.claimed ? '<div class="completed-badge">✅ HOTOVO</div>' : ''}
        `;
        
        list.appendChild(div);
    });
}

// Vyzvednutí úkolu
window.claimMission = async function(missionId) {
    const mission = dailyMissions.find(m => m.id === missionId);
    if (!mission) return;
    
    const missionData = currentUser.dailyMissions[missionId];
    if (!missionData.completed || missionData.claimed) return;
    
    currentUser.coins += mission.reward;
    missionData.claimed = true;
    
    await saveUser();
    updateUI();
    loadMissions();
    
    showNotification(`✅ Úkol vyzveden! +${mission.reward} 🪙`);
}

// Načtení úspěchů
function loadAchievements() {
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';
    
    achievements.forEach(achievement => {
        const unlocked = currentUser.unlockedAchievements.includes(achievement.id);
        
        const div = document.createElement('div');
        div.className = 'achievement-item' + (unlocked ? ' completed' : ' locked');
        
        div.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
            <div class="achievement-reward">+${achievement.reward} 🪙</div>
            ${unlocked ? '<div class="completed-badge">✅ ODEMČENO</div>' : ''}
        `;
        
        list.appendChild(div);
    });
}

// Inicializace kola štěstí
let wheelCanvas, wheelCtx, wheelSpinning = false;

function initWheel() {
    wheelCanvas = document.getElementById('wheel');
    if (!wheelCanvas) return;
    
    wheelCtx = wheelCanvas.getContext('2d');
    drawWheel(0);
}

function drawWheel(rotation) {
    if (!wheelCtx || !wheelCanvas) return;
    
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = 180;
    
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    const segments = [
        { text: '10', color: '#ff0080', value: 10 },
        { text: '50', color: '#00ffff', value: 50 },
        { text: '25', color: '#ffff00', value: 25 },
        { text: '100', color: '#00ff00', value: 100 },
        { text: '5', color: '#ff00ff', value: 5 },
        { text: '200', color: '#ffd700', value: 200 },
        { text: '15', color: '#ff8800', value: 15 },
        { text: '500', color: '#ff1493', value: 500 }
    ];
    
    const anglePerSegment = (Math.PI * 2) / segments.length;
    
    segments.forEach((segment, i) => {
        const startAngle = rotation + i * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;
        
        wheelCtx.beginPath();
        wheelCtx.moveTo(centerX, centerY);
        wheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
        wheelCtx.fillStyle = segment.color;
        wheelCtx.fill();
        wheelCtx.strokeStyle = '#000';
        wheelCtx.lineWidth = 2;
        wheelCtx.stroke();
        
        wheelCtx.save();
        wheelCtx.translate(centerX, centerY);
        wheelCtx.rotate(startAngle + anglePerSegment / 2);
        wheelCtx.textAlign = 'center';
        wheelCtx.fillStyle = '#000';
        wheelCtx.font = 'bold 24px Bangers';
        wheelCtx.fillText(segment.text, radius * 0.7, 8);
        wheelCtx.restore();
    });
}

// Zatočení kolem
window.spinWheel = async function() {
    if (wheelSpinning) return;
    if (currentUser.coins < 10) {
        alert('Nemáš dostatek mincí! (10 🪙)');
        return;
    }
    
    wheelSpinning = true;
    currentUser.coins -= 10;
    currentUser.stats.wheelSpins++;
    updateUI();
    
    const btn = document.getElementById('spinWheelBtn');
    btn.disabled = true;
    
    const prizes = [10, 50, 25, 100, 5, 200, 15, 500];
    const targetPrize = prizes[Math.floor(Math.random() * prizes.length)];
    const targetIndex = prizes.indexOf(targetPrize);
    
    const spins = 5;
    const anglePerSegment = (Math.PI * 2) / 8;
    const targetAngle = spins * Math.PI * 2 + targetIndex * anglePerSegment;
    
    const duration = 3000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const currentAngle = eased * targetAngle;
        drawWheel(currentAngle);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            currentUser.coins += targetPrize;
            currentUser.stats.coinsWon += targetPrize;
            
            updateMissionProgress('wheelSpins', 1);
            updateMissionProgress('gamesPlayed', 'wheel');
            
            saveUser();
            updateUI();
            checkAchievements();
            
            alert(`🎉 Výhra: ${targetPrize} 🪙!`);
            
            wheelSpinning = false;
            btn.disabled = false;
        }
    }
    
    animate();
}
