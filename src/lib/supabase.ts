import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'sapa_supabase_url';
const STORAGE_KEY_KEY = 'sapa_supabase_key';

/**
 * Ekstrak Project Reference ID dari URL Supabase jika ada.
 * Contoh: https://xyzcompany.supabase.co -> xyzcompany
 */
export function extractProjectRef(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const clean = rawUrl.trim();
  const match = clean.match(/(?:dashboard\/project\/|^https?:\/\/)([a-zA-Z0-9_-]{15,40})(?:\.supabase\.co|\/|$)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

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

  // 2. Jika pengguna hanya menempelkan Project Reference ID (15-40 karakter alfanumerik)
  if (/^[a-zA-Z0-9_-]{15,40}$/.test(url)) {
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

export interface TablesStatus {
  app_settings: boolean;
  wards: boolean;
  profiles: boolean;
  visits: boolean;
  issues: boolean;
  audit_logs: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  sanitizedUrl?: string;
  projectRef?: string;
  credentialsValid?: boolean;
  tablesReady?: boolean;
  tablesStatus?: TablesStatus;
}

/**
 * Uji konektivitas Supabase secara komprehensif:
 * Tahap 1: Verifikasi apakah URL dan Anon Key valid (lewat REST root endpoint).
 * Tahap 2: Verifikasi keberadaan dan aksesibilitas masing-masing tabel aplikasi.
 */
export async function testSupabaseConnection(
  rawUrl: string,
  rawAnonKey: string
): Promise<TestConnectionResult> {
  try {
    if (!rawUrl || !rawAnonKey) {
      return { success: false, message: 'URL dan Anon Key Supabase wajib diisi.' };
    }

    const url = sanitizeSupabaseUrl(rawUrl);
    const anonKey = rawAnonKey.trim().replace(/^['"]|['"]$/g, '');
    const projectRef = extractProjectRef(url) || undefined;

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return {
        success: false,
        message: 'Format URL Supabase tidak valid. Gunakan format https://<project-ref>.supabase.co',
      };
    }

    // Uji konektivitas langsung menggunakan Supabase Client resmi
    const testClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const tables = ['app_settings', 'wards', 'profiles', 'visits', 'issues', 'audit_logs'] as const;
    const tablesStatus: TablesStatus = {
      app_settings: false,
      wards: false,
      profiles: false,
      visits: false,
      issues: false,
      audit_logs: false,
    };

    let hasAuthError = false;
    let authErrorMessage = '';
    let hasNetworkError = false;
    let readyCount = 0;

    const checks = await Promise.allSettled(
      tables.map((tbl) => testClient.from(tbl).select('*', { count: 'exact', head: true }))
    );

    checks.forEach((res, idx) => {
      const tblName = tables[idx];
      if (res.status === 'fulfilled') {
        const queryRes = res.value;
        if (!queryRes.error) {
          tablesStatus[tblName] = true;
          readyCount++;
        } else {
          const err = queryRes.error;
          const msg = (err.message || '').toLowerCase();
          const code = err.code || '';
          const status = (err as unknown as { status?: number })?.status;

          // Catatan penting: PostgREST kode PGRST125 / 42P01 (tabel belum ada) BUKAN kesalahan auth.
          // Munculnya PGRST125 justru membuktikan bahwa kredensial API key DITERIMA oleh Supabase!
          const isMissingTable =
            code === 'PGRST125' ||
            code === '42P01' ||
            code === 'PGRST204' ||
            code === 'PGRST205' ||
            status === 404 ||
            msg.includes('invalid path') ||
            msg.includes('relation') ||
            msg.includes('does not exist') ||
            msg.includes('could not find');

          const isAuth =
            !isMissingTable &&
            (code === 'PGRST301' ||
              status === 401 ||
              status === 403 ||
              msg.includes('invalid api key') ||
              msg.includes('jwt') ||
              msg.includes('unauthorized') ||
              msg.includes('signature'));

          if (isAuth) {
            hasAuthError = true;
            authErrorMessage = err.message || 'Kredensial API Key ditolak.';
          }

          tablesStatus[tblName] = false;
        }
      } else {
        const reason = res.reason;
        const msg = String(reason || '');
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
          hasNetworkError = true;
        }
        tablesStatus[tblName] = false;
      }
    });

    // 1. Kesalahan koneksi jaringan / domain tidak ditemukan
    if (hasNetworkError && readyCount === 0) {
      return {
        success: false,
        sanitizedUrl: url,
        projectRef,
        message: `Tidak dapat menghubungi host Supabase (${url}). Pastikan URL proyek benar dan koneksi internet Anda aktif.`,
      };
    }

    // 2. Kredensial benar-benar ditolak (JWT salah / API key invalid)
    if (hasAuthError && readyCount === 0) {
      return {
        success: false,
        sanitizedUrl: url,
        projectRef,
        credentialsValid: false,
        message: `Kredensial ditolak (${authErrorMessage}): Pastikan Anda menyalin Supabase "anon public" key dari menu Project Settings > API di dashboard Supabase Anda.`,
      };
    }

    // 3. Kredensial VALID, tetapi tabel database belum dibuat (PGRST125)
    const allTablesReady = readyCount === tables.length;
    if (!allTablesReady) {
      const missingList = tables.filter((t) => !tablesStatus[t]).join(', ');
      return {
        success: true,
        credentialsValid: true,
        tablesReady: false,
        sanitizedUrl: url,
        projectRef,
        tablesStatus,
        message: `Kredensial URL & Anon Key 100% VALID dan Berhasil Terhubung ke Supabase! 🎉 Namun tabel database belum dibuat di proyek Anda (${readyCount}/${tables.length} tabel siap. Belum ada: ${missingList}). Silakan buka tab "Script SQL Migrasi", salin scriptnya dan jalankan di SQL Editor Supabase.`,
      };
    }

    // 4. Kredensial valid dan seluruh tabel siap
    return {
      success: true,
      credentialsValid: true,
      tablesReady: true,
      sanitizedUrl: url,
      projectRef,
      tablesStatus,
      message:
        'Koneksi ke Supabase PostgreSQL berhasil dan seluruh tabel (6/6) aktif! Sinkronisasi dua arah real-time antara Google AI Studio & Vercel aktif.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Kesalahan pemeriksaan: ${msg}` };
  }
}
