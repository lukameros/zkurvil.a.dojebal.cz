// ============================================
// PRESENCE-UTILS.JS
// Univerzální presence systém pro všechny stránky
// ============================================

/**
 * Nastavení presence systému
 * @param {Object} supabase - Supabase client
 * @param {Object} db - Databázové utility
 * @returns {string} userPresenceId
 */
export async function setupPresence(supabase, db) {
    // Získat nebo vytvořit session ID (pro tento tab)
    let sessionId = sessionStorage.getItem('userPresenceId');
    
    if (!sessionId) {
        sessionId = 'user_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('userPresenceId', sessionId);
    }
    
    const userPresenceId = sessionId;
    
    // Vyčistit staré záznamy (starší než 60 sekund)
    const cleanupTime = new Date();
    cleanupTime.setSeconds(cleanupTime.getSeconds() - 60);
    
    try {
        await supabase
            .from('presence')
            .delete()
            .lt('timestamp', cleanupTime.toISOString());
    } catch (error) {
        console.error('❌ Cleanup error:', error);
    }
    
    // Nastavit/aktualizovat presence
    await db.setPresence(userPresenceId);
    
    // Odstranit při zavření tabu
    window.addEventListener('beforeunload', async () => {
        try {
            await db.removePresence(userPresenceId);
        } catch (error) {
            console.error('❌ Error removing presence:', error);
        }
    });
    
    // Automatické obnovování každých 30 sekund
    setInterval(async () => {
        if (userPresenceId) {
            try {
                await db.setPresence(userPresenceId);
            } catch (error) {
                console.error('❌ Error updating presence:', error);
            }
        }
    }, 30000);
    
    return userPresenceId;
}

/**
 * Sledování online uživatelů
 * @param {Object} db - Databázové utility
 */
export async function watchOnlineUsers(db) {
    async function updateCount() {
        try {
            const { count } = await db.getOnlineCount();
            
            const countElement = document.getElementById('onlineCount');
            if (countElement) {
                countElement.textContent = count || 0;
            }
            
            const adminCountElement = document.getElementById('adminOnlineCount');
            if (adminCountElement) {
                adminCountElement.textContent = count || 0;
            }
        } catch (error) {
            console.error('❌ Error updating count:', error);
        }
    }
    
    // Aktualizovat hned
    await updateCount();
    
    // Sledovat změny v reálném čase
    db.subscribeToPresence(updateCount);
    
    // Pravidelná aktualizace (každých 15 sekund)
    setInterval(updateCount, 15000);
}

/**
 * Kompletní inicializace presence
 * @param {Object} supabase - Supabase client
 * @param {Object} db - Databázové utility
 */
export async function initPresence(supabase, db) {
    const presenceId = await setupPresence(supabase, db);
    await watchOnlineUsers(db);
    return presenceId;
}