import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'sapa_supabase_url';
const STORAGE_KEY_KEY = 'sapa_supabase_key';

/**
 * Normalisasi URL Supabase agar bebas dari trailing slash, /rest/v1,
 * atau format URL dashboard browser yang tidak sengaja ditempel.
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^['"]|['"]$/g, '');

  // 1. Jika pengguna menempelkan URL dashboard: https://supabase.com/dashboard/project/<ref>/...
  if (url.includes('supabase.com/dashboard/project/')) {
    const match = url.match(/dashboard\/project\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://${match[1]}.supabase.co`;
    }
  }

  // 2. Jika pengguna hanya menempelkan Project Reference ID (15-30 karakter alfanumerik)
  if (/^[a-zA-Z0-9_-]{15,35}$/.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // 3. Bersihkan akhiran /rest/v1 atau /rest/v1/
  url = url.replace(/\/rest\/v1\/?$/i, '');

  // 4. Bersihkan trailing slashes
  url = url.replace(/\/+$/, '');

  // 5. Pastikan diawali dengan protokol https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  return url;
}

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  return {
    url: sanitizeSupabaseUrl(storedUrl || envUrl || ''),
    anonKey: (storedKey || envKey || '').trim().replace(/^['"]|['"]$/g, ''),
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return (
    !!url &&
    !!anonKey &&
    url !== 'https://your-project.supabase.co' &&
    anonKey !== 'your-anon-key' &&
    url.startsWith('https://')
  );
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = anonKey.trim().replace(/^['"]|['"]$/g, '');

    if (cleanUrl) localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (cleanKey) localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
    else localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;
let currentClientConfig = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey || url === 'https://your-project.supabase.co' || anonKey === 'your-anon-key' || !url.startsWith('https://')) {
    return null;
  }

  const configSignature = `${url}:${anonKey}`;
  if (supabaseInstance && currentClientConfig === configSignature) {
    return supabaseInstance;
  }

  try {
    currentClientConfig = configSignature;
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function resetSupabaseClient() {
  if (supabaseInstance) {
    try {
      supabaseInstance.removeAllChannels();
    } catch {
      // ignore channel removal errors
    }
  }
  supabaseInstance = null;
  currentClientConfig = '';
}

export async function testSupabaseConnection(
  rawUrl: string,
  rawAnonKey: string
): Promise<{ success: boolean; message: string; tablesReady?: boolean; sanitizedUrl?: string }> {
  try {
    if (!rawUrl || !rawAnonKey) {
      return { success: false, message: 'URL dan Anon Key Supabase wajib diisi.' };
    }

    const url = sanitizeSupabaseUrl(rawUrl);
    const anonKey = rawAnonKey.trim().replace(/^['"]|['"]$/g, '');

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return { success: false, message: 'Format URL Supabase tidak valid. Gunakan format https://<id-proyek>.supabase.co' };
    }

    // Gunakan createClient langsung untuk menguji konektivitas & autentikasi
    const testClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Uji query ke salah satu tabel
    const { error } = await testClient.from('wards').select('id').limit(1);

    if (error) {
      const errMsg = (error.message || '').toLowerCase();
      const errDetails = (error.details || '').toLowerCase();
      const errStatus = (error as unknown as { status?: number })?.status;

      // 1. Kredensial tidak valid (JWT expired/invalid, API key salah, 401/403)
      const isAuthError =
        error.code === 'PGRST301' ||
        errStatus === 401 ||
        errStatus === 403 ||
        errMsg.includes('jwt') ||
        errMsg.includes('api key') ||
        errMsg.includes('apikey') ||
        errMsg.includes('unauthorized') ||
        errMsg.includes('invalid claim') ||
        errMsg.includes('signature');

      if (isAuthError) {
        return {
          success: false,
          sanitizedUrl: url,
          message: `Kredensial ditolak (${error.code || errStatus || '401/403'}): Pastikan Anda menyalin Supabase "anon public" key yang benar dari menu Project Settings > API di dashboard Supabase Anda.`,
        };
      }

      // 2. PGRST125 / 42P01: URL & Kunci VALID, tetapi tabel database belum dibuat di Supabase
      const isMissingTable =
        error.code === 'PGRST125' ||
        error.code === '42P01' ||
        error.code === 'PGRST200' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST205' ||
        errStatus === 404 ||
        errMsg.includes('invalid path') ||
        errMsg.includes('relation') ||
        errMsg.includes('does not exist') ||
        errMsg.includes('could not find') ||
        errMsg.includes('not found') ||
        errDetails.includes('relation') ||
        errDetails.includes('does not exist');

      if (isMissingTable) {
        return {
          success: true,
          tablesReady: false,
          sanitizedUrl: url,
          message:
            'Kredensial URL & Anon Key Supabase VALID dan berhasil terhubung! Tabel database belum dibuat di proyek Supabase Anda (PGRST125: Tabel belum ada). Silakan salin & jalankan script SQL migrasi yang disediakan di bawah ini pada menu SQL Editor di Supabase.',
        };
      }

      // 3. Error lainnya
      return {
        success: false,
        sanitizedUrl: url,
        message: `Koneksi gagal: ${error.message} (Kode: ${error.code || 'UNKNOWN'})`,
      };
    }

    // Jika query berhasil tanpa error, berarti koneksi valid dan tabel sudah ada
    return {
      success: true,
      tablesReady: true,
      sanitizedUrl: url,
      message:
        'Koneksi ke Supabase PostgreSQL berhasil dan tabel aktif! Sinkronisasi dua arah real-time antara Google AI Studio & Vercel aktif.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Kesalahan jaringan: ${msg}` };
  }
}
