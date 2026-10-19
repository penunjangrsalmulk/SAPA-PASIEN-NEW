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
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  resetSupabaseClient,
} from '../../lib/supabase';

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
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url, anonKey);
    setTestResult(result);
    setTesting(false);

    if (result.success || url.trim()) {
      saveSupabaseCredentials(url, anonKey);
      resetSupabaseClient();
      onConnectionChanged();
    }
  };

  const handleCopySql = () => {
    const migrationSql = `-- ====================================================================
-- SAPA PASIEN — RSUD AL-MULK KOTA SUKABUMI: INITIAL MIGRATION
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'supervisor', 'petugas', 'pimpinan')),
  department TEXT DEFAULT 'RSUD Al-Mulk',
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.wards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 15,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_number TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  ward_id UUID NOT NULL REFERENCES public.wards(id) ON DELETE RESTRICT,
  room_number TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  visitor_id UUID NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'belum_ditindaklanjuti',
  assigned_unit TEXT,
  assigned_to TEXT,
  initial_action TEXT,
  due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.follow_up_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  action_description TEXT NOT NULL,
  status_after_action TEXT NOT NULL,
  actor_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  actor_name TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.wards (name, code, floor, capacity) VALUES
  ('Ruang Fatimah', 'FATIMAH', 1, 17),
  ('Ruang Aisyah', 'AISYAH', 1, 17),
  ('Ruang Usman', 'USMAN', 2, 17),
  ('Ruang Khadijah', 'KHADIJAH', 2, 17),
  ('IGD', 'IGD', 1, 17),
  ('Rawat Jalan', 'RAWAT_JALAN', 1, 17),
  ('ICU', 'ICU', 1, 17)
ON CONFLICT (code) DO NOTHING;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Koneksi Supabase PostgreSQL</h2>
              <p className="text-xs text-slate-500">Database & Realtime SAPA PASIEN RSUD Al-Mulk</p>
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
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 leading-relaxed text-blue-900">
            <p className="font-semibold mb-1">Status Penyimpanan Data</p>
            <p>
              Aplikasi SAPA PASIEN saat ini beroperasi penuh dengan repositori data lokal RSUD Al-Mulk.
              Untuk mengaktifkan sinkronisasi cloud PostgreSQL dan Realtime secara online, masukkan URL Proyek dan Kunci Anonim Supabase Anda di bawah ini.
            </p>
          </div>

          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Project URL Supabase
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                Supabase Anon (Public) Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-semibold">{testResult.success ? 'Sukses' : 'Perhatian'}</p>
                  <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                {testing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{testing ? 'Menguji...' : 'Uji & Simpan Koneksi'}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Gunakan Mode Lokal
              </button>
            </div>
          </form>

          {/* Quick Migration copy helper */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Script Migrasi Tabel Supabase</span>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin SQL Migrasi'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jalankan script migrasi ini di menu <strong>SQL Editor</strong> di dashboard Supabase Anda untuk membuat tabel <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">visits</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">issues</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">wards</code>, dan <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">profiles</code> secara instan.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
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
