// ============================================
// OPRAVENÁ FUNKCE setPresence v supabase-config.js
// ============================================

// Najděte tuto funkci v supabase-config.js a NAHRAĎTE ji:

async setPresence(userId) {
  // ✅ OPRAVENO - používáme pouze sloupce 'id' a 'timestamp'
  const { data, error } = await supabase
    .from('presence')
    .upsert([{ 
      id: userId,  // ✅ používáme 'id', ne 'user_id'
      timestamp: new Date().toISOString() 
    }], {
      onConflict: 'id'  // ✅ conflict na sloupci 'id'
    })
  return { data, error }
},

// ============================================
// KOMPLETNÍ OPRAVENÝ supabase-config.js
// ============================================

// supabase-config.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SUPABASE_URL = 'https://bmmaijlbpwgzhrxzxphf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const db = {
  // Zprávy
  async getMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true })
    return { data, error }
  },
  
  async addMessage(message) {
    const dbMessage = {
      username: message.user,
      text: message.text,
      timestamp: message.timestamp,
      is_admin: message.is_admin,
      is_guest: message.is_guest,
      is_system: message.is_system || false
    }
    
    const { data, error } = await supabase
      .from('messages')
      .insert([dbMessage])
      .select()
    return { data, error }
  },
  
  async clearMessages() {
    const { error } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    return { error }
  },
  
  subscribeToMessages(callback) {
    return supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        callback
      )
      .subscribe()
  },
  
  // ✅ OPRAVENÁ PRESENCE SEKCE
  async setPresence(userId) {
    const { data, error } = await supabase
      .from('presence')
      .upsert([{ 
        id: userId,  // ✅ Používáme 'id' místo 'user_id'
        timestamp: new Date().toISOString() 
      }], {
        onConflict: 'id'  // ✅ Správný conflict column
      })
    
    if (error) {
      console.error('❌ setPresence error:', error)
    }
    
    return { data, error }
  },
  
  async removePresence(userId) {
    const { error } = await supabase
      .from('presence')
      .delete()
      .eq('id', userId)  // ✅ Používáme 'id' místo 'user_id'
    
    if (error) {
      console.error('❌ removePresence error:', error)
    }
    
    return { error }
  },
  
  async getOnlineCount() {
    // Vyčistit staré záznamy (starší než 1 minuta)
    const oneMinuteAgo = new Date()
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1)
    
    await supabase
      .from('presence')
      .delete()
      .lt('timestamp', oneMinuteAgo.toISOString())
    
    const { count, error } = await supabase
      .from('presence')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ getOnlineCount error:', error)
    }
    
    return { count, error }
  },
  
  subscribeToPresence(callback) {
    return supabase
      .channel('presence')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'presence' },
        callback
      )
      .subscribe()
  },
  
  // Návody
  async getNavody() {
    const { data, error } = await supabase
      .from('navody')
      .select('*')
      .order('created_at', { ascending: true })
    return { data, error }
  },
  
  async addNavod(name) {
    const { data, error } = await supabase
      .from('navody')
      .insert([{ name, created_at: new Date().toISOString() }])
      .select()
    return { data, error }
  },
  
  async deleteNavod(id) {
    const { error } = await supabase
      .from('navody')
      .delete()
      .eq('id', id)
    return { error }
  },
  
  subscribeToNavody(callback) {
    return supabase
      .channel('navody')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'navody' },
        callback
      )
      .subscribe()
  },
  
  // Archiv
  async getArchiveImages(category) {
    const table = category === 'Airsoft' ? 'archive_airsoft' : 'archive_hry'
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('uploaded_at', { ascending: false })
    return { data, error }
  },
  
  async addArchiveImage(category, imageData) {
    const table = category === 'Airsoft' ? 'archive_airsoft' : 'archive_hry'
    const { data, error } = await supabase
      .from(table)
      .insert([{
        base64_data: imageData.base64Data,
        name: imageData.name,
        uploaded_at: new Date().toISOString()
      }])
      .select()
    return { data, error }
  },
  
  async deleteArchiveImage(category, id) {
    const table = category === 'Airsoft' ? 'archive_airsoft' : 'archive_hry'
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    return { error }
  },
  
  subscribeToArchive(category, callback) {
    const table = category === 'Airsoft' ? 'archive_airsoft' : 'archive_hry'
    return supabase
      .channel(`archive_${category}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: table },
        callback
      )
      .subscribe()
  },
  
  // Uživatelé
  async registerUser(username, password, email = null) {
    const { data: existing } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()
    
    if (existing) {
      return { error: { message: 'Uživatel již existuje!' } }
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username,
        password,
        email,
        is_admin: false
      }])
      .select()
    return { data, error }
  },
  
  async loginUser(username, password) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()
    
    if (data) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id)
    }
    
    return { data, error }
  },
  
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },
  
  async deleteUser(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    return { error }
  },
  
  // Tetris player data
  async getTetrisPlayerData(userId) {
    const { data, error } = await supabase
      .from('tetris_player_data')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },
  
  async updateTetrisPlayerData(userId, updates) {
    const { data, error } = await supabase
      .from('tetris_player_data')
      .update(updates)
      .eq('user_id', userId)
      .select()
    return { data, error }
  }
}
