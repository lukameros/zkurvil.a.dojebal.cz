// ===== IMPORTS =====
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// ===== SUPABASE SETUP =====
const SUPABASE_URL = 'https://bmmaijlbpwgzhrxzxphf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ===== GAME STATE VARIABLES =====
let selectedDifficulty = 'medium'
let mapRows = 20
let mapCols = 10
let currentTheme = 'classic'

let score = 0
let level = 1
let linesCleared = 0
let combo = 0
let dropInterval = 500
let dropTimeout
let isPaused = false
let isGameOver = false
let canHold = true
let earnedCoinsThisGame = 0

let grid = []
let current = null
let nextPiece = null
let holdPiece = null

// ===== PLAYER PROGRESSION =====
let playerLevel = 1
let playerXP = 0
let playerCoins = 0
let unlockedThemes = ['classic', 'neon']
let unlockedMaps = ['20x10', '18x12']
let totalGamesPlayed = 0
let activeEvent = null
let eventTimeout = null
let canRotate = true
let currentUser = null

// ===== SETTINGS =====
let soundEnabled = true
let currentLanguage = 'cs'

// ===== CONSTANTS =====
const HAPPY_HOURS = [15, 20]

const xpRequirements = [
    0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250
]

const themes = {
    classic: ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'],
    neon: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff0080', '#0080ff', '#ff8000'],
    fire: ['#ff0000', '#ff4500', '#ff6347', '#ff7f50', '#ffa500', '#ffb84d', '#ff8c00'],
    ice: ['#00bfff', '#4169e1', '#1e90ff', '#87ceeb', '#add8e6', '#b0e0e6', '#87cefa'],
    forest: ['#228b22', '#32cd32', '#3cb371', '#2e8b57', '#00fa9a', '#90ee90', '#98fb98'],
    sunset: ['#ff6347', '#ff7f50', '#ffa500', '#ff8c00', '#ff4500', '#ff69b4', '#ff1493'],
    ocean: ['#006994', '#0080b3', '#0099cc', '#00b3e6', '#33ccff', '#66d9ff', '#99e6ff'],
    candy: ['#ff69b4', '#ffb6c1', '#ff1493', '#ff82ab', '#ffc0cb', '#ffaec9', '#ff4da6'],
    galaxy: ['#4b0082', '#8a2be2', '#9370db', '#9932cc', '#ba55d3', '#da70d6', '#ee82ee'],
    toxic: ['#7fff00', '#adff2f', '#00ff00', '#32cd32', '#39ff14', '#98fb98', '#ccff00'],
    rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
    gold: ['#ffd700', '#ffdf00', '#ffb347', '#daa520', '#b8860b', '#cd853f', '#ff8c00'],
    matrix: ['#00ff00', '#00cc00', '#00aa00', '#008800', '#00ff41', '#33ff33', '#66ff66'],
    lava: ['#8b0000', '#b22222', '#dc143c', '#ff4500', '#ff6347', '#ff7f50', '#ffa07a'],
    midnight: ['#191970', '#000080', '#00008b', '#0000cd', '#4169e1', '#6495ed', '#1e3a8a'],
    crystal: ['#e0ffff', '#afeeee', '#add8e6', '#87ceeb', '#b0e0e6', '#d4f1f4', '#c0f0f5']
}

const shapes = [
    {shape: [[1,1,1,1]], name: 'I'},
    {shape: [[1,1],[1,1]], name: 'O'},
    {shape: [[0,1,0],[1,1,1]], name: 'T'},
    {shape: [[0,1,1],[1,1,0]], name: 'S'},
    {shape: [[1,1,0],[0,1,1]], name: 'Z'},
    {shape: [[1,0,0],[1,1,1]], name: 'J'},
    {shape: [[0,0,1],[1,1,1]], name: 'L'}
]

const eventTypes = [
    {
        name: '⚡ TURBO SPEED',
        description: 'Bloky padají 3× rychleji!',
        duration: 10000,
        color: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 140, 0, 0.95))',
        onStart: () => { dropInterval = Math.max(50, dropInterval / 3) },
        onEnd: () => {
            const baseSpeed = selectedDifficulty === 'easy' ? 800 : 
                             selectedDifficulty === 'medium' ? 600 : 
                             selectedDifficulty === 'hard' ? 400 : 250
            const speedMultiplier = Math.max(0.25, 1 - (Math.floor(score / 1000) * 0.08))
            dropInterval = Math.max(100, Math.floor(baseSpeed * speedMultiplier))
        }
    },
    {
        name: '🚫 NO ROTATION',
        description: 'Nelze otáčet bloky!',
        duration: 10000,
        color: 'linear-gradient(135deg, rgba(255, 0, 0, 0.95), rgba(139, 0, 0, 0.95))',
        onStart: () => { canRotate = false },
        onEnd: () => { canRotate = true }
    },
    {
        name: '🐌 SLOW MOTION',
        description: 'Vše se zpomalilo!',
        duration: 15000,
        color: 'linear-gradient(135deg, rgba(0, 100, 255, 0.95), rgba(0, 50, 150, 0.95))',
        onStart: () => { dropInterval = dropInterval * 2.5 },
        onEnd: () => {
            const baseSpeed = selectedDifficulty === 'easy' ? 800 : 
                             selectedDifficulty === 'medium' ? 600 : 
                             selectedDifficulty === 'hard' ? 400 : 250
            const speedMultiplier = Math.max(0.25, 1 - (Math.floor(score / 1000) * 0.08))
            dropInterval = Math.max(100, Math.floor(baseSpeed * speedMultiplier))
        }
    },
    {
        name: '🎁 DOUBLE POINTS',
        description: 'Získáváš 2× body!',
        duration: 12000,
        color: 'linear-gradient(135deg, rgba(0, 255, 0, 0.95), rgba(0, 200, 0, 0.95))',
        multiplier: 2
    },
    {
        name: '⬅️ REVERSE CONTROLS',
        description: 'Ovládání je obrácené!',
        duration: 10000,
        color: 'linear-gradient(135deg, rgba(255, 0, 255, 0.95), rgba(200, 0, 200, 0.95))',
        reverseControls: true
    },
    {
        name: '👻 INVISIBLE BLOCKS',
        description: 'Padající blok je neviditelný!',
        duration: 8000,
        color: 'linear-gradient(135deg, rgba(100, 100, 100, 0.95), rgba(50, 50, 50, 0.95))',
        invisibleCurrent: true
    }
]

// ===== DOM ELEMENTS =====
const tetris = document.getElementById('tetris')
const scoreDisplay = document.getElementById('score')
const nextPieceDisplay = document.getElementById('nextPiece')
const holdPieceDisplay = document.getElementById('holdPiece')

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 Inicializace hry...')
    updateHappyHourIndicator()
    loadSettings()
    await loadCurrentUser()
    startPageLoading()
})

// ===== HAPPY HOUR SYSTEM =====
function isHappyHour() {
    const hour = new Date().getHours()
    return hour === 15 || hour === 20
}

function getHappyHourMultiplier() {
    return isHappyHour() ? 2 : 1
}

function updateHappyHourIndicator() {
    const indicator = document.getElementById('happyHourIndicator')
    if (!indicator) return
    
    if (isHappyHour()) {
        indicator.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 165, 0, 0.4))'
        indicator.style.borderColor = 'gold'
        indicator.style.color = 'gold'
        indicator.textContent = '🎉 Happy Hour 2×'
    } else {
        const hour = new Date().getHours()
        const next = hour < 15 ? '15:00' : hour < 20 ? '20:00' : '15:00'
        
        indicator.style.background = 'rgba(100, 100, 100, 0.5)'
        indicator.style.borderColor = '#666'
        indicator.style.color = '#aaa'
        indicator.textContent = `⏰ Play Hour v ${next}`
    }
}

setInterval(updateHappyHourIndicator, 60000)

setInterval(() => {
    const now = new Date()
    if (now.getMinutes() === 0 && isHappyHour()) {
        showHappyHourNotification()
    }
}, 60000)

function showHappyHourNotification() {
    if (!isHappyHour()) return
    
    const notification = document.createElement('div')
    notification.className = 'event-notification'
    notification.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 165, 0, 0.95))'
    notification.innerHTML = `
        <h2>🎉 HAPPY HOUR! 🎉</h2>
        <p>2× SKÓRE & 2× MINCE!</p>
        <p style="font-size: 18px; margin-top: 10px;">Aktivní do ${HAPPY_HOURS[HAPPY_HOURS.indexOf(new Date().getHours())] + 1}:00</p>
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.classList.add('hide')
        setTimeout(() => notification.remove(), 300)
    }, 5000)
}

// ===== SETTINGS =====
function loadSettings() {
    soundEnabled = localStorage.getItem('tetris_sound') !== 'false'
    currentLanguage = localStorage.getItem('tetris_language') || 'cs'
    updateSettingsUI()
}

function updateSettingsUI() {
    const soundOnBtn = document.getElementById('soundOn')
    const soundOffBtn = document.getElementById('soundOff')
    const langCsBtn = document.getElementById('langCs')
    const langEnBtn = document.getElementById('langEn')
    
    if (soundOnBtn && soundOffBtn) {
        if (soundEnabled) {
            soundOnBtn.style.background = 'linear-gradient(135deg, rgba(0, 255, 0, 0.5), rgba(0, 200, 0, 0.5))'
            soundOnBtn.style.borderColor = '#00ff00'
            soundOffBtn.style.background = ''
            soundOffBtn.style.borderColor = ''
        } else {
            soundOffBtn.style.background = 'linear-gradient(135deg, rgba(255, 0, 0, 0.5), rgba(200, 0, 0, 0.5))'
            soundOffBtn.style.borderColor = '#ff0000'
            soundOnBtn.style.background = ''
            soundOnBtn.style.borderColor = ''
        }
    }
    
    if (langCsBtn && langEnBtn) {
        if (currentLanguage === 'cs') {
            langCsBtn.style.background = 'linear-gradient(135deg, rgba(0, 150, 255, 0.6), rgba(150, 0, 255, 0.6))'
            langCsBtn.style.borderColor = '#00ffff'
            langEnBtn.style.background = ''
            langEnBtn.style.borderColor = ''
        } else {
            langEnBtn.style.background = 'linear-gradient(135deg, rgba(0, 150, 255, 0.6), rgba(150, 0, 255, 0.6))'
            langEnBtn.style.borderColor = '#00ffff'
            langCsBtn.style.background = ''
            langCsBtn.style.borderColor = ''
        }
    }
}

window.showSettingsMenu = function() {
    document.getElementById('mainMenu').style.display = 'none'
    document.getElementById('settingsMenu').style.display = 'flex'
    updateSettingsUI()
}

window.setSoundEnabled = function(enabled) {
    soundEnabled = enabled
    localStorage.setItem('tetris_sound', enabled)
    updateSettingsUI()
    
    if (enabled) {
        playSound('rotate')
    }
}

window.setLanguage = function(lang) {
    currentLanguage = lang
    localStorage.setItem('tetris_language', lang)
    updateSettingsUI()
    alert(lang === 'cs' ? 'Jazyk změněn na češtinu!' : 'Language changed to English!')
}

// ===== LOADING SCREEN =====
function startPageLoading() {
    const loadingTime = 3000 + Math.random() * 2000
    const loadingBar = document.getElementById('loadingBar')
    const loadingText = document.getElementById('loadingText')
    
    const loadingMessages = [
        'Připravuji herní pole...',
        'Generuji bloky...',
        'Načítám témata...',
        'Inicializuji eventy...',
        'Nastavuji obtížnost...',
        'Téměř hotovo...'
    ]
    
    let progress = 0
    const interval = 50
    const steps = loadingTime / interval
    const progressStep = 100 / steps
    
    const loadingInterval = setInterval(() => {
        progress += progressStep
        if (progress >= 100) {
            progress = 100
            clearInterval(loadingInterval)
        }
        
        loadingBar.style.width = progress + '%'
        
        if (Math.random() < 0.1) {
            loadingText.textContent = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
        }
    }, interval)
    
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none'
        document.getElementById('mainMenu').style.display = 'flex'
        loadingBar.style.width = '0%'
        
        // ✅ OPRAVENO - zobrazení update modalu
        const hasSeenUpdate = localStorage.getItem('tetris_update_v2.0_seen')
        if (!hasSeenUpdate) {
            setTimeout(() => showUpdateModal(), 500)
        }
    }, loadingTime)
}

// ✅ PŘIDÁNO - Update modal
function showUpdateModal() {
    const hasSeenUpdate = localStorage.getItem('tetris_update_v2.0_seen')
    if (hasSeenUpdate) {
        console.log('Update modal už byl zobrazen')
        return
    }
    
    const modal = document.createElement('div')
    modal.id = 'updateModal'
    modal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1a2e, #2a2a4e);
            padding: 40px;
            border-radius: 20px;
            border: 3px solid #00ffff;
            box-shadow: 0 0 60px rgba(0, 255, 255, 0.6);
            max-width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            text-align: center;
            animation: fadeIn 0.5s ease-in;
        ">
            <h2 style="font-size: 36px; color: #00ffff; text-shadow: 0 0 20px #00ffff; margin-bottom: 20px;">
                🎉 NOVÁ AKTUALIZACE! 🎉
            </h2>
            
            <div style="text-align: left; margin: 20px 0; font-size: 16px; line-height: 1.8;">
                <p style="color: #00ffff; font-weight: bold; margin-bottom: 15px;">✨ Co je nového:</p>
                <ul style="color: #fff; margin-left: 25px;">
                    <li>🎊 <strong>Happy Hours</strong> - 2× skóre a mince v 15:00 a 20:00!</li>
                    <li>⭐ <strong>Level systém</strong> - získávej XP a odemykej obsah</li>
                    <li>🎨 <strong>15 nových témat</strong> - od Fire po Galaxy!</li>
                    <li>🗺️ <strong>16 různých map</strong> - od 10x25 po 25x25</li>
                    <li>⚡ <strong>6 random eventů</strong> - Turbo Speed, Invisible Blocks...</li>
                    <li>🏆 <strong>Online žebříček</strong> - konkuruj ostatním hráčům!</li>
                    <li>💰 <strong>Coinový systém</strong> - nakupuj témata a mapy</li>
                </ul>
            </div>
            
            <button onclick="closeUpdateModal()" class="menuBtn" style="
                margin-top: 20px;
                font-size: 20px;
                padding: 12px 40px;
            ">
                🚀 ZAČÍT HRÁT! 🚀
            </button>
        </div>
    `
    
    document.body.appendChild(modal)
    console.log('✅ Update modal zobrazen')
}

window.closeUpdateModal = function() {
    localStorage.setItem('tetris_update_v2.0_seen', 'true')
    const modal = document.getElementById('updateModal')
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out'
        setTimeout(() => modal.remove(), 300)
    }
    console.log('✅ Update modal zavřen')
}

// ===== USER DATA MANAGEMENT =====
async function loadCurrentUser() {
    const savedUser = localStorage.getItem('currentUser')
    
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser)
            
            if (parsed && parsed.id && parsed.username) {
                currentUser = parsed
                console.log('✅ Přihlášený uživatel:', currentUser.username, 'ID:', currentUser.id)
                await loadUserData()
                return
            } else {
                throw new Error('Neplatný formát')
            }
        } catch (e) {
            console.log('⚠️ Nelze parsovat JSON, zkouším jako string')
            currentUser = { username: savedUser, is_guest: true }
            loadLocalData()
        }
    } else {
        currentUser = { username: 'Host', is_guest: true }
        console.log('👤 Host režim')
        loadLocalData()
    }
}

async function loadUserData() {
    if (!currentUser || currentUser.is_guest) return
    
    console.log('📥 Načítám data pro uživatele:', currentUser.username, 'ID:', currentUser.id)
    
    try {
        const { data, error } = await supabase
            .from('tetris_player_data')
            .select('*')
            .eq('user_id', currentUser.id)
            .single()
        
        if (data) {
            playerCoins = data.coins || 0
            playerLevel = data.level || 1
            playerXP = data.xp || 0
            unlockedThemes = data.unlocked_themes || ['classic', 'neon']
            unlockedMaps = data.unlocked_maps || ['20x10', '18x12']
            totalGamesPlayed = data.games_played || 0
            console.log('✅ Data načtena:', { playerCoins, playerLevel, playerXP, totalGamesPlayed })
        } else {
            console.log('🆕 První spuštění - vytvářím nový záznam')
            await supabase
                .from('tetris_player_data')
                .insert([{
                    user_id: currentUser.id,
                    username: currentUser.username,
                    coins: 0,
                    level: 1,
                    xp: 0,
                    unlocked_themes: ['classic', 'neon'],
                    unlocked_maps: ['20x10', '18x12'],
                    games_played: 0,
                    total_score: 0,
                    best_score: 0
                }])
        }
    } catch (error) {
        console.error('❌ Chyba při načítání dat:', error)
    }
    
    updateCoinsDisplay()
    updateLevelDisplay()
    updateUnlockedItems()
}

function loadLocalData() {
    const saved = localStorage.getItem('tetrisPlayerData')
    if (saved) {
        const data = JSON.parse(saved)
        playerCoins = data.coins || 0
        playerLevel = data.level || 1
        playerXP = data.xp || 0
        unlockedThemes = data.themes || ['classic', 'neon']
        unlockedMaps = data.maps || ['20x10', '18x12']
        console.log('📂 Načtena lokální data:', { playerCoins, playerLevel, playerXP })
    }
    updateCoinsDisplay()
    updateLevelDisplay()
    updateUnlockedItems()
}

async function saveUserData() {
    console.log('💾 Ukládám data...', { playerLevel, playerXP, playerCoins })
    
    if (!currentUser || currentUser.is_guest) {
        const data = {
            coins: playerCoins,
            level: playerLevel,
            xp: playerXP,
            themes: unlockedThemes,
            maps: unlockedMaps
        }
        localStorage.setItem('tetrisPlayerData', JSON.stringify(data))
        console.log('💾 Uloženo lokálně:', data)
        return
    }
    
    try {
        const updateData = {
            coins: playerCoins,
            level: playerLevel,
            xp: playerXP,
            unlocked_themes: unlockedThemes,
            unlocked_maps: unlockedMaps,
            games_played: totalGamesPlayed,
            last_played: new Date().toISOString()
        }
        
        console.log('💾 Ukládám do Supabase:', updateData)
        
        const { data, error } = await supabase
            .from('tetris_player_data')
            .update(updateData)
            .eq('user_id', currentUser.id)
            .select()
        
        if (error) throw error
        
        console.log('✅ Data úspěšně uložena do Supabase:', data)
        
    } catch (error) {
        console.error('❌ Chyba při ukládání dat:', error)
    }
}

// ===== LEVEL & XP SYSTEM =====
function getXPForNextLevel(currentLevel) {
    if (currentLevel >= 10) return 0
    return xpRequirements[currentLevel]
}

function updateLevelDisplay() {
    const levelElement = document.getElementById('playerLevel')
    if (levelElement) {
        levelElement.textContent = playerLevel
    }
    
    if (playerLevel >= 10) {
        const xpText = document.getElementById('xpText')
        const xpBar = document.getElementById('xpBar')
        if (xpText) xpText.textContent = 'MAX LEVEL'
        if (xpBar) xpBar.style.width = '100%'
        return
    }
    
    const currentLevelXP = xpRequirements[playerLevel - 1]
    const nextLevelXP = xpRequirements[playerLevel]
    const xpNeeded = nextLevelXP - currentLevelXP
    const currentProgress = playerXP - currentLevelXP
    
    const percentage = Math.min(100, Math.max(0, (currentProgress / xpNeeded) * 100))
    
    const xpBar = document.getElementById('xpBar')
    const xpText = document.getElementById('xpText')
    
    if (xpBar) xpBar.style.width = percentage + '%'
    if (xpText) xpText.textContent = `${currentProgress} / ${xpNeeded} XP`
    
    console.log(`📊 Level display: ${playerLevel} | ${currentProgress}/${xpNeeded} XP (${percentage.toFixed(1)}%)`)
}

async function addXP(amount) {
    console.log(`⭐ Přidávám ${amount} XP...`)
    playerXP += amount
    
    let leveledUp = false
    while (playerLevel < 10 && playerXP >= xpRequirements[playerLevel]) {
        playerLevel++
        leveledUp = true
        console.log(`🎉 LEVEL UP! Nový level: ${playerLevel}`)
    }
    
    updateLevelDisplay()
    updateCoinsDisplay()
    
    console.log(`💎 Po přidání: Level ${playerLevel}, XP ${playerXP}`)
    
    // ✅ OPRAVENO - ukládání po XP změně
    await saveUserData()
    console.log('✅ Data uložena po XP změně')
    
    if (leveledUp) {
        showLevelUpNotification()
        updateUnlockedItems()
    }
}

function showLevelUpNotification() {
    const existing = document.querySelector('.level-up-notification')
    if (existing) {
        existing.remove()
    }
    
    const notification = document.createElement('div')
    notification.className = 'level-up-notification'
    
    notification.innerHTML = `
        <h2>🎉 LEVEL UP! 🎉</h2>
        <p style="font-size: 32px;">Dosáhl jsi Level ${playerLevel}!</p>
        <p style="font-size: 20px;">Nové položky odemčeny v shopu! 🛒</p>
        <button class="menuBtn" onclick="closeLevelUpNotification(this)">✅ Pokračovat</button>
    `
    
    document.body.appendChild(notification)
    playSound('levelup')
    console.log('✅ Level up notifikace zobrazena')
}

window.closeLevelUpNotification = function(button) {
    const notification = button.closest('.level-up-notification')
    if (notification) {
        notification.classList.add('hide')
        setTimeout(() => notification.remove(), 300)
    }
}

window.updateCoinsDisplay = function() {
    const coinElement = document.getElementById('coinCount')
    if (coinElement) {
        coinElement.textContent = playerCoins
    }
    
    const gameCoinsElement = document.getElementById('gameCoins')
    if (gameCoinsElement) {
        gameCoinsElement.textContent = earnedCoinsThisGame
    }
}

window.updateUnlockedItems = function() {
    const themesList = ['classic', 'neon', 'fire', 'candy', 'ocean', 'ice', 'matrix', 'forest', 'lava', 'sunset', 'toxic', 'galaxy', 'midnight', 'rainbow', 'crystal', 'gold']
    themesList.forEach(theme => {
        const btn = document.getElementById(`theme-${theme}`)
        if (btn && unlockedThemes.includes(theme)) {
            btn.classList.remove('locked')
            const priceTag = btn.querySelector('.price-tag')
            const levelReq = btn.querySelector('.level-req')
            if (priceTag) priceTag.remove()
            if (levelReq) levelReq.remove()
        }
    })
    
    const mapsList = ['20x10', '18x12', '22x8', '15x15', '16x16', '24x12', '28x9', '14x18', '12x20', '18x18', '25x8', '26x10', '10x25', '20x20', '30x10', '25x25']
    mapsList.forEach(map => {
        const btn = document.getElementById(`map-${map}`)
        if (btn && unlockedMaps.includes(map)) {
            btn.classList.remove('locked')
            const priceTag = btn.querySelector('.price-tag')
            const levelReq = btn.querySelector('.level-req')
            if (priceTag) priceTag.remove()
            if (levelReq) levelReq.remove()
        }
    })
}

// ===== SHOP =====
window.buyTheme = async function(theme, price, requiredLevel) {
    if (unlockedThemes.includes(theme)) {
        setTheme(theme)
        return
    }
    
    if (playerLevel < requiredLevel) {
        alert(`Pro odemčení tohoto tématu potřebuješ Level ${requiredLevel}! (máš Level ${playerLevel})`)
        return
    }
    
    if (playerCoins >= price) {
        if (confirm(`Koupit téma "${theme}" za ${price} mincí?`)) {
            playerCoins -= price
            unlockedThemes.push(theme)
            await saveUserData()
            updateCoinsDisplay()
            updateUnlockedItems()
            setTheme(theme)
            alert('Téma odemčeno! 🎉')
        }
    } else {
        alert(`Nemáš dost mincí! Potřebuješ ${price}, máš jen ${playerCoins}.`)
    }
}

window.buyMap = async function(mapName, rows, cols, price, requiredLevel) {
    if (unlockedMaps.includes(mapName)) {
        setMap(rows, cols)
        return
    }
    
    if (playerLevel < requiredLevel) {
        alert(`Pro odemčení této mapy potřebuješ Level ${requiredLevel}! (máš Level ${playerLevel})`)
        return
    }
    
    if (playerCoins >= price) {
        if (confirm(`Koupit mapu "${mapName}" za ${price} mincí?`)) {
            playerCoins -= price
            unlockedMaps.push(mapName)
            await saveUserData()
            updateCoinsDisplay()
            updateUnlockedItems()
            setMap(rows, cols)
            alert('Mapa odemčena! 🎉')
        }
    } else {
        alert(`Nemáš dost mincí! Potřebuješ ${price}, máš jen ${playerCoins}.`)
    }
}

async function addCoins(amount) {
    earnedCoinsThisGame += amount
    playerCoins += amount
    updateCoinsDisplay()
    await saveUserData()
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const coin = document.createElement('div')
            coin.className = 'coin-particle'
            coin.textContent = '💰'
            coin.style.left = (window.innerWidth / 2 + Math.random() * 200 - 100) + 'px'
            coin.style.top = (window.innerHeight / 2) + 'px'
            document.body.appendChild(coin)
            setTimeout(() => coin.remove(), 2000)
        }, i * 100)
    }
}

// ===== NAVIGATION =====
window.goToKlasika = function() {
    const url = `klasika.html?difficulty=${selectedDifficulty}&rows=${mapRows}&cols=${mapCols}&theme=${currentTheme}`
    window.location.href = url
}

// ✅ OPRAVENO - tlačítko zpět do menu
window.backToMainMenu = function() {
    console.log('🔙 Zpět do menu')
    
    // Skryj všechny obrazovky
    document.getElementById('mainMenu').style.display = 'flex'
    document.getElementById('difficultyMenu').style.display = 'none'
    document.getElementById('settingsMenu').style.display = 'none'
    document.getElementById('themeMenu').style.display = 'none'
    document.getElementById('mapMenu').style.display = 'none'
    document.getElementById('leaderboard').style.display = 'none'
    document.getElementById('tetrisGame').style.display = 'none'
    document.getElementById('nameModal').style.display = 'none'
    document.getElementById('pauseOverlay').style.display = 'none'
    
    // Úplné zastavení hry
    isGameOver = true
    isPaused = false
    
    // Zastav všechny timeouty
    clearTimeout(dropTimeout)
    clearTimeout(eventTimeout)
    
    // Ukončit aktivní event
    if (activeEvent) {
        endEvent()
    }
    
    // Skrýt event timer
    const timer = document.getElementById('eventTimer')
    if (timer) {
        timer.style.display = 'none'
    }
    
    // Reset game state
    activeEvent = null
    canRotate = true
    
    console.log('✅ Návrat do menu dokončen')
}

window.showDifficultyMenu = function() {
    document.getElementById('mainMenu').style.display = 'none'
    document.getElementById('difficultyMenu').style.display = 'flex'
}

window.showThemeMenu = function() {
    document.getElementById('mainMenu').style.display = 'none'
    document.getElementById('themeMenu').style.display = 'flex'
}

window.showMapMenu = function() {
    document.getElementById('mainMenu').style.display = 'none'
    document.getElementById('mapMenu').style.display = 'flex'
}

window.showLeaderboard = async function() {
    document.getElementById('mainMenu').style.display = 'none'
    document.getElementById('leaderboard').style.display = 'flex'
    await loadLeaderboard()
}

window.setDifficulty = function(level) {
    selectedDifficulty = level
    backToMainMenu()
}

window.setMap = function(rows, cols) {
    mapRows = rows
    mapCols = cols
    backToMainMenu()
}

window.setTheme = function(theme) {
    if (!unlockedThemes.includes(theme)) {
        alert('Toto téma je zamčené!')
        return
    }
    currentTheme = theme
    backToMainMenu()
}

// ===== GAME FUNCTIONS =====
function getColor(shapeIndex) {
    const colorPalette = themes[currentTheme]
    return colorPalette[shapeIndex % colorPalette.length]
}

function initGrid() {
    tetris.innerHTML = ''
    grid.length = 0
    tetris.style.gridTemplateRows = `repeat(${mapRows}, 30px)`
    tetris.style.gridTemplateColumns = `repeat(${mapCols}, 30px)`
    
    for (let r = 0; r < mapRows; r++) {
        grid[r] = []
        for (let c = 0; c < mapCols; c++) {
            const cell = document.createElement('div')
            cell.classList.add('cell')
            tetris.appendChild(cell)
            grid[r][c] = 0
        }
    }
}

window.startTetris = function(difficulty) {
    console.log('🎮 Spouštím hru, obtížnost:', difficulty)
    
    document.getElementById('mainMenu').style.display = 'none'
    document.getElementById('tetrisGame').style.display = 'flex'
    
    score = 0
    level = 1
    linesCleared = 0
    combo = 0
    canHold = true
    isPaused = false
    isGameOver = false
    holdPiece = null
    earnedCoinsThisGame = 0
    activeEvent = null
    
    dropInterval = difficulty === 'easy' ? 800 : 
                   difficulty === 'medium' ? 600 : 
                   difficulty === 'hard' ? 400 : 200
    
    initGrid()
    nextPiece = randomTetromino()
    newTetromino()
    updateDisplay()
    gameLoop()
    startEventSystem()
    
    if (isHappyHour()) {
        setTimeout(() => showHappyHourNotification(), 1000)
    }
}

function randomTetromino() {
    const index = Math.floor(Math.random() * shapes.length)
    return {
        shape: shapes[index].shape.map(r => r.slice()),
        color: getColor(index),
        name: shapes[index].name
    }
}

function newTetromino() {
    current = nextPiece
    current.x = Math.floor(mapCols / 2) - Math.floor(current.shape[0].length / 2)
    current.y = 0
    
    nextPiece = randomTetromino()
    drawPreview(nextPiece, nextPieceDisplay)
    canHold = true
    
    if (collision()) {
        gameOver()
    }
}

function drawPreview(piece, container) {
    container.innerHTML = ''
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div')
        cell.classList.add('preview-cell')
        container.appendChild(cell)
    }
    
    const offsetX = Math.floor((4 - piece.shape[0].length) / 2)
    const offsetY = Math.floor((4 - piece.shape.length) / 2)
    
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                const index = (offsetY + r) * 4 + (offsetX + c)
                container.children[index].style.background = piece.color
                container.children[index].style.boxShadow = `0 0 10px ${piece.color}`
            }
        }
    }
}

function draw() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.style.background = '#1a1a2e'
        cell.classList.remove('filled')
    })
    
    for (let r = 0; r < mapRows; r++) {
        for (let c = 0; c < mapCols; c++) {
            if (grid[r][c]) {
                const cell = tetris.children[r * mapCols + c]
                cell.style.background = grid[r][c]
                cell.style.boxShadow = `0 0 10px ${grid[r][c]}`
                cell.classList.add('filled')
            }
        }
    }
    
    if (activeEvent && activeEvent.invisibleCurrent) {
        return
    }
    
    for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
            if (current.shape[r][c]) {
                const index = (current.y + r) * mapCols + (current.x + c)
                if (index >= 0 && index < mapRows * mapCols) {
                    tetris.children[index].style.background = current.color
                    tetris.children[index].style.boxShadow = `0 0 15px ${current.color}`
                    tetris.children[index].classList.add('filled')
                }
            }
        }
    }
}

function moveDown() {
    if (isPaused || isGameOver) return
    
    current.y++
    if (collision()) {
        current.y--
        freeze()
        newTetromino()
    }
    draw()
}

function collision() {
    return collisionAt(current.x, current.y)
}

function collisionAt(x, y) {
    for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
            if (current.shape[r][c]) {
                let newY = y + r
                let newX = x + c
                if (newY >= mapRows || newX < 0 || newX >= mapCols) return true
                if (newY >= 0 && grid[newY][newX]) return true
            }
        }
    }
    return false
}

function freeze() {
    for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
            if (current.shape[r][c]) {
                grid[current.y + r][current.x + c] = current.color
            }
        }
    }
    
    const cleared = clearLines()
    if (cleared > 0) {
        createParticles(cleared)
        playSound('clear')
    }
}

function clearLines() {
    let cleared = 0
    for (let r = mapRows - 1; r >= 0; r--) {
        if (grid[r].every(cell => cell !== 0)) {
            grid.splice(r, 1)
            grid.unshift(Array(mapCols).fill(0))
            cleared++
            r++
        }
    }
    
    if (cleared > 0) {
        linesCleared += cleared
        combo++
        
        let points = cleared * 100 * level
        if (cleared === 4) points *= 2
        points += combo * 50
        
        if (activeEvent && activeEvent.multiplier) {
            points *= activeEvent.multiplier
        }
        
        points *= getHappyHourMultiplier()
        
        score += points
        level = Math.floor(linesCleared / 10) + 1
        
        const baseSpeed = selectedDifficulty === 'easy' ? 800 : 
                         selectedDifficulty === 'medium' ? 600 : 
                         selectedDifficulty === 'hard' ? 400 : 250
        
        const minSpeed = selectedDifficulty === 'easy' ? 200 : 
                        selectedDifficulty === 'medium' ? 150 : 
                        selectedDifficulty === 'hard' ? 100 : 80
        
        const speedMultiplier = Math.max(0.25, 1 - (Math.floor(score / 1000) * 0.08))
        dropInterval = Math.max(minSpeed, Math.floor(baseSpeed * speedMultiplier))
    } else {
        combo = 0
    }
    
    updateDisplay()
    return cleared
}

function createParticles(count) {
    for (let i = 0; i < count * 20; i++) {
        const particle = document.createElement('div')
        particle.classList.add('particle')
        particle.style.left = (window.innerWidth / 2 + Math.random() * 400 - 200) + 'px'
        particle.style.top = (window.innerHeight / 2 + Math.random() * 200 - 100) + 'px'
        particle.style.background = themes[currentTheme][Math.floor(Math.random() * themes[currentTheme].length)]
        document.body.appendChild(particle)
        
        setTimeout(() => particle.remove(), 1000)
    }
}

function rotate() {
    if (!canRotate) {
        playSound('error')
        return
    }
    
    const shape = current.shape
    const N = shape.length
    const M = shape[0].length
    const rotated = []
    
    for (let y = 0; y < M; y++) {
        rotated[y] = []
        for (let x = 0; x < N; x++) {
            rotated[y][x] = shape[N - 1 - x][y] || 0
        }
    }
    
    const oldShape = current.shape
    current.shape = rotated
    
    if (collision()) {
        current.x++
        if (collision()) {
            current.x -= 2
            if (collision()) {
                current.x++
                current.shape = oldShape
            }
        }
    }
    
    playSound('rotate')
}

function hardDrop() {
    while (!collision()) {
        current.y++
    }
    current.y--
    freeze()
    newTetromino()
    score += 10
    updateDisplay()
    playSound('drop')
}

function hold() {
    if (!canHold) return
    
    if (holdPiece === null) {
        holdPiece = {
            shape: current.shape.map(r => r.slice()),
            color: current.color,
            name: current.name
        }
        newTetromino()
    } else {
        const temp = {
            shape: current.shape.map(r => r.slice()),
            color: current.color,
            name: current.name
        }
        current = holdPiece
        current.x = Math.floor(mapCols / 2) - Math.floor(current.shape[0].length / 2)
        current.y = 0
        holdPiece = temp
    }
    
    drawPreview(holdPiece, holdPieceDisplay)
    canHold = false
    playSound('hold')
}

function updateDisplay() {
    scoreDisplay.textContent = score
    updateCoinsDisplay()
}

function togglePause() {
    isPaused = !isPaused
    document.getElementById('pauseOverlay').style.display = isPaused ? 'flex' : 'none'
    if (!isPaused) {
        gameLoop()
    }
}

function playSound(type) {
    if (!soundEnabled) return
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    let duration = 0.1
    
    switch(type) {
        case 'rotate':
            oscillator.frequency.value = 400
            gainNode.gain.value = 0.1
            break
        case 'drop':
            oscillator.frequency.value = 200
            gainNode.gain.value = 0.2
            break
        case 'clear':
            oscillator.frequency.value = 800
            gainNode.gain.value = 0.15
            break
        case 'hold':
            oscillator.frequency.value = 600
            gainNode.gain.value = 0.1
            break
        case 'event':
            oscillator.frequency.value = 1000
            gainNode.gain.value = 0.3
            duration = 0.3
            break
        case 'levelup':
            oscillator.frequency.value = 1200
            gainNode.gain.value = 0.3
            duration = 0.5
            break
        case 'error':
            oscillator.frequency.value = 150
            gainNode.gain.value = 0.2
            break
    }
    
    oscillator.start(audioContext.currentTime || 0)
    oscillator.stop((audioContext.currentTime || 0) + duration)
}

// ===== EVENT CONTROLS =====
document.addEventListener('keydown', e => {
    if (isGameOver) return
    
    if (e.key === 'p' || e.key === 'P') {
        togglePause()
        return
    }
    
    if (e.key === 'Escape') {
        backToMainMenu()
        return
    }
    
    if (isPaused) return
    
    const reversed = activeEvent && activeEvent.reverseControls
    
    if (e.key === 'ArrowLeft') {
        if (reversed) {
            current.x++
            if (collision()) current.x--
        } else {
            current.x--
            if (collision()) current.x++
        }
    }
    if (e.key === 'ArrowRight') {
        if (reversed) {
            current.x--
            if (collision()) current.x++
        } else {
            current.x++
            if (collision()) current.x--
        }
    }
    if (e.key === 'ArrowDown') {
        moveDown()
    }
    if (e.key === 'ArrowUp') {
        rotate()
    }
    if (e.key === ' ') {
        e.preventDefault()
        hardDrop()
    }
    if (e.key === 'c' || e.key === 'C') {
        hold()
    }
    
    draw()
})

function gameLoop() {
    if (isPaused || isGameOver) return
    moveDown()
    dropTimeout = setTimeout(gameLoop, dropInterval)
}

// ===== GAME OVER =====
async function gameOver() {
    console.log('💀 Game Over! Konečné skóre:', score)
    isGameOver = true
    endEvent()
    clearTimeout(eventTimeout)
    
    const earnedXP = await updateAfterGame(score)
    
    if (currentUser && !currentUser.is_guest) {
        try {
            await supabase
                .from('tetris_scores')
                .insert([{
                    user_id: currentUser.id,
                    username: currentUser.username,
                    score: score,
                    difficulty: selectedDifficulty,
                    lines_cleared: linesCleared,
                    level_reached: level,
                    timestamp: new Date().toISOString()
                }])
            console.log('✅ Skóre uloženo do žebříčku!')
        } catch (error) {
            console.error('❌ Chyba při ukládání skóre:', error)
        }
    }
    
    document.getElementById('finalScore').textContent = score
    document.getElementById('earnedCoins').textContent = earnedCoinsThisGame
    document.getElementById('earnedXP').textContent = earnedXP
    
    const saveMsg = document.getElementById('saveMessage')
    if (currentUser && !currentUser.is_guest) {
        saveMsg.textContent = '✅ Skóre automaticky uloženo do žebříčku!'
        saveMsg.style.color = '#00ff00'
    } else {
        saveMsg.textContent = '⚠️ Pro uložení do žebříčku se musíš přihlásit'
        saveMsg.style.color = '#ffaa00'
    }
    
    document.getElementById('nameModal').style.display = 'flex'
}

async function updateAfterGame(finalScore) {
    console.log('📊 Aktualizuji statistiky po hře...')
    totalGamesPlayed++
    
    const baseCoinsFromScore = Math.floor(finalScore / 100) * 5
    const baseCoins = baseCoinsFromScore + 10
    
    const multiplier = getHappyHourMultiplier()
    const totalCoins = baseCoins * multiplier
    
    const earnedXP = Math.max(10, Math.floor(finalScore / 1000) * 10)
    
    earnedCoinsThisGame = totalCoins
    playerCoins += totalCoins
    
    console.log(`💰 Získané mince: ${totalCoins}${isHappyHour() ? ' (HAPPY HOUR!)' : ''}`)
    console.log(`⭐ Získané XP: ${earnedXP}`)
    
    // Přidej XP (volá addXP která ukládá data)
    await addXP(earnedXP)
    
    updateCoinsDisplay()
    updateLevelDisplay()
    
    if (!currentUser || currentUser.is_guest) {
        return earnedXP
    }
    
    try {
        const { data: current } = await supabase
            .from('tetris_player_data')
            .select('*')
            .eq('user_id', currentUser.id)
            .single()
        
        const newTotalScore = (current?.total_score || 0) + finalScore
        const newBestScore = Math.max(current?.best_score || 0, finalScore)
        
        const { error } = await supabase
            .from('tetris_player_data')
            .update({
                coins: playerCoins,
                level: playerLevel,
                xp: playerXP,
                games_played: totalGamesPlayed,
                total_score: newTotalScore,
                best_score: newBestScore,
                last_played: new Date().toISOString()
            })
            .eq('user_id', currentUser.id)
        
        if (error) throw error
        
        console.log('✅ Statistiky úspěšně uloženy')
        
    } catch (error) {
        console.error('❌ Chyba při aktualizaci dat:', error)
    }
    
    return earnedXP
}

// ===== LEADERBOARD =====
async function loadLeaderboard() {
    const table = document.getElementById('leaderboardTable')
    const loading = document.querySelector('.loading')
    
    loading.style.display = 'block'
    table.style.display = 'none'
    
    try {
        const { data, error } = await supabase
            .from('tetris_scores')
            .select('username, score, difficulty, timestamp', { count: 'exact' })
            .order('score', { ascending: false })
            .limit(50)
        
        if (error) throw error

        const bestScoresMap = {}
        data.forEach(s => {
            if (!bestScoresMap[s.username] || s.score > bestScoresMap[s.username].score) {
                bestScoresMap[s.username] = s
            }
        })

        const bestScores = Object.values(bestScoresMap)
            .sort((a, b) => b.score - a.score)
            .slice(0, 50)

        table.innerHTML = '<tr><th>Pozice</th><th>Hráč</th><th>Skóre</th><th>Obtížnost</th><th>Datum</th></tr>'

        bestScores.forEach((s, i) => {
            const row = table.insertRow()
            row.insertCell(0).textContent = i + 1
            row.insertCell(1).textContent = s.username || 'Anonymní'
            row.insertCell(2).textContent = s.score || 0
            row.insertCell(3).textContent = getDifficultyEmoji(s.difficulty)

            const date = s.timestamp ? new Date(s.timestamp).toLocaleDateString('cs-CZ') : 'N/A'
            row.insertCell(4).textContent = date

            if (i === 0) row.style.background = 'rgba(255, 215, 0, 0.2)'
            if (i === 1) row.style.background = 'rgba(192, 192, 192, 0.2)'
            if (i === 2) row.style.background = 'rgba(205, 127, 50, 0.2)'
        })

        loading.style.display = 'none'
        table.style.display = 'table'
        
    } catch (error) {
        console.error('Chyba při načítání žebříčku:', error)
        loading.textContent = 'Chyba při načítání žebříčku.'
    }
}

function getDifficultyEmoji(difficulty) {
    switch(difficulty) {
        case 'easy': return '😊 Snadná'
        case 'medium': return '😐 Střední'
        case 'hard': return '😈 Těžká'
        case 'insane': return '💀 Šílená'
        default: return '❓'
    }
}

// ===== EVENTS =====
function triggerRandomEvent() {
    if (isPaused || isGameOver || activeEvent) return
    
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    activeEvent = event
    
    showEventNotification(event)
    
    if (event.onStart) event.onStart()
    
    updateEventTimer(event.duration)
    
    eventTimeout = setTimeout(() => {
        endEvent()
    }, event.duration)
}

function showEventNotification(event) {
    const notification = document.createElement('div')
    notification.className = 'event-notification'
    notification.style.background = event.color
    notification.innerHTML = `
        <h2>${event.name}</h2>
        <p>${event.description}</p>
    `
    document.body.appendChild(notification)
    
    playSound('event')
    
    setTimeout(() => {
        notification.classList.add('hide')
        setTimeout(() => notification.remove(), 300)
    }, 3000)
}

function updateEventTimer(duration) {
    let timer = document.getElementById('eventTimer')
    if (!timer) {
        timer = document.createElement('div')
        timer.id = 'eventTimer'
        timer.className = 'event-timer'
        document.body.appendChild(timer)
    }
    
    timer.style.display = 'block'
    let remaining = Math.floor(duration / 1000)
    
    const interval = setInterval(() => {
        if (!activeEvent || isPaused) {
            clearInterval(interval)
            return
        }
        
        remaining--
        timer.textContent = `⏱️ ${activeEvent.name}: ${remaining}s`
        
        if (remaining <= 0) {
            clearInterval(interval)
            timer.style.display = 'none'
        }
    }, 1000)
}

function endEvent() {
    if (!activeEvent) return
    
    if (activeEvent.onEnd) activeEvent.onEnd()
    
    const timer = document.getElementById('eventTimer')
    if (timer) timer.style.display = 'none'
    
    activeEvent = null
}

function startEventSystem() {
    const scheduleNextEvent = () => {
        if (isGameOver) {
            console.log('Hra skončila, eventy se nebudou plánovat')
            return
        }
        
        const delay = 60000 + Math.random() * 120000
        
        const timeoutId = setTimeout(() => {
            if (!isGameOver && !isPaused) {
                triggerRandomEvent()
            }
            if (!isGameOver) {
                scheduleNextEvent()
            }
        }, delay)
        
        eventTimeout = timeoutId
    }
    
    scheduleNextEvent()
}

console.log('✅ Tetris.js načten')
