import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase konfigurace
const SUPABASE_URL = 'https://bmmaijlbpwgzhrxzxphf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Loading screen logika
function startLoading() {
    const loadingTime = 3000 + Math.random() * 3000; // 3-6 sekund
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
    // Nové statistiky
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
        achievementsUnlocked: 0
    },
    unlockedAchievements: [],
    dailyMissions: {},
    lastMissionReset: null
};

let currentGame = 'slot';
let currentBet = 10;

// SHOP ITEMS
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
    { id: 'emerald', name: '💚 Smaragd', price: 3500, icon: '💚', colors: { 
        primary: '#00ff88', 
        secondary: '#00cc66',
        bg1: '#001a0a',
        bg2: '#003320',
        bgGlow1: 'rgba(0,255,136,0.4)',
        bgGlow2: 'rgba(0,204,102,0.4)'
    }},
    { id: 'royal', name: '👑 Královský', price: 4000, icon: '👑', colors: { 
        primary: '#9400d3', 
        secondary: '#ffd700',
        bg1: '#0a001a',
        bg2: '#200033',
        bgGlow1: 'rgba(148,0,211,0.5)',
        bgGlow2: 'rgba(255,215,0,0.4)'
    }},
    { id: 'toxic', name: '☢️ Toxický', price: 4500, icon: '☢️', colors: { 
        primary: '#39ff14', 
        secondary: '#ccff00',
        bg1: '#0a1a00',
        bg2: '#1a3300',
        bgGlow1: 'rgba(57,255,20,0.5)',
        bgGlow2: 'rgba(204,255,0,0.4)'
    }},
    { id: 'sunset', name: '🌅 Západ slunce', price: 5000, icon: '🌅', colors: { 
        primary: '#ff6b35', 
        secondary: '#ff8c42',
        bg1: '#1a0a00',
        bg2: '#331400',
        bgGlow1: 'rgba(255,107,53,0.4)',
        bgGlow2: 'rgba(255,140,66,0.4)'
    }},
    { id: 'ice', name: '❄️ Ledový', price: 5500, icon: '❄️', colors: { 
        primary: '#00d9ff', 
        secondary: '#a3e4f7',
        bg1: '#000a1a',
        bg2: '#001433',
        bgGlow1: 'rgba(0,217,255,0.4)',
        bgGlow2: 'rgba(163,228,247,0.3)'
    }},
    { id: 'vampire', name: '🧛 Upíří', price: 6000, icon: '🧛', colors: { 
        primary: '#8b0000', 
        secondary: '#dc143c',
        bg1: '#0a0000',
        bg2: '#1a0000',
        bgGlow1: 'rgba(139,0,0,0.5)',
        bgGlow2: 'rgba(220,20,60,0.4)'
    }},
    { id: 'matrix', name: '💻 Matrix', price: 6500, icon: '💻', colors: { 
        primary: '#00ff00', 
        secondary: '#008800',
        bg1: '#000a00',
        bg2: '#001400',
        bgGlow1: 'rgba(0,255,0,0.4)',
        bgGlow2: 'rgba(0,136,0,0.3)'
    }},
    { id: 'galaxy', name: '🌌 Galaxie', price: 7000, icon: '🌌', colors: { 
        primary: '#4b0082', 
        secondary: '#9370db',
        bg1: '#050008',
        bg2: '#0a0010',
        bgGlow1: 'rgba(75,0,130,0.5)',
        bgGlow2: 'rgba(147,112,219,0.4)'
    }},
    { id: 'cherry', name: '🍒 Třešeň', price: 7500, icon: '🍒', colors: { 
        primary: '#ff1493', 
        secondary: '#ff69b4',
        bg1: '#1a0010',
        bg2: '#330020',
        bgGlow1: 'rgba(255,20,147,0.4)',
        bgGlow2: 'rgba(255,105,180,0.3)'
    }},
    { id: 'cyber', name: '🤖 Cyber', price: 8000, icon: '🤖', colors: { 
        primary: '#00ffff', 
        secondary: '#ff00ff',
        bg1: '#000000',
        bg2: '#0a0a0a',
        bgGlow1: 'rgba(0,255,255,0.6)',
        bgGlow2: 'rgba(255,0,255,0.6)'
    }},
    { id: 'diamond', name: '💎 Diamant', price: 9000, icon: '💎', colors: { 
        primary: '#b9f2ff', 
        secondary: '#ffffff',
        bg1: '#0a0a1a',
        bg2: '#14143a',
        bgGlow1: 'rgba(185,242,255,0.4)',
        bgGlow2: 'rgba(255,255,255,0.3)'
    }},
    { id: 'lava', name: '🌋 Láva', price: 10000, icon: '🌋', colors: { 
        primary: '#ff4500', 
        secondary: '#ff0000',
        bg1: '#1a0000',
        bg2: '#330000',
        bgGlow1: 'rgba(255,69,0,0.6)',
        bgGlow2: 'rgba(255,0,0,0.5)'
    }},
    { id: 'mint', name: '🍃 Mátový', price: 11000, icon: '🍃', colors: { 
        primary: '#98ff98', 
        secondary: '#3cb371',
        bg1: '#001a0a',
        bg2: '#003314',
        bgGlow1: 'rgba(152,255,152,0.4)',
        bgGlow2: 'rgba(60,179,113,0.3)'
    }},
    { id: 'lightning', name: '⚡ Blesk', price: 12000, icon: '⚡', colors: { 
        primary: '#ffff00', 
        secondary: '#ffa500',
        bg1: '#1a1a00',
        bg2: '#333300',
        bgGlow1: 'rgba(255,255,0,0.5)',
        bgGlow2: 'rgba(255,165,0,0.4)'
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
    },
    { 
        id: 'jackpot_king', 
        name: 'Jackpot král 👑', 
        desc: 'Vyhrát jackpot (50x)',
        icon: '👑', 
        reward: 500,
        condition: (stats) => stats.jackpots >= 1
    },
    { 
        id: 'wheel_spinner', 
        name: 'Točitel kola', 
        desc: 'Zatočit 50x na kole štěstí',
        icon: '🎡', 
        reward: 150,
        condition: (stats) => stats.wheelSpins >= 50
    },
    { 
        id: 'lucky_streak', 
        name: 'Šťastná série 🍀', 
        desc: '5 výher za sebou',
        icon: '🍀', 
        reward: 300,
        condition: (stats) => stats.winStreak >= 5
    },
    { 
        id: 'big_spender', 
        name: 'Velký sázející', 
        desc: 'Vsadit celkem 5000 mincí',
        icon: '💸', 
        reward: 250,
        condition: (stats) => stats.totalBet >= 5000
    },
    { 
        id: 'millionaire', 
        name: 'Milionář 💰', 
        desc: 'Mít 10000 mincí najednou',
        icon: '💰', 
        reward: 1000,
        condition: (stats) => stats.maxCoins >= 10000
    },
    { 
        id: 'collector', 
        name: 'Sběratel vzhledů 🎨', 
        desc: 'Vlastnit 5 vzhledů',
        icon: '🎨', 
        reward: 400,
        condition: (stats) => stats.themesOwned >= 5
    },
    { 
        id: 'diamond_hunter', 
        name: 'Lovec diamantů', 
        desc: 'Vyhrát 3x s 💎💎💎',
        icon: '💎', 
        reward: 600,
        condition: (stats) => stats.diamondWins >= 3
    },
    { 
        id: 'dedicated', 
        name: 'Oddaný hráč 🔥', 
        desc: 'Přihlásit se 7 dní v řadě',
        icon: '🔥', 
        reward: 500,
        condition: (stats) => stats.loginStreak >= 7
    },
    { 
        id: 'high_roller', 
        name: 'High Roller', 
        desc: 'Vsadit 100 mincí najednou 10x',
        icon: '🎲', 
        reward: 350,
        condition: (stats) => stats.highBets >= 10
    },
    { 
        id: 'legend', 
        name: 'Legenda 🏆', 
        desc: 'Dosáhnout všech ostatních úspěchů',
        icon: '🏆', 
        reward: 2000,
        condition: (stats) => stats.achievementsUnlocked >= achievements.length - 1
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
    },
    { 
        id: 'wheel_5', 
        name: '🎡 Kolo štěstí', 
        desc: 'Zatočit 5x na kole štěstí',
        icon: '🎡',
        reward: 40, 
        target: 5,
        type: 'wheelSpins'
    },
    { 
        id: 'win_500', 
        name: '💰 Denní zisk', 
        desc: 'Vyhrát celkem 500 mincí',
        icon: '💰',
        reward: 100, 
        target: 500,
        type: 'coinsWon'
    },
    { 
        id: 'big_win', 
        name: '⭐ Velká výhra', 
        desc: 'Vyhrát 10x sázku najednou',
        icon: '⭐',
        reward: 75, 
        target: 1,
        type: 'bigWins'
    },
    { 
        id: 'play_both', 
        name: '🎮 Všestranný hráč', 
        desc: 'Zahrát si automat i kolo',
        icon: '🎮',
        reward: 60, 
        target: 2,
        type: 'gamesPlayed'
    }
];

// SLOT MACHINE LOGIC
const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '🎰'];
const symbolWeights = {
    '🍒': 25,
    '🍋': 20,
    '🍊': 18,
    '🍇': 15,
    '🔔': 10,
    '⭐': 7,
    '💎': 4,
    '🎰': 1
};

const winMultipliers = {
    '🍒': 5,
    '🍋': 4,
    '🍊': 6,
    '🍇': 8,
    '🔔': 10,
    '⭐': 15,
    '💎': 20,
    '🎰': 50
};

let reels = [[], [], []];
let spinning = false;

function initReels() {
    for (let i = 0; i < 3; i++) {
        const reel = document.getElementById(`reel${i + 1}`);
        reel.innerHTML = '';
        reels[i] = [];
        
        // Vytvoř více symbolů pro plynulé točení
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
    
    // Odečti sázku
    currentUser.coins -= currentBet;
    
    // ⭐ NOVÉ: Aktualizuj statistiky
    currentUser.stats.slotSpins++;
    currentUser.stats.totalBet += currentBet;
    
    // High bet tracking
    if (currentBet >= 100) {
        currentUser.stats.highBets++;
    }
    
    // ⭐ NOVÉ: Mission progress - automat
    updateMissionProgress('slotSpins', 1);
    updateMissionProgress('gamesPlayed', 'slot');
    
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
    
    document.querySelectorAll('.reel').forEach(reel => {
        reel.classList.add('spinning');
    });
    
    const spinDurations = [2500, 3200, 3900];
    const symbolHeight = 100; // Nebo použij: parseFloat(getComputedStyle(document.querySelector('.symbol')).height);
    
    for (let i = 0; i < 3; i++) {
        const reel = document.getElementById(`reel${i + 1}`);
        const reelElement = reel.parentElement;
        
        let targetIndex = -1;
        for (let j = 0; j < reels[i].length; j++) {
            if (reels[i][j] === results[i]) {
                targetIndex = j;
                break;
            }
        }
        
        if (targetIndex === -1) targetIndex = 10;
        
        const targetPosition = -(targetIndex * symbolHeight - symbolHeight);
        
        const spinSpeed = 15;
        let currentPos = 0;
        const spinInterval = setInterval(() => {
            currentPos -= spinSpeed;
            reel.style.transform = `translateY(${currentPos}px)`;
            
            if (Math.abs(currentPos) > reels[i].length * symbolHeight / 2) {
                currentPos = 0;
            }
        }, 16);
        
        setTimeout(() => {
            clearInterval(spinInterval);
            
            reelElement.classList.remove('spinning');
            reelElement.classList.add('stopping');
            
            reel.style.transition = 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            reel.style.transform = `translateY(${targetPosition}px)`;
            
            setTimeout(() => {
                reelElement.classList.remove('stopping');
            }, 800);
        }, spinDurations[i]);
    }
    
    setTimeout(() => {
        evaluateSlotWin(results);
    }, 5200);
};

async function evaluateSlotWin(results) {
    let winAmount = 0;
    let message = '';
    
    if (results[0] === results[1] && results[1] === results[2]) {
        const multiplier = winMultipliers[results[0]];
        winAmount = currentBet * multiplier;
        
        // ⭐ NOVÉ: Statistiky výher
        currentUser.stats.totalWins++;
        currentUser.stats.currentStreak++;
        currentUser.stats.coinsWon += winAmount;
        
        // Kontrola win streak
        if (currentUser.stats.currentStreak > currentUser.stats.winStreak) {
            currentUser.stats.winStreak = currentUser.stats.currentStreak;
        }
        
        // Speciální výhry
        if (results[0] === '🎰') {
            message = `🎰 MEGA JACKPOT! 🎰 +${winAmount} 🪙`;
            currentUser.stats.jackpots++;
        } else if (results[0] === '💎') {
            message = `💎 DIAMANTOVÁ VÝHRA! 💎 +${winAmount} 🪙`;
            currentUser.stats.diamondWins++;
        } else {
            message = `🎉 VÝHRA! 🎉 +${winAmount} 🪙`;
        }
        
        // Big win tracking
        if (multiplier >= 10) {
            updateMissionProgress('bigWins', 1);
        }
        
        // ⭐ NOVÉ: Mission progress - výhry
        updateMissionProgress('coinsWon', winAmount);
        
    } else {
        message = '😢 Zkuste to znovu!';
        currentUser.stats.currentStreak = 0;
    }
    
    document.getElementById('slotResult').textContent = message;
    
    if (winAmount > 0) {
        currentUser.coins += winAmount;
        
        // ⭐ NOVÉ: Kontrola achievementů
        checkAchievements();
        
        await saveUser();
        updateUI();
        
        document.getElementById('winAmount').textContent = `+${winAmount} 🪙`;
        document.getElementById('winModal').style.display = 'flex';
        
        if (winAmount >= currentBet * 10) {
            for (let i = 0; i < 100; i++) {
                setTimeout(() => createConfetti(), i * 10);
            }
        }
    } else {
        await saveUser();
    }
    
    spinning = false;
    document.getElementById('spinSlotBtn').disabled = false;
}

window.setBet = function(amount) {
    currentBet = amount;
    document.getElementById('currentBet').textContent = amount;
    
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
};

// WHEEL OF FORTUNE LOGIC
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const center = 200;

const wheelPrizes = [
    { coins: 0, color: '#666666', weight: 50 },
    { coins: 5, color: '#ff0080', weight: 20 },
    { coins: 15, color: '#00ff80', weight: 15 },
    { coins: 25, color: '#0080ff', weight: 10 },
    { coins: 50, color: '#ff8000', weight: 4 },
    { coins: 100, color: '#ffff00', weight: 1 }
];

let rotation = 0;
let wheelSpinning = false;
let autoRotating = true;

function drawWheel() {
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
autoRotate();

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
    
    // ⭐ NOVÉ: Statistiky kola
    currentUser.stats.wheelSpins++;
    updateMissionProgress('wheelSpins', 1);
    updateMissionProgress('gamesPlayed', 'wheel');
    
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

async function finishWheelSpin(coinWin) {
    wheelSpinning = false;
    document.getElementById('spinWheelBtn').disabled = false;
    autoRotating = true;
    
    currentUser.coins += coinWin;
    
    // ⭐ NOVÉ: Statistiky
    if (coinWin > 0) {
        currentUser.stats.totalWins++;
        currentUser.stats.coinsWon += coinWin;
        updateMissionProgress('coinsWon', coinWin);
    }
    
    // ⭐ NOVÉ: Kontrola achievementů
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

// SHOP LOGIC
function loadShop() {
    const grid = document.getElementById('shopGrid');
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
    
    await saveUser();
    updateUI();
    loadShop();
    
    document.getElementById('winAmount').textContent = `Koupeno: ${item.name}!`;
    document.getElementById('winModal').style.display = 'flex';
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 20);
    }
};

window.activateTheme = async function(themeId) {
    const item = shopItems.find(i => i.id === themeId);
    
    if (!item) return;
    
    if (!currentUser.ownedThemes.includes(themeId)) {
        alert('Nejdřív musíte tento vzhled koupit!');
        return;
    }
    
    currentUser.activeTheme = themeId;
    await saveUser();
    applyTheme(item.colors);
    loadShop();
    
    alert(`✅ Vzhled ${item.name} byl aktivován!`);
};

function applyTheme(colors) {
    // CSS proměnné pro globální použití
    document.documentElement.style.setProperty('--theme-primary', colors.primary);
    document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
    
    // Pozadí body
    document.body.style.background = `linear-gradient(135deg, ${colors.bg1} 0%, ${colors.bg2} 50%, ${colors.bg1} 100%)`;
    
    const bodyBefore = document.querySelector('body::before');
    const style = document.createElement('style');
    style.textContent = `
        body::before {
            background: 
                radial-gradient(circle at 20% 50%, ${colors.bgGlow1} 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, ${colors.bgGlow2} 0%, transparent 50%) !important;
        }
        
        #topBar {
            border-bottom-color: ${colors.primary} !important;
            box-shadow: 0 5px 30px ${colors.primary}99 !important;
        }
        
        #coinDisplay {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 25px ${colors.primary}dd !important;
        }
        
        #dailyBonus {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 20px ${colors.primary}99 !important;
        }
        
        #shopBtn {
            background: linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%) !important;
            border-color: ${colors.secondary} !important;
            box-shadow: 0 0 20px ${colors.secondary}99 !important;
        }
        
        #slotBtn.active {
            box-shadow: 0 0 30px ${colors.primary} !important;
        }
        
        #wheelBtn.active {
            box-shadow: 0 0 30px ${colors.secondary} !important;
        }
        
        #leaderboardBtn.active {
            box-shadow: 0 0 30px ${colors.primary} !important;
        }
        
        #slotMachine, .paytable, #leaderboardFull {
            background: linear-gradient(135deg, ${colors.bg2}cc 0%, ${colors.bg1}cc 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 50px ${colors.primary}dd !important;
        }
        
        .reel {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 20px ${colors.primary}88 !important;
        }
        
        .reel-window {
            border-color: ${colors.secondary} !important;
            box-shadow: 0 0 15px ${colors.secondary}bb !important;
        }
        
        #spinSlotBtn {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 30px ${colors.primary}99 !important;
        }
        
        #spinSlotBtn:hover {
            box-shadow: 0 0 40px ${colors.primary}dd !important;
        }
        
        #spinWheelBtn {
            background: linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%) !important;
            border-color: ${colors.secondary} !important;
            box-shadow: 0 0 30px ${colors.secondary}99 !important;
        }
        
        .bet-btn.active {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 20px ${colors.primary}cc !important;
        }
        
        .leaderboard-item:hover {
            background: ${colors.primary}33 !important;
            box-shadow: 0 0 20px ${colors.primary}88 !important;
        }
        
        .shop-item {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 30px ${colors.primary}88 !important;
        }
        
        .shop-item:hover {
            box-shadow: 0 0 50px ${colors.primary}cc !important;
        }
        
        .modal-content {
            background: linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg1} 100%) !important;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 100px ${colors.primary}dd !important;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
        }
        
        canvas {
            border-color: ${colors.secondary} !important;
            box-shadow: 0 0 50px ${colors.primary}dd !important;
        }
        
        .pointer {
            border-top-color: ${colors.secondary} !important;
            filter: drop-shadow(0 0 10px ${colors.secondary}) !important;
        }
        
        .wheelCenter {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%) !important;
            border-color: ${colors.secondary} !important;
            box-shadow: 0 0 20px ${colors.secondary}cc !important;
        }
    `;
    
    // Odstraň starý style, pokud existuje
    const oldStyle = document.getElementById('theme-style');
    if (oldStyle) oldStyle.remove();
    
    style.id = 'theme-style';
    document.head.appendChild(style);
    
    // Textové elementy
    const userName = document.getElementById('userName');
    if (userName) {
        userName.style.color = colors.primary;
        userName.style.textShadow = `0 0 15px ${colors.primary}, 0 0 30px ${colors.secondary}`;
    }
    
    const slotTitle = document.getElementById('slotTitle');
    if (slotTitle) {
        slotTitle.style.color = colors.primary;
        slotTitle.style.textShadow = `0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary}`;
    }
    
    const wheelTitle = document.getElementById('wheelTitle');
    if (wheelTitle) {
        wheelTitle.style.color = colors.secondary;
        wheelTitle.style.textShadow = `0 0 15px ${colors.secondary}, 0 0 30px ${colors.primary}`;
    }
    
    const betAmount = document.getElementById('betAmount');
    if (betAmount) {
        betAmount.style.color = colors.primary;
        betAmount.style.textShadow = `0 0 10px ${colors.primary}`;
    }
    
    const slotResult = document.getElementById('slotResult');
    if (slotResult) {
        slotResult.style.color = colors.primary;
        slotResult.style.textShadow = `0 0 15px ${colors.primary}`;
    }
    
    const wheelCost = document.getElementById('wheelCost');
    if (wheelCost) {
        wheelCost.style.color = colors.secondary;
        wheelCost.style.textShadow = `0 0 10px ${colors.secondary}`;
    }
    
    // Paytable nadpis
    const paytableTitle = document.querySelector('.paytable h3');
    if (paytableTitle) {
        paytableTitle.style.color = colors.primary;
        paytableTitle.style.textShadow = `0 0 15px ${colors.primary}`;
    }
    
    // Leaderboard nadpis
    const leaderboardTitle = document.querySelector('#leaderboardFull h2');
    if (leaderboardTitle) {
        leaderboardTitle.style.color = colors.primary;
        leaderboardTitle.style.textShadow = `0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary}`;
    }
    
    // Shop nadpis
    const shopTitle = document.querySelector('#shopGame h2');
    if (shopTitle) {
        shopTitle.style.color = colors.primary;
        shopTitle.style.textShadow = `0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary}`;
    }
    
    // Všechny leaderboard položky
    document.querySelectorAll('.leaderboard-rank').forEach(el => {
        el.style.color = colors.secondary;
    });
    
    document.querySelectorAll('.leaderboard-coins').forEach(el => {
        el.style.color = colors.primary;
    });
    
    // Shop názvy
    document.querySelectorAll('.shop-name').forEach(el => {
        el.style.color = colors.primary;
        el.style.textShadow = `0 0 10px ${colors.primary}`;
    });
    
    // Modal nadpisy
    document.querySelectorAll('.modal h2').forEach(el => {
        el.style.color = colors.primary;
        el.style.textShadow = `0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary}`;
    });
    
    console.log('✨ Téma aplikováno:', colors);
}

// GAME SWITCHING
window.switchGame = function(game) {
    currentGame = game;
    
    document.querySelectorAll('.game-container').forEach(container => {
        container.classList.remove('active');
    });
    
    document.querySelectorAll('.game-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (game === 'slot') {
        document.getElementById('slotGame').classList.add('active');
        document.getElementById('slotBtn').classList.add('active');
    } else if (game === 'wheel') {
        document.getElementById('wheelGame').classList.add('active');
        document.getElementById('wheelBtn').classList.add('active');
    } else if (game === 'missions') {
        document.getElementById('missionsGame').classList.add('active');
        document.getElementById('missionsBtn').classList.add('active');
        loadMissions();
    } else if (game === 'achievements') {
        document.getElementById('achievementsGame').classList.add('active');
        document.getElementById('achievementsBtn').classList.add('active');
        loadAchievements();
    } else if (game === 'leaderboard') {
        document.getElementById('leaderboardGame').classList.add('active');
        document.getElementById('leaderboardBtn').classList.add('active');
        loadLeaderboard();
    } else if (game === 'shop') {
        document.getElementById('shopGame').classList.add('active');
        loadShop();
    }
};
// USER MANAGEMENT
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
        const { data: existingUser, error: searchError } = await supabase
            .from('casino_users')
            .select('*')
            .eq('nickname', nickname)
            .maybeSingle();
        
        if (existingUser) {
            // Uživatel existuje - načti jeho data
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
            
            localStorage.setItem('currentUser', JSON.stringify({
                id: currentUser.id,
                username: currentUser.nickname
            }));
            
            console.log('✅ Uživatel přihlášen:', currentUser);
        } else {
            // Nový uživatel - vytvoř účet
            currentUser.nickname = nickname;
            currentUser.coins = 100;
            currentUser.lastDailyBonus = new Date().toISOString().split('T')[0];
            currentUser.ownedThemes = ['default'];
            currentUser.activeTheme = 'default';
            
            const { data: newUser, error: insertError } = await supabase
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
            
            if (insertError) {
                throw insertError;
            }
            
            currentUser.id = newUser.id;
            
            localStorage.setItem('currentUser', JSON.stringify({
                id: currentUser.id,
                username: currentUser.nickname
            }));
            
            console.log('✅ Nový uživatel vytvořen:', currentUser);
        }
        
        // ⭐ NOVÉ: Inicializuj mise
        initializeMissions();
        
        // Aplikuj téma
        const activeItem = shopItems.find(i => i.id === currentUser.activeTheme);
        if (activeItem) {
            applyTheme(activeItem.colors);
        }
        
        // Zavři modal a zobraz hru
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
function updateUI() {
    document.getElementById('userName').textContent = currentUser.nickname;
    document.getElementById('coinAmount').textContent = currentUser.coins;
}

window.claimDailyBonus = async function() {
    const today = new Date().toISOString().split('T')[0];
    
    if (currentUser.lastDailyBonus === today) {
        alert('Denní bonus již byl vybrán! Přijďte zítra! 🎁');
        return;
    }
    
    const bonus = 100;
    currentUser.coins += bonus;
    currentUser.lastDailyBonus = today;
    
    await saveUser();
    updateUI();
    
    document.getElementById('winAmount').textContent = `+${bonus} 🪙 DENNÍ BONUS!`;
    document.getElementById('winModal').style.display = 'flex';
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 20);
    }
    
    checkDailyBonus();
};
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
function checkDailyBonus() {
    const today = new Date().toISOString().split('T')[0];
    const btn = document.getElementById('dailyBonus');
    
    if (currentUser.lastDailyBonus === today) {
        btn.disabled = true;
        btn.textContent = '✅ BONUS VYBRÁN';
    } else {
        btn.disabled = false;
        btn.textContent = '🎁 DENNÍ BONUS';
    }
}

// LEADERBOARD
async function loadLeaderboard() {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '<div style="text-align: center; color: #fff; font-size: 20px;">Načítám žebříček...</div>';
    
    const { data, error } = await supabase
        .from('casino_users')
        .select('*')
        .order('coins', { ascending: false })
        .limit(50);
    
    list.innerHTML = '';
    
    if (error || !data || data.length === 0) {
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
// ACHIEVEMENTS & MISSIONS LOGIC

function initializeMissions() {
    const today = new Date().toISOString().split('T')[0];
    
    if (currentUser.lastMissionReset !== today) {
        // Reset denních úkolů
        currentUser.lastMissionReset = today;
        currentUser.dailyMissions = {};
        
        dailyMissions.forEach(mission => {
            currentUser.dailyMissions[mission.id] = {
                progress: 0,
                completed: false,
                claimed: false
            };
        });
        
        // Reset denních statistik
        if (!currentUser.stats) currentUser.stats = {};
        currentUser.stats.coinsWon = 0;
        currentUser.stats.bigWins = 0;
        currentUser.stats.gamesPlayed = [];
        
        saveUser();
    }
}


function updateMissionProgress(type, amount = 1) {
    if (!currentUser.dailyMissions) initializeMissions();
    
    // Speciální handling pro gamesPlayed
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
        // Normální progress update
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
                    if (currentGame === 'missions') loadMissions();
                }
            }
        });
    }
}


function checkAchievements() {
    if (!currentUser.stats) return;
    
    // Aktualizuj themesOwned
    currentUser.stats.themesOwned = currentUser.ownedThemes.length;
    
    // Aktualizuj maxCoins
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

function loadMissions() {
    const list = document.getElementById('missionsList');
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
    
    await saveUser();
    updateUI();
    loadMissions();
    
    document.getElementById('winAmount').textContent = `+${mission.reward} 🪙`;
    document.getElementById('winModal').style.display = 'flex';
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 20);
    }
};

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
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
            // Pokračující streak
            currentUser.stats.loginStreak++;
        } else if (diffDays > 1) {
            // Přerušený streak
            currentUser.stats.loginStreak = 1;
        }
        // diffDays === 0 znamená stejný den, neděláme nic
    } else {
        // První přihlášení
        currentUser.stats.loginStreak = 1;
    }
    
    currentUser.stats.lastLogin = today;
}
// UTILITIES
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
    document.getElementById('winModal').style.display = 'none';
};

document.getElementById('nicknameInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
});

// Inicializace
// Inicializace
window.addEventListener('load', async () => {
    console.log('🎰 Casino inicializace...');
    
    startLoading();
    initReels();
    
    setTimeout(async () => {
        const savedUser = localStorage.getItem('currentUser');
        
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                
                const { data: existingUser, error } = await supabase
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
                    
                    // ⭐ NOVÉ: Inicializuj mise
                    initializeMissions();
                    
                    const activeItem = shopItems.find(i => i.id === currentUser.activeTheme);
                    if (activeItem) {
                        applyTheme(activeItem.colors);
                    }
                    
                    updateUI();
                    checkDailyBonus();
                    
                    console.log('✅ Automaticky přihlášen:', currentUser);
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

</script>
