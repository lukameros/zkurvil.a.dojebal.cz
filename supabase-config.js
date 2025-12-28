// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔥 DŮLEŽITÉ: Nahraď tyto hodnoty svými z Supabase projektu!
const SUPABASE_URL = 'https://TVUJ-PROJEKT.supabase.co'
const SUPABASE_ANON_KEY = 'tvuj-anon-key-zde'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Pomocné funkce pro snadnější práci
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
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
    return { data, error }
  },
  
  async clearMessages() {
    const { error } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    return { error }
  },
  
  // Realtime subscription pro zprávy
  subscribeToMessages(callback) {
    return supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        callback
      )
      .subscribe()
  },
  
  // Presence (online uživatelé)
  async setPresence(userId) {
    const { data, error } = await supabase
      .from('presence')
      .upsert([{ id: userId, online: true, timestamp: new Date().toISOString() }])
    return { data, error }
  },
  
  async removePresence(userId) {
    const { error } = await supabase
      .from('presence')
      .delete()
      .eq('id', userId)
    return { error }
  },
  
  async getOnlineCount() {
    const { count, error } = await supabase
      .from('presence')
      .select('*', { count: 'exact', head: true })
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
  }
}