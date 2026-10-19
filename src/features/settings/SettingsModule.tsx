import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Users,
  Shield,
  Layers,
  Clock,
  Database,
  History,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Ward, UserProfile, AuditLog, UserRole } from '../../types';
import { DataStore, DEMO_ACCOUNTS } from '../../lib/dataStore';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  resetSupabaseClient,
} from '../../lib/supabase';

interface SettingsModuleProps {
  onOpenSupabaseModal: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onOpenSupabaseModal }) => {
  const currentUser: UserProfile = useMemo(() => DataStore.getCurrentUser(), []);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'users' | 'wards' | 'categories' | 'database' | 'audit'
  >('profile');

  const [wards, setWards] = useState<Ward[]>(DataStore.getWards());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DataStore.getAuditLogs());

  // Supabase states
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedMigration, setCopiedMigration] = useState(false);

  useEffect(() => {
    const unsub = DataStore.subscribe(() => {
      setWards(DataStore.getWards());
      setAuditLogs(DataStore.getAuditLogs());
    });
    return () => unsub();
  }, []);

  const handleTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestResult(res);
    setIsTesting(false);

    if (res.success || supabaseUrl.trim()) {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      resetSupabaseClient();
    }
  };

  const copyMigrationSql = () => {
    const sql = `-- Migration SQL: SAPA PASIEN RSUD Al-Mulk
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
    navigator.clipboard.writeText(sql);
    setCopiedMigration(true);
    setTimeout(() => setCopiedMigration(false), 2500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 text-xs font-semibold">
        {[
          { id: 'profile', label: 'Profil RSUD Al-Mulk', icon: Building2 },
          { id: 'users', label: 'Pengguna & Hak Akses', icon: Users },
          { id: 'wards', label: 'Master Ruangan', icon: Layers },
          { id: 'categories', label: 'Kategori & SLA', icon: Clock },
          { id: 'database', label: 'Integrasi Supabase', icon: Database },
          { id: 'audit', label: 'Audit Trail & Log', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Profil RSUD Al-Mulk */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
              <img
                src="/src/assets/images/rsud_almulk_logo_1792331924541.jpg"
                alt="Logo RSUD Al-Mulk"
                className="w-16 h-16 object-contain rounded-xl border border-slate-200"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Rumah Sakit Umum Daerah (RSUD) Al-Mulk Kota Sukabumi
                </h3>
                <p className="text-xs text-slate-500">
                  Pelayanan Kesehatan Holistik, Ramah, & Bermutu Tinggi
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              Status Operasional: Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nama Rumah Sakit</label>
              <input
                type="text"
                disabled
                value="RSUD Al-Mulk Kota Sukabumi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Klasifikasi Faskes</label>
              <input
                type="text"
                disabled
                value="Rumah Sakit Umum Daerah Tipe D Pratama / Paripurna"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Alamat Lengkap</label>
              <input
                type="text"
                disabled
                value="Jl. Pelabuhan II KM. 6, Kel. Cikondang, Kec. Citamiang, Kota Sukabumi, Jawa Barat"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Kontak & Call Center 24 Jam</label>
              <input
                type="text"
                disabled
                value="(0266) 625-1000 / Layanan SAPA PASIEN ext. 104"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-slate-700">Visi Pelayanan SAPA PASIEN</label>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                "Mewujudkan pelayanan rawat inap yang menjunjung tinggi empati, komunikasi humanis, pemenuhan kebutuhan spiritual dan sosiologis, serta penyelesaian setiap keluhan pasien secara tuntas demi kepuasan warga Kota Sukabumi."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Pengguna & Hak Akses */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Manajemen Pengguna & Otoritas Sistem
              </h3>
              <p className="text-xs text-slate-500">
                Hak akses dikonfigurasi berdasarkan peran pada kebijakan Supabase Row Level Security (RLS)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Nama Petugas</th>
                  <th className="py-2.5 px-3">Email Pengguna</th>
                  <th className="py-2.5 px-3">Unit / Jabatan</th>
                  <th className="py-2.5 px-3">Peran Akses (Role)</th>
                  <th className="py-2.5 px-3">Kewenangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEMO_ACCOUNTS.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900">{acc.full_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{acc.email}</td>
                    <td className="py-3 px-3 text-slate-600">{acc.department}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-blue-700 uppercase">{acc.role}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {acc.role === 'administrator' && 'Kelola akun, pengaturan, RLS, audit logs'}
                      {acc.role === 'supervisor' && 'Supervisi kunjungan, verifikasi keluhan selesai'}
                      {acc.role === 'petugas' && 'Input kunjungan pasien, update tindak lanjut'}
                      {acc.role === 'pimpinan' && 'Baca agregat dashboard & analisis (data pasien disamarkan)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Master Ruangan Rawat Inap */}
      {activeTab === 'wards' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Master Ruangan Rawat Inap RSUD Al-Mulk
              </h3>
              <p className="text-xs text-slate-500">
                Daftar bangsal rawat inap untuk pencatatan kunjungan sapa pasien
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {wards.map((w) => (
              <div
                key={w.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">{w.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Kode: <span className="font-mono">{w.code}</span> · Lantai {w.floor}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-700 text-sm">{w.capacity}</span>
                  <span className="text-[11px] text-slate-400 block">Kapasitas Bed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Kategori & SLA */}
      {activeTab === 'categories' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Master Kategori Masalah & Standar Waktu Respons (SLA)
            </h3>
            <p className="text-xs text-slate-500">
              Waktu target penyelesaian keluhan berdasarkan tingkat prioritas RSUD Al-Mulk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <span className="font-bold text-red-900 text-sm block">1. Prioritas Kritis</span>
              <p className="text-red-800 mt-1">
                Target Respons: <strong>&lt; 1 Jam</strong>
              </p>
              <p className="text-slate-600 text-[11px] mt-1">
                Meliputi isu keselamatan pasien, insiden kegawatdaruratan, atau ancaman henti napas/jantung. Dilaporkan lisan langsung.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-900 text-sm block">2. Prioritas Tinggi</span>
              <p className="text-amber-800 mt-1">
                Target Respons: <strong>&lt; 6 Jam</strong>
              </p>
              <p className="text-slate-600 text-[11px] mt-1">
                Meliputi kendala pasokan obat darurat, kegagalan listrik/alat bantu nafas di ruangan, atau kecemasan berat keluarga.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="font-bold text-blue-900 text-sm block">3. Prioritas Sedang</span>
              <p className="text-blue-800 mt-1">
                Target Respons: <strong>&lt; 24 Jam</strong>
              </p>
              <p className="text-slate-600 text-[11px] mt-1">
                Meliputi fasilitas fisik (AC kurang dingin, kran air macet), kendala administrasi jaminan, atau kebersihan kamar mandi.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 text-sm block">4. Prioritas Rendah</span>
              <p className="text-slate-800 mt-1">
                Target Respons: <strong>&lt; 48 Jam</strong>
              </p>
              <p className="text-slate-600 text-[11px] mt-1">
                Permintaan informasi umum, jadwal bimbingan rohani rutin, atau saran perbaikan non-urgent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Integrasi Supabase */}
      {activeTab === 'database' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pusat Koneksi & Integrasi Supabase PostgreSQL
              </h3>
              <p className="text-xs text-slate-500">
                Konektivitas cloud database, migrasi tabel, dan sinkronisasi realtime
              </p>
            </div>
            <button
              onClick={onOpenSupabaseModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
            >
              Buka Pengaturan Cepat
            </button>
          </div>

          <form onSubmit={handleTestSupabase} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://xyzproject.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
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
                  <p className="font-semibold">{testResult.success ? 'Berhasil' : 'Perhatian'}</p>
                  <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isTesting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                <span>{isTesting ? 'Menguji...' : 'Uji & Simpan Koneksi'}</span>
              </button>

              <button
                type="button"
                onClick={copyMigrationSql}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedMigration ? 'Tersalin!' : 'Salin SQL Migrasi'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: Audit Trail & Log */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Log Jejak Audit Sistem (Audit Trail)
              </h3>
              <p className="text-xs text-slate-500">
                Merekam setiap aktivitas penting, perubahan status, dan login pengguna untuk akuntabilitas RSUD Al-Mulk
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {auditLogs.length} Aktivitas Tercatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Waktu Kejadian</th>
                  <th className="py-2.5 px-3">Pengguna (Actor)</th>
                  <th className="py-2.5 px-3">Aksi (Action)</th>
                  <th className="py-2.5 px-3">Tabel Sasaran</th>
                  <th className="py-2.5 px-3">Rincian Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.actor_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-blue-700 font-semibold">{log.action}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{log.table_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <pre className="font-mono text-[11px] truncate max-w-xs">
                        {JSON.stringify(log.metadata || {})}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
