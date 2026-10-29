import React, { useState } from 'react';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  Key,
  Globe,
  Terminal,
  UploadCloud,
  DownloadCloud,
  Check,
  ShieldCheck,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  resetSupabaseClient,
  isSupabaseConfigured,
} from '../../lib/supabase';
import { DataStore } from '../../lib/dataStore';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChanged: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnectionChanged,
}) => {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [testing, setTesting] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tablesReady?: boolean } | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    setSyncStatusMsg(null);

    const result = await testSupabaseConnection(url, anonKey);
    setTestResult(result);
    setTesting(false);

    if (result.sanitizedUrl && result.sanitizedUrl !== url) {
      setUrl(result.sanitizedUrl);
    }

    if (result.success || url.trim()) {
      saveSupabaseCredentials(result.sanitizedUrl || url, anonKey);
      resetSupabaseClient();
      onConnectionChanged();
      // Trigger background sync if tables exist
      if (result.tablesReady) {
        DataStore.syncFromSupabase();
      }
    }
  };

  const handlePushToCloud = async () => {
    setPushing(true);
    setSyncStatusMsg(null);
    const res = await DataStore.pushAllToSupabase();
    setPushing(false);
    setSyncStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  const handlePullFromCloud = async () => {
    setPulling(true);
    setSyncStatusMsg(null);
    const res = await DataStore.syncFromSupabase();
    setPulling(false);
    setSyncStatusMsg({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    onConnectionChanged();
  };

  const handleCopySql = () => {
    const migrationSql = `-- ====================================================================
-- SAPA PASIEN — RSUD AL-MULK KOTA SUKABUMI
-- Universal Cloud Database Schema & Realtime Setup (001_universal_schema.sql)
-- Mendukung Sinkronisasi Dua Arah Real-time antara Google AI Studio & Vercel
-- ====================================================================

-- 1. TABEL PENGATURAN APLIKASI & PROFIL RUMAH SAKIT (app_settings)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABEL PENGGUNA & HAK AKSES (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'supervisor', 'petugas', 'pimpinan')),
  department TEXT DEFAULT 'RSUD Al-Mulk',
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL MASTER RUANGAN RAWAT INAP (wards)
CREATE TABLE IF NOT EXISTS public.wards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 17,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABEL DOKUMENTASI KUNJUNGAN (visits)
CREATE TABLE IF NOT EXISTS public.visits (
  id TEXT PRIMARY KEY,
  visit_number TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  ward_id TEXT NOT NULL,
  ward_name TEXT,
  room_number TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  visitor_id TEXT NOT NULL,
  visitor_name TEXT,
  companion_name TEXT,
  companion_relation TEXT,
  social_observation TEXT NOT NULL,
  social_notes TEXT,
  psychological_observation TEXT NOT NULL,
  psychological_notes TEXT,
  spiritual_observation TEXT NOT NULL,
  spiritual_notes TEXT,
  comfort_score INTEGER,
  cleanliness_score INTEGER,
  communication_score INTEGER,
  responsiveness_score INTEGER,
  overall_satisfaction_score INTEGER,
  has_issue BOOLEAN NOT NULL DEFAULT false,
  general_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL KELUHAN & MASALAH PASIEN (issues)
CREATE TABLE IF NOT EXISTS public.issues (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  patient_name TEXT,
  visit_number TEXT,
  ward_name TEXT,
  room_number TEXT,
  visitor_name TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('rendah', 'sedang', 'tinggi', 'kritis')),
  status TEXT NOT NULL DEFAULT 'belum_ditindaklanjuti' CHECK (status IN (
    'belum_ditindaklanjuti', 'dalam_proses', 'menunggu_konfirmasi', 'selesai', 'diteruskan'
  )),
  assigned_unit TEXT,
  assigned_to TEXT,
  initial_action TEXT,
  due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  verified_by TEXT,
  verified_by_name TEXT,
  verified_at TIMESTAMPTZ,
  follow_up_logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABEL JEJAK AUDIT SISTEM (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_name TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. KEBIJAKAN KEAMANAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings universal access" ON public.app_settings;
CREATE POLICY "Settings universal access" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles universal access" ON public.profiles;
CREATE POLICY "Profiles universal access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Wards universal access" ON public.wards;
CREATE POLICY "Wards universal access" ON public.wards FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Visits universal access" ON public.visits;
CREATE POLICY "Visits universal access" ON public.visits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Issues universal access" ON public.issues;
CREATE POLICY "Issues universal access" ON public.issues FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Audit logs universal access" ON public.audit_logs;
CREATE POLICY "Audit logs universal access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 8. AKTIFKAN REALTIME REPLICATION
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wards;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
`;

    navigator.clipboard.writeText(migrationSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleClear = () => {
    saveSupabaseCredentials('', '');
    setUrl('');
    setAnonKey('');
    resetSupabaseClient();
    setTestResult({ success: true, message: 'Kredensial dibersihkan. Beralih ke penyimpanan lokal aktif.' });
    onConnectionChanged();
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Penyelarasan Data: Google AI Studio ↔ Vercel
              </h2>
              <p className="text-xs text-slate-500">
                Hubungkan database cloud PostgreSQL Supabase agar perubahan profil, ruangan, & pasien tersinkronisasi 100%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Explanation Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Mengapa data di Vercel dan Google AI Studio belum terhubung sebelumnya?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              Browser mengisolasi penyimpanan lokal (<em>localStorage</em>) per domain. Domain Google AI Studio (<code>ais-dev-*.run.app</code>) dan domain Vercel Anda (<code>*.vercel.app</code>) berjalan di lingkungan browser terpisah.
            </p>
            <p className="text-[11px] leading-relaxed font-medium text-amber-950">
              Agar perubahan profil rumah sakit, master ruangan, dan pengguna di AI Studio langsung tampil di Vercel, kedua lingkungan harus membaca dari database cloud Supabase yang sama.
            </p>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Project URL</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Anon (Public) Key</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Kunci anon publik aman digunakan di frontend aplikasi.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  testResult.success
                    ? testResult.tablesReady === false
                      ? 'bg-amber-50 text-amber-950 border-amber-300'
                      : 'bg-emerald-50 text-emerald-950 border-emerald-200'
                    : 'bg-red-50 text-red-950 border-red-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {testResult.success ? (
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        testResult.tablesReady === false ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-xs">
                      {testResult.success
                        ? testResult.tablesReady === false
                          ? 'Kredensial Valid! Langkah Terakhir: Buat Tabel Database'
                          : 'Koneksi Berhasil & Seluruh Tabel Siap Digunakan'
                        : 'Koneksi Gagal'}
                    </p>
                    <p className="mt-1 leading-relaxed text-[11px]">{testResult.message}</p>
                  </div>
                </div>

                {testResult.success && testResult.tablesReady === false && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedSql ? 'Tersalin!' : 'Salin SQL Migrasi Sekarang'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-xs"
              >
                {testing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{testing ? 'Menguji & Menyimpan...' : 'Uji & Simpan Koneksi'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Tersalin!' : 'Salin SQL Migrasi'}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
              >
                Gunakan Mode Lokal
              </button>
            </div>
          </form>

          {/* Sync Action Buttons */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 text-xs">Aksi Sinkronisasi Manual</h4>
                <p className="text-[11px] text-slate-500">
                  Unggah data yang sudah Anda edit di AI Studio ke Supabase, atau tarik data terbaru dari cloud.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePushToCloud}
                disabled={pushing || !isConfigured}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{pushing ? 'Mengunggah...' : 'Unggah Data Lokal ke Cloud (Push)'}</span>
              </button>

              <button
                type="button"
                onClick={handlePullFromCloud}
                disabled={pulling || !isConfigured}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>{pulling ? 'Menarik...' : 'Tarik Data dari Cloud (Pull)'}</span>
              </button>
            </div>

            {syncStatusMsg && (
              <p
                className={`text-[11px] font-medium ${
                  syncStatusMsg.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {syncStatusMsg.text}
              </p>
            )}
          </div>

          {/* 3 Steps Guide for Vercel */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Panduan 3 Langkah Menghubungkan ke Vercel</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600">
              <li>
                <strong>Jalankan SQL Migrasi:</strong> Salin script SQL di atas dan jalankan sekali di menu <em>SQL Editor</em> di dashboard Supabase Anda.
              </li>
              <li>
                <strong>Simpan Kredensial di AI Studio:</strong> Masukkan URL dan Anon Key di formulir di atas lalu klik <em>Uji & Simpan Koneksi</em>, kemudian klik <em>Unggah Data Lokal ke Cloud (Push)</em>.
              </li>
              <li>
                <strong>Hubungkan ke Vercel (Wajib untuk Sinkronisasi Publik):</strong>
                <p className="mt-0.5 text-slate-500">
                  Karena browser memisahkan memori penyimpanan lokal (localStorage) per domain dan per HP pengguna, <strong>Anda harus menambahkan 2 Environment Variables ini di Vercel</strong> agar setiap petugas/perawat yang membuka web Vercel otomatis tersambung ke database pusat:
                </p>
                <div className="my-1.5 p-2.5 bg-slate-100 rounded-lg font-mono text-[10px] text-slate-800 space-y-1 border border-slate-200">
                  <div><strong>Key:</strong> VITE_SUPABASE_URL <br /><strong>Value:</strong> {url || 'https://your-project.supabase.co'}</div>
                  <div className="pt-1 border-t border-slate-200"><strong>Key:</strong> VITE_SUPABASE_ANON_KEY <br /><strong>Value:</strong> {anonKey || 'your-anon-key'}</div>
                </div>
                <p className="text-slate-500">
                  Setelah menambahkannya di Vercel (<strong>Project Settings &rarr; Environment Variables</strong>), buka tab <strong>Deployments</strong> di Vercel &rarr; klik tanda titik tiga (...) pada deployment terbaru &rarr; pilih <strong>Redeploy</strong>.
                </p>
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            Status: {isConfigured ? '🟢 Cloud Supabase Aktif' : '🟡 Mode Lokal (Demo)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
