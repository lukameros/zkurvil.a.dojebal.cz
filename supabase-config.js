// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://bmmaijlbpwgzhrxzxphf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Zprávy
const getMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('timestamp', { ascending: true });
  return { data, error };
};

const addMessage = async (message) => {
  const dbMessage = {
    username: message.user,
    text: message.text,
    timestamp: message.timestamp,
    is_admin: message.is_admin,
    is_guest: message.is_guest,
    is_system: message.is_system || false
  };
  
  const { data, error } = await supabase
    .from('messages')
    .insert([dbMessage])
    .select();
  return { data, error };
};

const clearMessages = async () => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  return { error };
};

const subscribeToMessages = (callback) => {
  return supabase
    .channel('messages')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'messages' },
      callback
    )
    .subscribe();
};

// Presence
const setPresence = async (userId) => {
  const { data, error } = await supabase
    .from('presence')
    .upsert([{ 
      id: userId, 
      online: true, 
      timestamp: new Date().toISOString() 
    }], { 
      onConflict: 'id'
    });
  return { data, error };
};

const removePresence = async (userId) => {
  const { error } = await supabase
    .from('presence')
    .delete()
    .eq('id', userId);
  return { error };
};

const getOnlineCount = async () => {
  const oneMinuteAgo = new Date();
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
  
  await supabase
    .from('presence')
    .delete()
    .lt('timestamp', oneMinuteAgo.toISOString());
  
  const { count, error } = await supabase
    .from('presence')
    .select('*', { count: 'exact', head: true });
  return { count, error };
};

const subscribeToPresence = (callback) => {
  return supabase
    .channel('presence')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'presence' },
      callback
    )
    .subscribe();
};

// Návody
const getNavody = async () => {
  const { data, error } = await supabase
    .from('navody')
    .select('*')
    .order('created_at', { ascending: true });
  return { data, error };
};

const addNavod = async (name) => {
  const { data, error } = await supabase
    .from('navody')
    .insert([{ name, created_at: new Date().toISOString() }])
    .select();
  return { data, error };
};

const deleteNavod = async (id) => {
  const { error } = await supabase
    .from('navody')
    .delete()
    .eq('id', id);
  return { error };
};

const subscribeToNavody = (callback) => {
  return supabase
    .channel('navody')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'navody' },
      callback
    )
    .subscribe();
};

// Archiv
const getArchiveImages = async (category) => {
  const table = category === 'Airsoft' ? 'archive_airsoft' : 'archive_hry';
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('uploaded_at', { ascending: false });
  return { data, error };
};

const addArchiveImage = async (category, imageData) => {
  const table = category === 'Airsoft' ? 'archive_airsoft' : 'archive_hry';
  const { data, error } = await supabase
    .from(table)
    .insert([{
      base64_data: imageData.base64Data,
      name: imageData.name,
      uploaded_at: new Date().toISOString()
    }])
    .select();
  return { data, error };
};

const deleteArchiveImage = async (category, id) => {
  const table = category === 'Airsoft' ? 'archive_airsoft' : 'archive_hry';
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  return { error };
};

const subscribeToArchive = (category, callback) => {
  const table = category === 'Airsoft' ? 'archive_airsoft' : 'archive_hry';
  return supabase
    .channel(`archive_${category}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: table },
      callback
    )
    .subscribe();
};

// Uživatelé
const registerUser = async (username, password, email = null) => {
  const { data: existing } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();
  
  if (existing) {
    return { error: { message: 'Uživatel již existuje!' } };
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert([{
      username,
      password,
      email,
      is_admin: false
    }])
    .select();
  return { data, error };
};

const loginUser = async (username, password) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();
  
  if (data) {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);
  }
  
  return { data, error };
};

const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

const deleteUser = async (id) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  return { error };
};

const toggleAdminStatus = async (userId, isAdmin) => {
  const { error } = await supabase
    .from('users')
    .update({ is_admin: isAdmin })
    .eq('id', userId);
  return { error };
};

// Export všech funkcí
export const db = {
  getMessages,
  addMessage,
  clearMessages,
  subscribeToMessages,
  setPresence,
  removePresence,
  getOnlineCount,
  subscribeToPresence,
  getNavody,
  addNavod,
  deleteNavod,
  subscribeToNavody,
  getArchiveImages,
  addArchiveImage,
  deleteArchiveImage,
  subscribeToArchive,
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
  toggleAdminStatus
};
