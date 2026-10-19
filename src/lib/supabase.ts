import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'sapa_supabase_url';
const STORAGE_KEY_KEY = 'sapa_supabase_key';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  return {
    url: storedUrl || envUrl || '',
    anonKey: storedKey || envKey || '',
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || url === 'https://your-project.supabase.co' || anonKey === 'your-anon-key') {
    return null;
  }

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    }
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL dan Anon Key Supabase wajib diisi.' };
    }
    const testClient = createClient(url, anonKey);
    // Attempt a lightweight query
    const { error } = await testClient.from('wards').select('id').limit(1);
    
    if (error) {
      // If table doesn't exist yet, it's still a valid connection to Supabase
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Terhubung ke Supabase! Tabel belum dibuat. Silakan jalankan script SQL migrasi yang disediakan di menu Pengaturan.',
        };
      }
      return { success: false, message: `Koneksi gagal: ${error.message} (Kode: ${error.code})` };
    }
    return { success: true, message: 'Koneksi ke Supabase PostgreSQL berhasil dan tabel ditemukan!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Kesalahan jaringan: ${msg}` };
  }
}
