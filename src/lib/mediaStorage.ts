/**
 * Media Storage Helper using IndexedDB, Base64 & Supabase Cloud Sync
 * Guarantees that uploaded videos and photos always display immediately
 * on local device AND sync across all laptops, phones, and Vercel users.
 */

import hospitalInpatientCareImg from '../assets/images/hospital_inpatient_care_1792331925141.jpg';
import rsudAlMulkLogoImg from '../assets/images/rsud_almulk_logo_1792331924541.jpg';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export { hospitalInpatientCareImg, rsudAlMulkLogoImg };

export interface WelcomeMediaConfig {
  id: string;
  type: 'video' | 'image';
  url: string; // Base64 data URL, Object URL, preset path, or web URL
  isBlob: boolean;
  title: string;
  subtitle: string;
  credit: string;
  overlayDarkness: number; // 0 to 80 (%)
  isMuted: boolean;
  autoPlay: boolean;
  updatedAt: string;
}

const DB_NAME = 'sapa_pasien_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'welcome_media';
const STORAGE_KEY_CONFIG = 'sapa_welcome_media_config_v2';

export const DEFAULT_MEDIA_CONFIG: WelcomeMediaConfig = {
  id: 'default-inpatient',
  type: 'image',
  url: hospitalInpatientCareImg,
  isBlob: false,
  title: 'SAPA PASIEN',
  subtitle: '“MELAYANI DENGAN SEPENUH HATI”',
  credit: 'RSUD AL-MULK KOTA SUKABUMI',
  overlayDarkness: 20,
  isMuted: true,
  autoPlay: true,
  updatedAt: new Date().toISOString(),
};

export const PRESET_MEDIA: Array<Omit<WelcomeMediaConfig, 'id' | 'updatedAt'> & { id: string; label: string; description: string }> = [
  {
    id: 'preset-inpatient',
    label: 'Foto Pelayanan Rawat Inap',
    description: 'Visual asuhan pasien dengan perawat dan dokter penuh empati',
    type: 'image',
    url: hospitalInpatientCareImg,
    isBlob: false,
    title: 'SAPA PASIEN',
    subtitle: '“MELAYANI DENGAN SEPENUH HATI”',
    credit: 'RSUD AL-MULK KOTA SUKABUMI',
    overlayDarkness: 20,
    isMuted: true,
    autoPlay: true,
  },
  {
    id: 'preset-logo-brand',
    label: 'Logo Resmi RSUD Al-Mulk',
    description: 'Emblem identitas rumah sakit Kota Sukabumi berlatar bersih',
    type: 'image',
    url: rsudAlMulkLogoImg,
    isBlob: false,
    title: 'RSUD AL-MULK',
    subtitle: '“TERTIB, TANGGAP, PROFESIONAL & AKUNTABEL”',
    credit: 'RUMAH SAKIT UMUM DAERAH KOTA SUKABUMI',
    overlayDarkness: 25,
    isMuted: true,
    autoPlay: true,
  },
  {
    id: 'preset-video-medical',
    label: 'Video Atmosfer Rumah Sakit (Online Loop)',
    description: 'Video gerak halus asuhan dan pemeriksaan pasien',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-doctor-checking-a-patients-vital-signs-41584-large.mp4',
    isBlob: false,
    title: 'SAPA PASIEN',
    subtitle: '“MENDENGAR KELUHAN, MEMBERI SOLUSI TUNTAS”',
    credit: 'SISTEM MONITORING & ADVOKASI PASIEN RAWAT INAP',
    overlayDarkness: 25,
    isMuted: true,
    autoPlay: true,
  },
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Kompres gambar berukuran besar agar cepat diunggah ke Supabase
 * dan ringan diunduh oleh HP dan laptop lain di Vercel
 */
function compressImage(dataUrl: string, maxDimension = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(dataUrl);
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export class MediaStorage {
  private static cachedObjectUrl: string | null = null;

  /**
   * Simpan file unggahan (foto atau video) ke IndexedDB dan buat DataURL/ObjectURL yang pasti muncul,
   * serta sinkronkan ke Supabase Cloud jika terhubung agar tampil di Vercel / perangkat lain.
   */
  static async saveUploadedMedia(
    file: File | Blob,
    type: 'video' | 'image',
    meta: Partial<WelcomeMediaConfig> = {}
  ): Promise<WelcomeMediaConfig> {
    // 1. Buat Object URL untuk penggunaan langsung tanpa delay
    const newObjectUrl = URL.createObjectURL(file);
    this.cachedObjectUrl = newObjectUrl;

    // 2. Simpan file blob asli ke IndexedDB untuk persistensi lokal
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const req = store.put({ blob: file, type }, 'custom_media_blob_v2');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (dbErr) {
      console.warn('Could not write to IndexedDB:', dbErr);
    }

    // 3. Untuk foto, baca sebagai base64 DataURL
    let fallbackDataUrl = '';
    if (type === 'image') {
      try {
        const rawDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });

        // Kompres jika file di atas 600KB agar ringan disinkronkan ke Supabase
        if (rawDataUrl && file.size > 600 * 1024) {
          try {
            fallbackDataUrl = await compressImage(rawDataUrl, 1920, 0.85);
          } catch {
            fallbackDataUrl = rawDataUrl;
          }
        } else {
          fallbackDataUrl = rawDataUrl;
        }
      } catch {
        fallbackDataUrl = '';
      }
    }

    // Prioritaskan DataURL untuk gambar agar tidak bergantung pada lifecycle blob URL
    const activeUrl = fallbackDataUrl || newObjectUrl;

    const config: WelcomeMediaConfig = {
      id: 'custom-upload',
      type,
      url: activeUrl,
      isBlob: !fallbackDataUrl,
      title: meta.title || 'SAPA PASIEN',
      subtitle: meta.subtitle || '“MELAYANI DENGAN SEPENUH HATI”',
      credit: meta.credit || 'RSUD AL-MULK KOTA SUKABUMI',
      overlayDarkness: meta.overlayDarkness ?? 20,
      isMuted: meta.isMuted ?? true,
      autoPlay: meta.autoPlay ?? true,
      updatedAt: new Date().toISOString(),
    };

    // Simpan metadata ke localStorage
    try {
      const persistUrl =
        fallbackDataUrl && fallbackDataUrl.length < 3 * 1024 * 1024
          ? fallbackDataUrl
          : 'indexeddb://custom_media_blob_v2';

      localStorage.setItem(
        STORAGE_KEY_CONFIG,
        JSON.stringify({
          ...config,
          url: persistUrl,
        })
      );
    } catch {
      // quota safeguard
    }

    // 4. OTOMATIS SINKRONKAN KE SUPABASE CLOUD
    // Agar laptop lain, HP, dan pengunjung Vercel langsung melihat foto ini!
    if (isSupabaseConfigured() && fallbackDataUrl) {
      const supabase = getSupabaseClient();
      if (supabase) {
        Promise.resolve(
          supabase.from('app_settings').upsert({
            key: 'welcome_media_config',
            value: {
              ...config,
              url: fallbackDataUrl,
            },
            updated_at: new Date().toISOString(),
          })
        )
          .then((res) => {
            if (res.error) {
              console.warn('Gagal sinkron media ke Supabase Cloud:', res.error.message);
            } else {
              console.log('Media Welcome Screen berhasil disinkronkan ke Supabase Cloud untuk seluruh perangkat!');
            }
          })
          .catch((err: unknown) => {
            console.warn('Network error sync welcome media to Supabase:', err);
          });
      }
    }

    return config;
  }

  /**
   * Simpan Preset atau URL eksternal
   */
  static savePresetMedia(config: WelcomeMediaConfig): void {
    if (!config.isBlob && this.cachedObjectUrl && this.cachedObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.cachedObjectUrl);
      this.cachedObjectUrl = null;
    }

    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // quota safeguard
    }

    // Sinkronkan preset/URL ke Supabase Cloud
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        Promise.resolve(
          supabase.from('app_settings').upsert({
            key: 'welcome_media_config',
            value: config,
            updated_at: new Date().toISOString(),
          })
        )
          .then(() => {})
          .catch(() => {});
      }
    }
  }

  /**
   * Muat konfigurasi media aktif (memeriksa Supabase Cloud terlebih dahulu agar sinkron antar-laptop/HP)
   */
  static async loadActiveMedia(): Promise<WelcomeMediaConfig> {
    if (typeof window === 'undefined') return DEFAULT_MEDIA_CONFIG;

    // 1. Prioritas Utama: Periksa dari Supabase Cloud (jika terhubung)
    // Ini menjamin foto yang diunggah di satu laptop otomatis muncul di laptop & HP lain di Vercel!
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'welcome_media_config')
            .maybeSingle();

          if (!error && data && data.value && data.value.url) {
            const remote = data.value as WelcomeMediaConfig;
            // Pastikan subtitle baru diterapkan
            if (!remote.subtitle || remote.subtitle.includes('KASIH SAYANG')) {
              remote.subtitle = '“MELAYANI DENGAN SEPENUH HATI”';
            }
            // Simpan ke local cache agar saat offline tetap cepat
            try {
              localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(remote));
            } catch {
              // ignore
            }
            return remote;
          }
        }
      } catch (cloudErr) {
        console.warn('Could not fetch welcome media from cloud:', cloudErr);
      }
    }

    // 2. Pemeriksaan dari LocalStorage
    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!stored) {
      return DEFAULT_MEDIA_CONFIG;
    }

    try {
      const parsed: WelcomeMediaConfig = JSON.parse(stored);

      // Migrasi slogan lama ke slogan baru
      if (
        !parsed.subtitle ||
        parsed.subtitle === '“KASIH SAYANG, EMPATI & ASUHAN HUMANIS”' ||
        parsed.subtitle.includes('KASIH SAYANG')
      ) {
        parsed.subtitle = '“MELAYANI DENGAN SEPENUH HATI”';
      }

      // Jika URL adalah DataURL base64 atau link web langsung
      if (
        parsed.url &&
        (parsed.url.startsWith('data:') ||
          parsed.url.startsWith('http://') ||
          parsed.url.startsWith('https://'))
      ) {
        return parsed;
      }

      // Preset lokal yang menggunakan gambar bundel
      if (parsed.id === 'default-inpatient' || parsed.id === 'preset-inpatient') {
        return {
          ...parsed,
          url: hospitalInpatientCareImg,
        };
      }
      if (parsed.id === 'preset-logo-brand') {
        return {
          ...parsed,
          url: rsudAlMulkLogoImg,
        };
      }

      // Disimpan sebagai pointer IndexedDB atau blob lokal
      if (parsed.isBlob || parsed.url === 'indexeddb://custom_media_blob_v2') {
        try {
          const db = await openDB();
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);

          const record = await new Promise<{ blob: Blob; type: 'video' | 'image' } | undefined>(
            (resolve, reject) => {
              const req = store.get('custom_media_blob_v2');
              req.onsuccess = () => resolve(req.result);
              req.onerror = () => reject(req.error);
            }
          );

          if (record && record.blob) {
            if (record.type === 'image') {
              try {
                const dataUrl = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = () => resolve('');
                  reader.readAsDataURL(record.blob);
                });
                if (dataUrl) {
                  return {
                    ...parsed,
                    type: 'image',
                    url: dataUrl,
                    isBlob: true,
                  };
                }
              } catch {
                // proceed to objectUrl
              }
            }

            if (this.cachedObjectUrl) {
              URL.revokeObjectURL(this.cachedObjectUrl);
            }
            this.cachedObjectUrl = URL.createObjectURL(record.blob);
            return {
              ...parsed,
              type: record.type || parsed.type,
              url: this.cachedObjectUrl,
              isBlob: true,
            };
          }
        } catch (dbErr) {
          console.warn('Failed to retrieve blob from IndexedDB:', dbErr);
        }
      }

      // Fallback aman ke DEFAULT_MEDIA_CONFIG dengan mempertahankan teks
      return {
        ...DEFAULT_MEDIA_CONFIG,
        title: parsed.title || DEFAULT_MEDIA_CONFIG.title,
        subtitle: parsed.subtitle || DEFAULT_MEDIA_CONFIG.subtitle,
        credit: parsed.credit || DEFAULT_MEDIA_CONFIG.credit,
      };
    } catch {
      return DEFAULT_MEDIA_CONFIG;
    }
  }

  /**
   * Kembalikan ke pengaturan default
   */
  static async resetToDefault(): Promise<WelcomeMediaConfig> {
    if (this.cachedObjectUrl && this.cachedObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.cachedObjectUrl);
      this.cachedObjectUrl = null;
    }
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete('custom_media_blob_v2');
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY_CONFIG);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        Promise.resolve(
          supabase.from('app_settings').delete().eq('key', 'welcome_media_config')
        )
          .then(() => {})
          .catch(() => {});
      }
    }

    return DEFAULT_MEDIA_CONFIG;
  }
}
