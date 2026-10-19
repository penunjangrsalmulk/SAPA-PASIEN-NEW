import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Filter,
  Calendar,
  Building,
  HeartHandshake,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Visit, Issue, Ward } from '../../types';
import { DataStore } from '../../lib/dataStore';

interface DashboardModuleProps {
  onNavigateToVisits: () => void;
  onNavigateToMonitoring: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  onNavigateToVisits,
  onNavigateToMonitoring,
}) => {
  const [visits, setVisits] = useState<Visit[]>(DataStore.getVisits());
  const [issues, setIssues] = useState<Issue[]>(DataStore.getIssues());
  const wards = useMemo(() => DataStore.getWards(), []);

  // Filters
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Real-time synchronization subscription
  React.useEffect(() => {
    const unsub = DataStore.subscribe(() => {
      setVisits(DataStore.getVisits());
      setIssues(DataStore.getIssues());
    });
    return () => unsub();
  }, []);

  // Filtered dataset
  const filteredVisits = useMemo(() => {
    const now = new Date();
    return visits.filter((v) => {
      const vDate = new Date(v.visited_at);
      if (timeFilter === 'today') {
        const isToday =
          vDate.getDate() === now.getDate() &&
          vDate.getMonth() === now.getMonth() &&
          vDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (timeFilter === '7days') {
        const diff = (now.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 7) return false;
      } else if (timeFilter === '30days') {
        const diff = (now.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 30) return false;
      }

      if (wardFilter !== 'all' && v.ward_id !== wardFilter) {
        return false;
      }

      return true;
    });
  }, [visits, timeFilter, wardFilter]);

  const filteredIssues = useMemo(() => {
    const visitIds = new Set(filteredVisits.map((v) => v.id));
    return issues.filter((i) => {
      if (!visitIds.has(i.visit_id)) return false;
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      return true;
    });
  }, [issues, filteredVisits, statusFilter]);

  // Dynamic 8 Indicators
  const todayVisitsCount = useMemo(() => {
    const now = new Date();
    return visits.filter((v) => {
      const d = new Date(v.visited_at);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [visits]);

  const uniquePatientsCount = useMemo(() => {
    const set = new Set(filteredVisits.map((v) => v.patient_name.trim().toLowerCase()));
    return set.size;
  }, [filteredVisits]);

  const totalIssuesCount = filteredIssues.length;

  const highPriorityOpenCount = useMemo(() => {
    return filteredIssues.filter(
      (i) => (i.priority === 'tinggi' || i.priority === 'kritis') && i.status !== 'selesai'
    ).length;
  }, [filteredIssues]);

  const inProgressCount = useMemo(() => {
    return filteredIssues.filter((i) => i.status === 'dalam_proses').length;
  }, [filteredIssues]);

  const resolvedCount = useMemo(() => {
    return filteredIssues.filter((i) => i.status === 'selesai').length;
  }, [filteredIssues]);

  const resolutionRatePercent = useMemo(() => {
    if (totalIssuesCount === 0) return null;
    return Math.round((resolvedCount / totalIssuesCount) * 100);
  }, [resolvedCount, totalIssuesCount]);

  const averageSatisfactionScore = useMemo(() => {
    let sum = 0;
    let count = 0;
    filteredVisits.forEach((v) => {
      const scores = [
        v.comfort_score,
        v.cleanliness_score,
        v.communication_score,
        v.responsiveness_score,
        v.overall_satisfaction_score,
      ].filter((s): s is number => s !== null && s !== undefined && s > 0);

      scores.forEach((sc) => {
        sum += sc;
        count++;
      });
    });

    if (count === 0) return null;
    return (sum / count).toFixed(1);
  }, [filteredVisits]);

  // Overdue issues (due_at < now and status != selesai)
  const overdueIssues = useMemo(() => {
    const nowTime = new Date().getTime();
    return filteredIssues.filter((i) => {
      if (i.status === 'selesai' || !i.due_at) return false;
      return new Date(i.due_at).getTime() < nowTime;
    });
  }, [filteredIssues]);

  // Chart data: Visits by ward
  const visitsByWardData = useMemo(() => {
    const map: Record<string, number> = {};
    wards.forEach((w) => {
      map[w.name.split(' ')[1] || w.name] = 0;
    });

    filteredVisits.forEach((v) => {
      const ward = wards.find((w) => w.id === v.ward_id);
      const name = ward ? ward.name.split(' ')[1] || ward.name : 'Lainnya';
      map[name] = (map[name] || 0) + 1;
    });

    return Object.entries(map).map(([name, count]) => ({
      name,
      kunjungan: count,
    }));
  }, [filteredVisits, wards]);

  // Chart data: Issues by Category
  const issuesByCategoryData = useMemo(() => {
    const catMap: Record<string, number> = {
      pelayanan: 0,
      fasilitas: 0,
      kebersihan: 0,
      komunikasi: 0,
      kenyamanan: 0,
      dukungan_sosial: 0,
      dukungan_psikologis: 0,
      dukungan_spiritual: 0,
      lainnya: 0,
    };

    filteredIssues.forEach((i) => {
      catMap[i.category] = (catMap[i.category] || 0) + 1;
    });

    const labels: Record<string, string> = {
      pelayanan: 'Pelayanan',
      fasilitas: 'Fasilitas',
      kebersihan: 'Kebersihan',
      komunikasi: 'Komunikasi',
      kenyamanan: 'Kenyamanan',
      dukungan_sosial: 'Sosial',
      dukungan_psikologis: 'Psikologis',
      dukungan_spiritual: 'Spiritual',
      lainnya: 'Lainnya',
    };

    return Object.entries(catMap)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        name: labels[key] || key,
        jumlah: count,
      }));
  }, [filteredIssues]);

  // Chart data: Trend of visits (grouped by date)
  const trendData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    const sorted = [...filteredVisits].sort(
      (a, b) => new Date(a.visited_at).getTime() - new Date(b.visited_at).getTime()
    );

    sorted.forEach((v) => {
      const dateKey = new Date(v.visited_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
    });

    return Object.entries(dateMap).map(([tanggal, jumlah]) => ({
      tanggal,
      kunjungan: jumlah,
    }));
  }, [filteredVisits]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const statuses = [
      { key: 'belum_ditindaklanjuti', label: 'Belum Ditindaklanjuti', color: '#94A3B8' },
      { key: 'dalam_proses', label: 'Dalam Proses', color: '#3B82F6' },
      { key: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi', color: '#F59E0B' },
      { key: 'selesai', label: 'Selesai', color: '#10B981' },
      { key: 'diteruskan', label: 'Diteruskan ke Unit', color: '#8B5CF6' },
    ];

    return statuses.map((s) => ({
      ...s,
      count: filteredIssues.filter((i) => i.status === s.key).length,
    }));
  }, [filteredIssues]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hospital Banner & Quick Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-teal-800 rounded-2xl p-6 text-white shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-200">
              <span>RSUD Al-Mulk Kota Sukabumi</span>
              <span aria-hidden="true">·</span>
              <span>Sistem Monitoring Kunjungan Rawat Inap</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              SAPA PASIEN — Humanis, Responsif, & Tuntas
            </h2>
            <p className="text-xs text-blue-100/90 max-w-2xl leading-relaxed">
              Memantau kebutuhan holistik pasien rawat inap meliputi aspek sosiologis, psikologis, spiritual, dan kenyamanan fasilitas secara realtime.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToVisits}
              className="px-4 py-2 bg-white text-blue-900 font-semibold text-xs rounded-lg hover:bg-blue-50 transition-colors shadow-xs"
            >
              + Input Kunjungan Baru
            </button>
            <button
              onClick={onNavigateToMonitoring}
              className="px-3.5 py-2 bg-blue-700/60 hover:bg-blue-700 text-white font-medium text-xs rounded-lg border border-blue-400/30 transition-colors"
            >
              Lihat Monitoring Pasien
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filter Data Dashboard</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Time Filter Tabs */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: '7days', label: '7 Hari' },
              { id: '30days', label: '30 Hari' },
              { id: 'all', label: 'Semua Periode' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id as any)}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  timeFilter === t.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Ward Selector */}
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Ruangan Rawat Inap</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status Masalah</option>
            <option value="belum_ditindaklanjuti">Belum Ditindaklanjuti</option>
            <option value="dalam_proses">Dalam Proses</option>
            <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* 8 Dynamic KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Kunjungan Hari Ini */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Kunjungan Hari Ini</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {todayVisitsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total tercatat tanggal hari ini</div>
        </div>

        {/* Card 2: Pasien Unik */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Pasien Unik Dikunjungi</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {uniquePatientsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Dihitung per No Rekam Medis</div>
        </div>

        {/* Card 3: Total Masalah Ditemukan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Total Masalah/Keluhan</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalIssuesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pada periode filter aktif</div>
        </div>

        {/* Card 4: Prioritas Tinggi Terbuka */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Prioritas Tinggi / Kritis</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-600">
            {highPriorityOpenCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Perlu respons cepat segera</div>
        </div>

        {/* Card 5: Tindak Lanjut Sedang Proses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Sedang Diproses</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {inProgressCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Dalam pengerjaan unit terkait</div>
        </div>

        {/* Card 6: Tindak Lanjut Selesai */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Tindak Lanjut Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            {resolvedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Masalah telah terselesaikan</div>
        </div>

        {/* Card 7: Persentase Penyelesaian */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Penyelesaian Tindak Lanjut</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {resolutionRatePercent !== null ? `${resolutionRatePercent}%` : 'Tidak ada data'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Selesai dibanding total keluhan</div>
        </div>

        {/* Card 8: Rata-rata Skor Kepuasan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Skor Kepuasan Pasien</span>
            <HeartHandshake className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 flex items-baseline gap-1">
            <span>{averageSatisfactionScore || 'Belum dinilai'}</span>
            {averageSatisfactionScore && <span className="text-xs text-slate-400 font-normal">/ 5.0</span>}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Berdasarkan observasi kepuasan</div>
        </div>
      </div>

      {/* Overdue Warning Alert if any */}
      {overdueIssues.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-amber-900">
            <span className="font-bold block text-sm">
              Perhatian: {overdueIssues.length} Tindak Lanjut Melewati Target Waktu Penyelesaian!
            </span>
            <p className="mt-0.5 text-amber-800">
              Terdapat keluhan yang belum berstatus 'selesai' dan telah melewati batas target penyelesaian. Segera lakukan koordinasi dengan supervisor atau kepala ruangan terkait.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {overdueIssues.map((oi) => (
                <div
                  key={oi.id}
                  className="bg-white/80 border border-amber-300 rounded-md px-2.5 py-1 text-[11px] flex items-center gap-2"
                >
                  <span className="font-semibold">{oi.patient_name}</span>
                  <span className="text-amber-700">({oi.ward_name})</span>
                  <span className="text-slate-500">· Kategori: {oi.category}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onNavigateToMonitoring}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg shrink-0 transition-colors"
          >
            Tindak Lanjuti Sekarang
          </button>
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Kunjungan per Ruangan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Distribusi Kunjungan per Ruangan</h3>
              <p className="text-xs text-slate-500">Jumlah kunjungan petugas sapa pasien di tiap bangsal</p>
            </div>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitsByWardData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="kunjungan" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Kategori Masalah / Keluhan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Distribusi Kategori Masalah</h3>
              <p className="text-xs text-slate-500">Keluhan yang teridentifikasi selama observasi pasien</p>
            </div>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64 w-full">
            {issuesByCategoryData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Check className="w-8 h-8 text-emerald-500 mb-1" />
                <span>Tidak ada masalah tercatat pada filter ini.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issuesByCategoryData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="jumlah" fill="#0D9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Tren Kunjungan Harian */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Tren Waktu Kunjungan</h3>
              <p className="text-xs text-slate-500">Fluktuasi aktivitas sapa pasien rawat inap</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64 w-full">
            {trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Belum ada data kunjungan pada rentang ini.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kunjungan"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Tindak Lanjut Progress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Status Penanganan Masalah Pasien</h3>
                <p className="text-xs text-slate-500">Progres resolusi tindak lanjut oleh unit rumah sakit</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3.5 my-4">
              {statusBreakdown.map((s) => {
                const pct = totalIssuesCount > 0 ? Math.round((s.count / totalIssuesCount) * 100) : 0;
                return (
                  <div key={s.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{s.label}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {s.count} keluhan ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standar Waktu Penyelesaian (SLA): 24–48 Jam</span>
            <button
              onClick={onNavigateToMonitoring}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Kelola di Monitoring
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Visits & High Priority Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visits */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Kunjungan Terbaru</h3>
            <button
              onClick={onNavigateToMonitoring}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
            >
              Lihat Semua
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredVisits.slice(0, 5).map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{v.patient_name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-medium">{v.room_number}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {v.ward_name} — {v.room_number} · Oleh {v.visitor_name}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                      v.has_issue
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {v.has_issue ? 'Ada Catatan' : 'Optimal'}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(v.visited_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Priority Issues List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Isu Perhatian & Prioritas</h3>
            <button
              onClick={onNavigateToMonitoring}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
            >
              Ke Tabel Monitoring
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredIssues.slice(0, 5).map((iss) => (
              <div key={iss.id} className="py-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        iss.priority === 'kritis'
                          ? 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded'
                          : iss.priority === 'tinggi'
                          ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded'
                          : 'text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded'
                      }`}
                    >
                      {iss.priority}
                    </span>
                    <span className="font-semibold text-slate-900">{iss.patient_name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 capitalize">
                    {iss.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-1">{iss.description}</p>
                <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Unit: {iss.assigned_unit || 'Belum ditugaskan'}</span>
                  <span>·</span>
                  <span>{iss.ward_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
