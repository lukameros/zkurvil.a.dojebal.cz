// ============================================
// FIREBASE CHAT & ADMIN SYSTEM
// Globální systém pro všechny stránky
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onValue, onDisconnect, set, remove, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase konfigurace
const firebaseConfig = {
    apiKey: "AIzaSyDOap2QsXnBvqC2WWp907fAACI0o5qIBk4",
    authDomain: "tetrisleaderboard-3b345.firebaseapp.com",
    databaseURL: "https://tetrisleaderboard-3b345-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tetrisleaderboard-3b345",
    storageBucket: "tetrisleaderboard-3b345.firebasestorage.app",
    messagingSenderId: "1066407746580",
    appId: "1:1066407746580:web:b8de384e86711899f99b01"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;
let isAdmin = false;
let userPresenceRef = null;

// ============================================
// INICIALIZACE PŘI NAČTENÍ
// ============================================
function initFirebaseSystem() {
    console.log('🔥 Firebase Chat System starting...');
    
    // Načíst uloženou session
    const savedUser = localStorage.getItem('currentUser');
    const savedAdmin = localStorage.getItem('isAdmin');
    
    if (savedUser) {
        currentUser = savedUser;
        isAdmin = savedAdmin === 'true';
        console.log('✅ User restored:', currentUser, 'Admin:', isAdmin);
        updateAuthUI();
    }
    
    // Setup presence a načtení dat
    setupPresence();
    watchOnlineUsers();
    loadMessages();
    
    console.log('✅ Firebase Chat System initialized');
}

// ============================================
// ONLINE PRESENCE
// ============================================
function setupPresence() {
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    userPresenceRef = ref(db, `presence/${userId}`);
    
    set(userPresenceRef, {
        online: true,
        timestamp: serverTimestamp()
    });
    
    onDisconnect(userPresenceRef).remove();
    console.log('👤 Presence setup complete');
}

function watchOnlineUsers() {
    const presenceRef = ref(db, 'presence');
    onValue(presenceRef, (snapshot) => {
        const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
        console.log('👥 Online users:', count);
        
        // Update všech počítadel na stránce
        const onlineCountEl = document.getElementById('onlineCount');
        if (onlineCountEl) onlineCountEl.textContent = count;
        
        const adminOnlineCountEl = document.getElementById('adminOnlineCount');
        if (adminOnlineCountEl) adminOnlineCountEl.textContent = count;
    });
}

// ============================================
// CHAT FUNKCE
// ============================================
window.sendMessage = function() {
    const input = document.getElementById('messageInput');
    if (!input) {
        console.error('❌ messageInput element not found!');
        return;
    }
    
    const message = input.value.trim();
    if (!message) return;
    
    let username = currentUser;
    if (!username) {
        if (!window.guestName) {
            window.guestName = 'Host_' + Math.random().toString(36).substr(2, 6).toUpperCase();
        }
        username = window.guestName;
    }
    
    const messagesRef = ref(db, 'messages');
    push(messagesRef, {
        user: username,
        text: message,
        timestamp: serverTimestamp(),
        isAdmin: isAdmin,
        isGuest: !currentUser
    });
    
    input.value = '';
    console.log('💬 Message sent:', message);
}

window.sendSystemMessage = function() {
    if (!isAdmin) {
        console.warn('⚠️ Not admin - cannot send system message');
        return;
    }
    
    const input = document.getElementById('systemMessage');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    const messagesRef = ref(db, 'messages');
    push(messagesRef, {
        user: 'SYSTÉM',
        text: message,
        timestamp: serverTimestamp(),
        isAdmin: true,
        isSystem: true
    });
    
    input.value = '';
    console.log('📢 System message sent');
}

function loadMessages() {
    const messagesRef = ref(db, 'messages');
    onValue(messagesRef, (snapshot) => {
        const messagesDiv = document.getElementById('chatMessages');
        if (!messagesDiv) return;
        
        messagesDiv.innerHTML = '';
        let messageCount = 0;
        
        if (snapshot.exists()) {
            const messages = snapshot.val();
            Object.keys(messages).forEach(key => {
                const msg = messages[key];
                const div = document.createElement('div');
                
                let msgClass = 'chat-message';
                if (msg.isAdmin) msgClass += ' admin';
                else if (msg.isGuest) msgClass += ' guest';
                
                div.className = msgClass;
                
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('cs-CZ') : '';
                
                div.innerHTML = `
                    <span class="chat-user">${msg.user}:</span>
                    <span class="chat-text">${msg.text}</span>
                    <span class="chat-time">${time}</span>
                `;
                
                messagesDiv.appendChild(div);
                messageCount++;
            });
            
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        
        // Update počtu zpráv pro admin
        const totalMsgEl = document.getElementById('totalMessages');
        if (totalMsgEl) totalMsgEl.textContent = messageCount;
    });
}

// ============================================
// ADMIN FUNKCE
// ============================================
window.clearChat = function() {
    if (!isAdmin) {
        console.warn('⚠️ Not admin - cannot clear chat');
        return;
    }
    
    if (confirm('Opravdu chcete smazat všechny zprávy?')) {
        const messagesRef = ref(db, 'messages');
        remove(messagesRef);
        alert('Chat byl vymazán!');
        console.log('🗑️ Chat cleared');
    }
}

window.exportChatLog = function() {
    if (!isAdmin) {
        console.warn('⚠️ Not admin - cannot export');
        return;
    }
    
    const messagesRef = ref(db, 'messages');
    onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
            const messages = snapshot.val();
            let log = 'CHAT LOG - ' + new Date().toLocaleString('cs-CZ') + '\n\n';
            
            Object.keys(messages).forEach(key => {
                const msg = messages[key];
                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString('cs-CZ') : '';
                log += `[${time}] ${msg.user}: ${msg.text}\n`;
            });
            
            const blob = new Blob([log], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chat_log_' + Date.now() + '.txt';
            a.click();
            console.log('📥 Chat log exported');
        }
    }, { once: true });
}

// ============================================
// PŘIHLÁŠENÍ / ODHLÁŠENÍ
// ============================================
window.login = function() {
    const userInput = document.getElementById('loginUser');
    const passInput = document.getElementById('loginPass');
    
    if (!userInput || !passInput) {
        console.error('❌ Login inputs not found!');
        return;
    }
    
    const user = userInput.value;
    const pass = passInput.value;
    
    if (user === 'lukamer' && pass === 'lukas89') {
        currentUser = user;
        isAdmin = true;
        
        localStorage.setItem('currentUser', user);
        localStorage.setItem('isAdmin', 'true');
        
        updateAuthUI();
        closeLogin();
        alert('Přihlášení úspěšné! Máte admin práva.');
        console.log('✅ Admin logged in');
    } else if (user && pass) {
        currentUser = user;
        isAdmin = false;
        
        localStorage.setItem('currentUser', user);
        localStorage.setItem('isAdmin', 'false');
        
        updateAuthUI();
        closeLogin();
        alert('Přihlášení úspěšné!');
        console.log('✅ User logged in');
    } else {
        alert('Vyplňte všechna pole!');
    }
}

window.logout = function() {
    currentUser = null;
    isAdmin = false;
    window.guestName = null;
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    
    updateAuthUI();
    alert('Byl jste odhlášen. Nyní píšete jako host.');
    console.log('👋 User logged out');
}

function updateAuthUI() {
    console.log('🔄 Updating auth UI - User:', currentUser, 'Admin:', isAdmin);
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminMenuBtn = document.getElementById('adminMenuBtn');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (adminMenuBtn && isAdmin) adminMenuBtn.style.display = 'block';
        
        // Admin features pro ostatní stránky
        if (isAdmin) {
            const addImageSection = document.getElementById('addImageSection');
            if (addImageSection) addImageSection.style.display = 'block';
            
            const addItemSection = document.getElementById('addItemSection');
            if (addItemSection) addItemSection.style.display = 'block';
            
            const archiveContent = document.getElementById('archiveContent');
            if (archiveContent) archiveContent.classList.add('admin-active');
            
            if (document.body) document.body.classList.add('admin-mode');
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminMenuBtn) adminMenuBtn.style.display = 'none';
        
        // Odebrat admin features
        const addImageSection = document.getElementById('addImageSection');
        if (addImageSection) addImageSection.style.display = 'none';
        
        const addItemSection = document.getElementById('addItemSection');
        if (addItemSection) addItemSection.style.display = 'none';
        
        const archiveContent = document.getElementById('archiveContent');
        if (archiveContent) archiveContent.classList.remove('admin-active');
        
        if (document.body) document.body.classList.remove('admin-mode');
    }
}

// ============================================
// UI FUNKCE
// ============================================
window.showLogin = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('🔐 Login modal opened');
    }
}

window.closeLogin = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        console.log('🔐 Login modal closed');
    }
}

window.toggleChat = function() {
    const chatPanel = document.getElementById('chatPanel');
    if (!chatPanel) {
        console.error('❌ chatPanel not found!');
        return;
    }
    
    if (chatPanel.style.display === 'none' || !chatPanel.style.display) {
        chatPanel.style.display = 'flex';
        console.log('💬 Chat opened');
    } else {
        chatPanel.style.display = 'none';
        console.log('💬 Chat closed');
    }
}

window.openAdminPanel = function() {
    if (!isAdmin) {
        alert('Nemáte admin práva!');
        console.warn('⚠️ Access denied - not admin');
        return;
    }
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'block';
        console.log('⚙️ Admin panel opened');
    }
}

window.closeAdminPanel = function() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'none';
        console.log('⚙️ Admin panel closed');
    }
}

// ============================================
// AUTO INICIALIZACE
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebaseSystem);
} else {
    initFirebaseSystem();
}