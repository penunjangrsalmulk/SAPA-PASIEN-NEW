import React, { useState } from 'react';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Key,
  Globe,
  UploadCloud,
  DownloadCloud,
  Check,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  resetSupabaseClient,
  isSupabaseConfigured,
  extractProjectRef,
  TestConnectionResult,
  TablesStatus,
} from '../../lib/supabase';
import { DataStore } from '../../lib/dataStore';
import { UNIVERSAL_SCHEMA_SQL } from '../../lib/supabaseSchema';

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
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedVarUrl, setCopiedVarUrl] = useState(false);
  const [copiedVarKey, setCopiedVarKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'koneksi' | 'sql' | 'vercel'>('koneksi');

  if (!isOpen) return null;

  const projectRef = extractProjectRef(url) || extractProjectRef(currentCreds.url);

  const handleTestAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      // Jika seluruh tabel sudah siap, lakukan background sync
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
    navigator.clipboard.writeText(UNIVERSAL_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyVercelUrl = () => {
    navigator.clipboard.writeText(url || 'https://your-project.supabase.co');
    setCopiedVarUrl(true);
    setTimeout(() => setCopiedVarUrl(false), 2500);
  };

  const handleCopyVercelKey = () => {
    navigator.clipboard.writeText(anonKey || 'your-anon-key');
    setCopiedVarKey(true);
    setTimeout(() => setCopiedVarKey(false), 2500);
  };

  const handleClear = () => {
    saveSupabaseCredentials('', '');
    setUrl('');
    setAnonKey('');
    resetSupabaseClient();
    setTestResult({
      success: true,
      message: 'Kredensial dibersihkan. Aplikasi beralih ke penyimpanan lokal browser.',
    });
    onConnectionChanged();
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Integrasi Database Cloud: Supabase ↔ Vercel
              </h2>
              <p className="text-xs text-slate-500">
                Pusat data bersama untuk Profil RS, Pengguna, Ruangan, dan Kunjungan Sapa Pasien
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('koneksi')}
            className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'koneksi'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Kredensial & Status
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>2. Script SQL Migrasi</span>
            {testResult && testResult.tablesReady === false && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-2.5 px-3.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'vercel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Panduan Hubungkan ke Vercel
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* TAB 1: KONEKSI & STATUS */}
          {activeTab === 'koneksi' && (
            <div className="space-y-4">
              {/* Context Alert */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-blue-950 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Mengapa Data Perlu Disimpan di Supabase Cloud?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-900">
                  Data yang disimpan di <em>localStorage</em> hanya ada di browser perangkat ini saja. Agar perubahan profil rumah sakit, master ruangan, akun petugas, dan formulir kunjungan bisa diakses bersamaan oleh semua orang di <strong>Vercel</strong>, kedua aplikasi harus menggunakan Supabase yang sama.
                </p>
              </div>

              {/* Form Input Credentials */}
              <form onSubmit={handleTestAndSave} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Supabase Project URL</span>
                      <span className="text-red-500">*</span>
                    </label>
                    {projectRef && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        Ref: {projectRef}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="https://xyzprojectid.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dapat dilihat di dashboard Supabase: <strong>Project Settings &rarr; API &rarr; Project URL</strong>.
                  </p>
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
                    Pastikan menyalin kunci bertuliskan <strong>"anon public"</strong> (bukan service_role atau password database).
                  </p>
                </div>

                {/* Test Result Feedback */}
                {testResult && (
                  <div
                    className={`p-4 rounded-xl border space-y-2.5 ${
                      testResult.success
                        ? testResult.tablesReady === false
                          ? 'bg-amber-50 text-amber-950 border-amber-300'
                          : 'bg-emerald-50 text-emerald-950 border-emerald-200'
                        : 'bg-red-50 text-red-950 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {testResult.success ? (
                        testResult.tablesReady === false ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                        )
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                      )}
                      <div className="space-y-1">
                        <p className="font-bold text-xs">
                          {testResult.success
                            ? testResult.tablesReady === false
                              ? 'Kredensial Valid! Langkah Berikutnya: Buat Tabel Database'
                              : 'Koneksi Berhasil & Seluruh Tabel Siap Digunakan'
                            : 'Koneksi Gagal Diperiksa'}
                        </p>
                        <p className="leading-relaxed text-[11px]">{testResult.message}</p>
                      </div>
                    </div>

                    {/* Table Status Breakdown if Available */}
                    {testResult.tablesStatus && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Status Kesiapan Tabel Database:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                          {(Object.keys(testResult.tablesStatus) as Array<keyof TablesStatus>).map((tbl) => (
                            <div
                              key={tbl}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono ${
                                testResult.tablesStatus![tbl]
                                  ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                                  : 'bg-red-100/70 border-red-300 text-red-900 font-semibold'
                              }`}
                            >
                              {testResult.tablesStatus![tbl] ? (
                                <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                              ) : (
                                <X className="w-3 h-3 text-red-700 shrink-0" />
                              )}
                              <span className="truncate">{tbl}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Action Button when Tables Missing */}
                    {testResult.success && testResult.tablesReady === false && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleCopySql();
                            setActiveTab('sql');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedSql ? 'Tersalin!' : 'Salin SQL Migrasi & Buka Tab SQL'}</span>
                        </button>

                        {projectRef && (
                          <a
                            href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors"
                          >
                            <span>Buka SQL Editor Supabase</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Form Buttons */}
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
                    onClick={() => setActiveTab('sql')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Lihat Script SQL</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
                  >
                    Gunakan Mode Offline
                  </button>
                </div>
              </form>

              {/* Sync Controls */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">Sinkronisasi Data Manual</h4>
                  <p className="text-[11px] text-slate-500">
                    Kirim data yang telah Anda edit di Google AI Studio ke cloud Supabase, atau unduh data terbaru dari cloud ke sistem ini.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePushToCloud}
                    disabled={pushing || !isConfigured}
                    className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 shadow-xs"
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
                    className={`text-[11px] font-medium p-2.5 rounded-lg border ${
                      syncStatusMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {syncStatusMsg.text}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SQL MIGRATION SCRIPT */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">Script SQL Migrasi Database</h3>
                    <p className="text-[11px] text-slate-500">
                      Eksekusi script ini di menu SQL Editor pada Supabase untuk membuat 6 tabel dan mengaktifkan hak akses universal.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Berhasil Disalin!' : 'Salin Script SQL'}</span>
                    </button>

                    {projectRef && (
                      <a
                        href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
                      >
                        <span>Buka SQL Editor ↗</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-[10px] leading-relaxed max-h-72 overflow-y-auto select-all">
                    {UNIVERSAL_SCHEMA_SQL}
                  </pre>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-950 space-y-1">
                <p className="font-semibold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Apa yang dilakukan script SQL ini?</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-900">
                  <li>Membuat tabel <code>app_settings</code>, <code>profiles</code>, <code>wards</code>, <code>visits</code>, <code>issues</code>, dan <code>audit_logs</code>.</li>
                  <li>Membuka izin schema public dan RLS universal untuk role anon (tanpa kendala 401/403).</li>
                  <li>Mengaktifkan publikasi real-time agar perubahan data langsung terdorong ke semua HP/laptop.</li>
                  <li>Memasukkan data master ruangan dan akun pengguna bawaan RSUD Al-Mulk.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN VERCEL */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Langkah Lengkap Sinkronisasi ke Vercel</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pada framework Vite + React, variabel lingkungan harus dipasang di panel proyek Vercel sebelum proses build agar pengguna publik di domain Vercel langsung tersambung ke database online.
                </p>

                <div className="space-y-3 pt-1">
                  {/* Step 1 */}
                  <div className="flex items-start gap-2.5 p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 text-xs">Buka Dashboard Vercel Anda</p>
                      <p className="text-[11px] text-slate-500">
                        Kunjungi <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline">vercel.com/dashboard</a> dan klik proyek aplikasi <strong>SAPA PASIEN</strong> Anda.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2.5 p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-slate-900 text-xs">
                        Buka Menu <em>Settings &rarr; Environment Variables</em>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Tambahkan 2 variabel lingkungan berikut dengan nilai proyek Supabase Anda:
                      </p>

                      <div className="space-y-2 pt-1 font-mono text-[11px]">
                        {/* Var 1 */}
                        <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-blue-700 font-bold">Key: </span>
                            <span className="text-slate-800 font-semibold">VITE_SUPABASE_URL</span>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              Value: {url || 'https://your-project.supabase.co'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyVercelUrl}
                            className="shrink-0 px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-700 hover:bg-slate-50 flex items-center gap-1 font-sans font-medium"
                          >
                            {copiedVarUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedVarUrl ? 'Tersalin' : 'Salin Nilai'}</span>
                          </button>
                        </div>

                        {/* Var 2 */}
                        <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-blue-700 font-bold">Key: </span>
                            <span className="text-slate-800 font-semibold">VITE_SUPABASE_ANON_KEY</span>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              Value: {anonKey ? `${anonKey.slice(0, 24)}...` : 'your-anon-key'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyVercelKey}
                            className="shrink-0 px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-700 hover:bg-slate-50 flex items-center gap-1 font-sans font-medium"
                          >
                            {copiedVarKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedVarKey ? 'Tersalin' : 'Salin Nilai'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-2.5 p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 text-xs">
                        Klik <strong>Deployments &rarr; Redeploy</strong> (Paling Penting!)
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Environment variables tidak akan aktif sampai Anda melakukan build ulang. Buka tab <strong>Deployments</strong> di Vercel, klik tombol titik tiga (<strong>...</strong>) di sebelah deployment teratas, lalu pilih <strong>Redeploy</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-xs">Hasil Akhir</p>
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        Sekarang aplikasi di Vercel dan Google AI Studio tersinkronisasi 100%! Data pasien yang dimasukkan petugas lewat HP di Vercel akan langsung masuk ke database Supabase dan otomatis tampil di dashboard Anda secara real-time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-600">
              {isConfigured ? '🟢 Supabase Cloud Terhubung' : '🟡 Mode Lokal (Demo)'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
