/**
 * Media Storage Helper using IndexedDB & Base64 / ObjectURL
 * Guarantees that uploaded videos and photos always display immediately
 * and persist across browser reloads.
 */

import hospitalInpatientCareImg from '../assets/images/hospital_inpatient_care_1792331925141.jpg';
import rsudAlMulkLogoImg from '../assets/images/rsud_almulk_logo_1792331924541.jpg';

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

export class MediaStorage {
  private static cachedObjectUrl: string | null = null;

  /**
   * Simpan file unggahan (foto atau video) ke IndexedDB dan buat DataURL/ObjectURL yang pasti muncul
   */
  static async saveUploadedMedia(
    file: File | Blob,
    type: 'video' | 'image',
    meta: Partial<WelcomeMediaConfig> = {}
  ): Promise<WelcomeMediaConfig> {
    // 1. Buat Object URL untuk penggunaan langsung tanpa delay
    const newObjectUrl = URL.createObjectURL(file);
    this.cachedObjectUrl = newObjectUrl;

    // 2. Simpan file blob asli ke IndexedDB untuk persistensi antar-sesi
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

    // 3. Untuk foto, baca sebagai base64 DataURL (bekerja 100% instan di browser)
    let fallbackDataUrl = '';
    if (type === 'image') {
      try {
        fallbackDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
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
      isBlob: true,
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
      // Simpan data URL jika ukurannya wajar di bawah 3MB, jika lebih simpan pointer IndexedDB
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

    return config;
  }

  /**
   * Simpan Preset atau URL eksternal
   */
  static savePresetMedia(config: WelcomeMediaConfig): void {
    // Jangan cabut object URL jika masih digunakan oleh config aktif
    if (!config.isBlob && this.cachedObjectUrl && this.cachedObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.cachedObjectUrl);
      this.cachedObjectUrl = null;
    }

    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // quota safeguard
    }
  }

  /**
   * Muat konfigurasi media aktif (memulihkan Blob dari IndexedDB bila perlu)
   */
  static async loadActiveMedia(): Promise<WelcomeMediaConfig> {
    if (typeof window === 'undefined') return DEFAULT_MEDIA_CONFIG;

    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!stored) {
      return DEFAULT_MEDIA_CONFIG;
    }

    try {
      const parsed: WelcomeMediaConfig = JSON.parse(stored);

      // Automatically migrate old default slogan to the new slogan requested by user
      if (
        !parsed.subtitle ||
        parsed.subtitle === '“KASIH SAYANG, EMPATI & ASUHAN HUMANIS”' ||
        parsed.subtitle.includes('KASIH SAYANG')
      ) {
        parsed.subtitle = '“MELAYANI DENGAN SEPENUH HATI”';
      }

      // 1. Jika URL adalah DataURL base64 atau link web langsung, langsung gunakan!
      if (
        parsed.url &&
        (parsed.url.startsWith('data:') ||
          parsed.url.startsWith('http://') ||
          parsed.url.startsWith('https://'))
      ) {
        return parsed;
      }

      // 2. Jika merupakan preset lokal yang menggunakan gambar bundel, pastikan URL valid
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

      // 3. Jika disimpan sebagai pointer IndexedDB atau blob
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
            // Untuk foto, buat juga data URL jika memungkinkan
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
    return DEFAULT_MEDIA_CONFIG;
  }
}
