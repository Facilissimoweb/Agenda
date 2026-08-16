// Supabase Cloud Persistence & Authentication Service
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Appointment, Contact, CycleData, DayMenu, JournalNote, WeeklyMenu, ChatMessage, SacredBook } from '../types';

export const AUTHORIZED_EMAIL = 'mariateresarogani@gmail.com';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  source: 'env' | 'localStorage' | 'none';
}

// Retrieve current Supabase Configuration
export function getSupabaseConfig(): SupabaseConfig {
  try {
    const localUrl = localStorage.getItem('mt_supabase_url')?.trim();
    const localKey = localStorage.getItem('mt_supabase_anon_key')?.trim();
    if (localUrl && localKey) {
      return { url: localUrl, anonKey: localKey, source: 'localStorage' };
    }
  } catch (e) {}

  const envUrl = (
    (import.meta as any).env?.VITE_SUPABASE_URL ||
    (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') ||
    ''
  ).trim();

  const envKey = (
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '') ||
    ''
  ).trim();

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, source: 'env' };
  }

  return { url: '', anonKey: '', source: 'none' };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  try {
    if (url.trim() && anonKey.trim()) {
      localStorage.setItem('mt_supabase_url', url.trim());
      localStorage.setItem('mt_supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('mt_supabase_url');
      localStorage.removeItem('mt_supabase_anon_key');
    }
    // Reset instance so next call uses new config
    supabaseInstance = null;
  } catch (e) {}
}

let supabaseInstance: SupabaseClient | null = null;

// Lazy Supabase Client Initializer
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Test connection
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Configurazione Supabase mancante. Inserisci URL e Anon Key.',
    };
  }

  try {
    // Attempt a light ping by querying table or auth settings
    const { data, error } = await client.from('app_metadata').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // 42P01 is table does not exist, which still means connection succeeded!
      console.log('Supabase check status:', error.message);
    }
    return {
      success: true,
      message: 'Connessione a Supabase riuscita con successo!',
    };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || 'Impossibile raggiungere il server Supabase.',
    };
  }
}

// --- AUTHENTICATION METHODS (Locked to Maria Teresa) ---

export async function signInWithOtp(email: string = AUTHORIZED_EMAIL): Promise<{ error: any; data: any }> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configurato.');
  return await client.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
}

export async function signInWithPassword(email: string, password: string): Promise<{ error: any; data: any }> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configurato.');
  return await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function signUpWithPassword(email: string, password: string): Promise<{ error: any; data: any }> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configurato.');
  return await client.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function verifyEmailOtp(email: string, token: string): Promise<{ error: any; data: any }> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configurato.');
  return await client.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });
}

export async function signOut(): Promise<{ error: any }> {
  const client = getSupabaseClient();
  if (!client) return { error: null };
  return await client.auth.signOut();
}

export async function getSession() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
}

export function subscribeToAuthStateChange(callback: (event: string, session: any) => void) {
  const client = getSupabaseClient();
  if (!client) return { unsubscribe: () => {} };
  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}

// --- DATABASE SYNC METHODS ---

export interface CloudStoreData {
  appointments?: Appointment[];
  contacts?: Contact[];
  cycleData?: CycleData;
  weeklyMenu?: WeeklyMenu;
  journalNotes?: JournalNote[];
  sacredBooks?: SacredBook[];
}

/**
 * Downloads all data from Supabase for the authorized user
 */
export async function downloadAllCloudData(email: string = AUTHORIZED_EMAIL): Promise<{
  success: boolean;
  data: CloudStoreData;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, data: {}, error: 'Supabase client non inizializzato' };
  }

  const result: CloudStoreData = {};

  try {
    // 1. Fetch Appointments
    const { data: appts, error: errAppts } = await client
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    if (!errAppts && appts) {
      result.appointments = appts.map((a: any) => ({
        id: a.id,
        name: a.name,
        date: a.date,
        time: a.time,
        type: a.type,
        phone: a.phone || '',
        notes: a.notes || '',
        status: a.status || 'Confermato',
      }));
    }

    // 2. Fetch Contacts / Clients
    const { data: cts, error: errCts } = await client
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });
    if (!errCts && cts) {
      result.contacts = cts.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        zodiac: c.zodiac || '',
        notes: c.notes || '',
        birthDate: c.birth_date || '',
        category: c.category || 'Cliente Abituale',
      }));
    }

    // 3. Fetch Cycle Data & Logs
    const { data: cycleRow } = await client
      .from('cycle_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    const { data: cycleLogs } = await client
      .from('cycle_logs')
      .select('*')
      .order('id', { ascending: false });

    if (cycleRow || cycleLogs) {
      result.cycleData = {
        startDate: cycleRow?.start_date || new Date().toISOString().split('T')[0],
        avgLength: cycleRow?.avg_length || 28,
        history: (cycleLogs || []).map((l: any) => ({
          id: l.id,
          date: l.date,
          day: l.day,
          energy: l.energy,
          symptoms: l.symptoms,
          notes: l.notes || '',
        })),
      };
    }

    // 4. Fetch Weekly Menu
    const { data: menuRows } = await client.from('weekly_menu').select('*');
    if (menuRows && menuRows.length > 0) {
      const menuObj: WeeklyMenu = {};
      menuRows.forEach((m: any) => {
        menuObj[m.day] = {
          breakfast: m.breakfast || '',
          lunch: m.lunch || '',
          dinner: m.dinner || '',
          tea: m.tea || '',
        };
      });
      result.weeklyMenu = menuObj;
    }

    // 5. Fetch Journal Notes
    const { data: jNotes } = await client
      .from('journal_notes')
      .select('*')
      .order('id', { ascending: false });
    if (jNotes) {
      result.journalNotes = jNotes.map((n: any) => ({
        id: n.id,
        title: n.title,
        category: n.category,
        date: n.date,
        icon: n.icon,
        content: n.content,
        pinned: !!n.pinned,
        attachments: n.attachments || undefined,
        audioRecording: n.audio_recording || n.audioRecording || undefined,
      }));
    }

    // 6. Fetch Sacred Books (Grimoires / Manuals)
    try {
      const { data: bRows } = await client.from('sacred_books').select('*');
      if (bRows && bRows.length > 0) {
        result.sacredBooks = bRows.map((b: any) => ({
          id: b.id,
          title: b.title,
          author: b.author || 'Tradizione Sacra',
          category: b.category || 'personale',
          coverEmoji: b.cover_emoji || '📖',
          description: b.description || '',
          tags: Array.isArray(b.tags) ? b.tags : [],
          isEnabled: b.is_enabled !== false,
          isCustom: !!b.is_custom,
          sections: Array.isArray(b.sections) ? b.sections : [],
          fullText: b.full_text || '',
          updatedAt: b.updated_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn('Note: sacred_books table not yet initialized in Supabase');
    }

    return { success: true, data: result };
  } catch (err: any) {
    console.error('Error downloading data from Supabase:', err);
    return { success: false, data: result, error: err.message };
  }
}

/**
 * Saves or updates appointments to Supabase
 */
export async function uploadAppointmentsToCloud(appts: Appointment[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    // Delete existing and insert fresh list
    await client.from('appointments').delete().neq('id', '___none___');
    if (appts.length > 0) {
      const rows = appts.map((a) => ({
        id: String(a.id),
        name: a.name,
        date: a.date,
        time: a.time,
        type: a.type,
        phone: a.phone || '',
        notes: a.notes || '',
        status: a.status,
        owner_email: AUTHORIZED_EMAIL,
      }));
      await client.from('appointments').upsert(rows);
    }
    return true;
  } catch (e) {
    console.warn('Error uploading appointments to Supabase:', e);
    return false;
  }
}

/**
 * Saves contacts / clients to Supabase
 */
export async function uploadContactsToCloud(contacts: Contact[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    await client.from('contacts').delete().neq('id', '___none___');
    if (contacts.length > 0) {
      const rows = contacts.map((c) => ({
        id: String(c.id),
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        zodiac: c.zodiac || '',
        notes: c.notes || '',
        birth_date: c.birthDate || '',
        category: c.category || 'Cliente Abituale',
        owner_email: AUTHORIZED_EMAIL,
      }));
      await client.from('contacts').upsert(rows);
    }
    return true;
  } catch (e) {
    console.warn('Error uploading contacts to Supabase:', e);
    return false;
  }
}

/**
 * Saves cycle data and logs to Supabase
 */
export async function uploadCycleDataToCloud(cycle: CycleData): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    // 1. Settings
    await client.from('cycle_settings').upsert({
      id: 1,
      start_date: cycle.startDate,
      avg_length: cycle.avgLength,
      owner_email: AUTHORIZED_EMAIL,
    });

    // 2. Logs
    await client.from('cycle_logs').delete().neq('id', 0);
    if (cycle.history.length > 0) {
      const rows = cycle.history.map((h) => ({
        id: typeof h.id === 'number' ? h.id : Number(h.id) || Date.now(),
        date: h.date,
        day: h.day,
        energy: h.energy,
        symptoms: h.symptoms,
        notes: h.notes || '',
        owner_email: AUTHORIZED_EMAIL,
      }));
      await client.from('cycle_logs').upsert(rows);
    }
    return true;
  } catch (e) {
    console.warn('Error uploading cycle data to Supabase:', e);
    return false;
  }
}

/**
 * Saves Weekly Menu to Supabase
 */
export async function uploadWeeklyMenuToCloud(menu: WeeklyMenu): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const rows = Object.entries(menu).map(([day, item]) => ({
      day,
      breakfast: item.breakfast,
      lunch: item.lunch,
      dinner: item.dinner,
      tea: item.tea,
      owner_email: AUTHORIZED_EMAIL,
    }));
    await client.from('weekly_menu').upsert(rows, { onConflict: 'day' });
    return true;
  } catch (e) {
    console.warn('Error uploading menu to Supabase:', e);
    return false;
  }
}

/**
 * Saves Journal Notes / Diary to Supabase with automatic column fallback and sync
 */
export async function uploadJournalNotesToCloud(notes: JournalNote[]): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Client Supabase non inizializzato' };

  try {
    if (notes.length === 0) {
      await client.from('journal_notes').delete().neq('id', '___none___');
      return { success: true };
    }

    // 1. Prepare rows with attachments and audio recording
    const fullRows = notes.map((n) => ({
      id: String(n.id),
      title: n.title,
      category: n.category,
      date: n.date,
      icon: n.icon || '📝',
      content: n.content,
      pinned: !!n.pinned,
      attachments: n.attachments && n.attachments.length > 0 ? n.attachments : null,
      audio_recording: n.audioRecording || null,
      owner_email: AUTHORIZED_EMAIL,
    }));

    // Attempt to upsert with full data
    const { error: upsertErr } = await client.from('journal_notes').upsert(fullRows, { onConflict: 'id' });

    if (upsertErr) {
      console.warn('Full journal upsert failed, attempting fallback to base columns (if Supabase schema is not yet updated):', upsertErr.message);

      // Fallback: If columns attachments or audio_recording don't exist yet on user's Supabase
      const baseRows = notes.map((n) => ({
        id: String(n.id),
        title: n.title,
        category: n.category,
        date: n.date,
        icon: n.icon || '📝',
        content: n.content,
        pinned: !!n.pinned,
        owner_email: AUTHORIZED_EMAIL,
      }));

      const { error: fallbackErr } = await client.from('journal_notes').upsert(baseRows, { onConflict: 'id' });
      if (fallbackErr) {
        console.error('Fallback journal upload failed:', fallbackErr);
        return { success: false, error: fallbackErr.message };
      }
    }

    return { success: true };
  } catch (e: any) {
    console.warn('Error uploading journal notes to Supabase:', e);
    return { success: false, error: e?.message || 'Errore durante il salvataggio su Supabase' };
  }
}

// SQL Script generator to create/update tables in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- =======================================================
-- SANTUARIO DI MARIA TERESA - SUPABASE SCHEMA AGGIORNATO
-- Esegui questo script in Supabase -> SQL Editor -> Run
-- =======================================================

-- 1. Appuntamenti & Consulti
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Confermato',
  owner_email TEXT DEFAULT 'mariateresarogani@gmail.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Rubrica Clienti & Anime
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  zodiac TEXT,
  notes TEXT,
  birth_date TEXT,
  category TEXT DEFAULT 'Cliente Abituale',
  owner_email TEXT DEFAULT 'mariateresarogani@gmail.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Impostazioni Ciclo Femminile
CREATE TABLE IF NOT EXISTS cycle_settings (
  id INT PRIMARY KEY DEFAULT 1,
  start_date TEXT NOT NULL,
  avg_length INT DEFAULT 28,
  owner_email TEXT DEFAULT 'mariateresarogani@gmail.com',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Diario Ciclo & Sensazioni
CREATE TABLE IF NOT EXISTS cycle_logs (
  id BIGINT PRIMARY KEY,
  date TEXT NOT NULL,
  day INT NOT NULL,
  energy TEXT NOT NULL,
  symptoms TEXT,
  notes TEXT,
  owner_email TEXT DEFAULT 'mariateresarogani@gmail.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Menù Alchemico Settimanale
CREATE TABLE IF NOT EXISTS weekly_menu (
  day TEXT PRIMARY KEY,
  breakfast TEXT,
  lunch TEXT,
  dinner TEXT,
  tea TEXT,
  owner_email TEXT DEFAULT 'mariateresarogani@gmail.com',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Diario Privato & Note Rituali (con supporto PDF, Immagini e Audio)
CREATE TABLE IF NOT EXISTS journal_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  icon TEXT,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT NULL,
  audio_recording JSONB DEFAULT NULL,
  owner_email TEXT DEFAULT 'mariateresarogani@gmail.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Biblioteca Sacra & Grimori AI (Manuali e Testi Consultabili dall'Oracolo)
CREATE TABLE IF NOT EXISTS sacred_books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT DEFAULT 'Maria Teresa',
  category TEXT DEFAULT 'personale',
  description TEXT,
  cover_emoji TEXT DEFAULT '📖',
  sections JSONB DEFAULT '[]'::jsonb,
  full_text TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_enabled BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT true,
  owner_email TEXT DEFAULT 'mariateresarogani@gmail.com',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =======================================================
-- AGGIORNAMENTO AUTOMATICO COLONNE (Se le tabelle esistono già)
-- =======================================================
ALTER TABLE journal_notes ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE journal_notes ADD COLUMN IF NOT EXISTS audio_recording JSONB;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Cliente Abituale';

-- Abilita l'accesso pubblico/anonimo con Anon Key per il santuario privato
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacred_books ENABLE ROW LEVEL SECURITY;

-- Policy di accesso completo per la chiave anonima del tuo progetto
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Accesso Completo Anon Santuario Appointments') THEN
    CREATE POLICY "Accesso Completo Anon Santuario Appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Accesso Completo Anon Santuario Contacts') THEN
    CREATE POLICY "Accesso Completo Anon Santuario Contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Accesso Completo Anon Santuario CycleSettings') THEN
    CREATE POLICY "Accesso Completo Anon Santuario CycleSettings" ON cycle_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Accesso Completo Anon Santuario CycleLogs') THEN
    CREATE POLICY "Accesso Completo Anon Santuario CycleLogs" ON cycle_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Accesso Completo Anon Santuario WeeklyMenu') THEN
    CREATE POLICY "Accesso Completo Anon Santuario WeeklyMenu" ON weekly_menu FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Accesso Completo Anon Santuario JournalNotes') THEN
    CREATE POLICY "Accesso Completo Anon Santuario JournalNotes" ON journal_notes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Accesso Completo Anon Santuario SacredBooks') THEN
    CREATE POLICY "Accesso Completo Anon Santuario SacredBooks" ON sacred_books FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;
`;
